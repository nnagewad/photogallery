import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Handle __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const folderPath = path.join(__dirname, '../src/photos');
const jsonPath = path.join(__dirname, '../src/_data/photogallery.json');

// Load existing JSON or initialize empty array
let knownFiles = [];
try {
  const data = await fs.readFile(jsonPath, 'utf-8');
  knownFiles = JSON.parse(data);
} catch (err) {
  if (err.code !== 'ENOENT') throw err; // Ignore file-not-found error
}

// Extract existing filenames
const knownFilenames = knownFiles.map(item => item.filename);

// Read current files in the folder
const currentFiles = await fs.readdir(folderPath);

// Find new files
const newFiles = currentFiles.filter(f => !knownFilenames.includes(f));

// Add metadata and update JSON
if (newFiles.length > 0) {
  const newEntries = await Promise.all(
    newFiles.map(async file => {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);
      return {
        filename: file,
        image: `/photos/${file}`
      };
    })
  );

  const updatedList = [...knownFiles, ...newEntries];
  await fs.writeFile(jsonPath, JSON.stringify(updatedList, null, 2));
  console.log(`Added ${newEntries.length} new file(s):`, newFiles);
} else {
  console.log('No new files found.');
}
