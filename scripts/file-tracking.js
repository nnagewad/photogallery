import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import vision from '@google-cloud/vision';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, './google-credentials.json')
});


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

// Read current files in the folder
const currentFiles = await fs.readdir(folderPath);

// Filter out hidden/system files (like .DS_Store)
const filteredCurrentFiles = currentFiles.filter(f => !f.startsWith('.'));

// Remove entries for files no longer in the folder
knownFiles = knownFiles.filter(entry => filteredCurrentFiles.includes(entry.filename));

// Extract updated filenames after filtering deletions
const knownFilenames = knownFiles.map(item => item.filename);

// Find new files not yet in knownFiles
const newFiles = filteredCurrentFiles.filter(f => !knownFilenames.includes(f));

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

  knownFiles = [...knownFiles, ...newEntries];
  console.log(`Added ${newEntries.length} new file(s):`, newFiles);
} else {
  console.log('No new files found.');
}

// Write updated JSON with both deletions and additions accounted for
await fs.writeFile(jsonPath, JSON.stringify(knownFiles, null, 2));

