import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import vision from '@google-cloud/vision';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, '../google-credentials.json')
});

export default async function updateFileList() {
  const folderPath = path.join(__dirname, '../src/photos');
  const jsonPath = path.join(__dirname, '../src/_data/photogallery.json');

  // Load existing JSON safely
  let knownFiles = [];
  try {
    const data = await fs.readFile(jsonPath, 'utf-8');
    knownFiles = JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') {
      knownFiles = [];
    } else {
      console.error("Error parsing JSON file:", err);
      knownFiles = [];
    }
  }

  const knownFilenames = knownFiles.map(item => item.filename);
  const currentFiles = await fs.readdir(folderPath);

  // Filter files that are new
  const newFiles = currentFiles.filter(f => {
    // Ignore .DS_Store and other hidden files starting with dot
    if (f.startsWith('.')) return false;
    return !knownFilenames.includes(f);
  });

  if (newFiles.length > 0) {
    const newEntries = await Promise.all(
      newFiles.map(async (file) => {
        const filePath = path.join(folderPath, file);

        // Call Vision API label detection
        const [result] = await client.labelDetection(filePath);
        const labels = result.labelAnnotations || [];
        const tags = labels.slice(0, 10).map(label => label.description.toLowerCase());

        return {
          filename: file,
          image: `/photos/${file}`,
          tags,
          alt: `Photo of ${tags.join(', ')}` // Simple alt text from tags
        };
      })
    );

    const updatedList = [...knownFiles, ...newEntries];
    await fs.writeFile(jsonPath, JSON.stringify(updatedList, null, 2));
    console.log(`Added ${newEntries.length} new file(s):`, newFiles);
  } else {
    console.log('No new files found.');
  }
}
