import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractExif } from './exfir.js';
import { detectLabels } from './vision.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, './google-credentials.json')
});

const folderPath = path.join(__dirname, '../src/photos');
const jsonPath = path.join(__dirname, '../src/_data/photogallery.json');

// --------- Load existing JSON ---------
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

// --------- Detect new files ---------
const currentFiles = await fs.readdir(folderPath);

// Filter out hidden/system files (like .DS_Store)
const filteredCurrentFiles = currentFiles.filter(f => !f.startsWith('.'));

// Remove entries for files no longer in the folder
knownFiles = knownFiles.filter(entry => filteredCurrentFiles.includes(entry.filename));

// Extract updated filenames after filtering deletions
const knownFilenames = knownFiles.map(item => item.filename);
const newFiles = filteredCurrentFiles.filter(f => !knownFilenames.includes(f));

// --------- Process new files ---------
if (newFiles.length > 0) {
  const newEntries = await Promise.all(
    newFiles.map(async (file) => {
      const filePath = path.join(folderPath, file);

      // Get EXIF metadata
      const exif = await extractExif(filePath);

      // Get Vision API tags
      const tags = await detectLabels(filePath);

      return {
        filename: file,
        image: `/photos/${file}`,
        ...exif,
        tags,
        alt: `Photo of ${tags.join(', ')}`
      };
    })
  );

  knownFiles = [...knownFiles, ...newEntries];
  console.log(`Added ${newEntries.length} new file(s):`, newFiles);
} else {
  console.log('No new files found.');
}

// --------- Save updated JSON ---------
await fs.writeFile(jsonPath, JSON.stringify(knownFiles, null, 2));
