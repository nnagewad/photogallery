import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { processPhoto } from './modules/photoProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folderPath = path.join(__dirname, '../src/img/photos');
const jsonPath = path.join(__dirname, '../src/_data/photogallery.json');

let knownFiles = [];
try {
  const data = await fs.readFile(jsonPath, 'utf-8');
  knownFiles = JSON.parse(data || '[]');
} catch (err) {
  knownFiles = [];
}

const currentFiles = await fs.readdir(folderPath);
const filteredCurrentFiles = currentFiles.filter(f => !f.startsWith('.'));
knownFiles = knownFiles.filter(entry => filteredCurrentFiles.includes(entry.filename));

const knownFilenames = knownFiles.map(item => item.filename);
const newFiles = filteredCurrentFiles.filter(f => !knownFilenames.includes(f));

if (newFiles.length > 0) {
  // Extract existing titles for AI to avoid duplicates
  const existingTitles = knownFiles.map(item => item.title).filter(Boolean);
  
  const newEntries = await Promise.all(
    newFiles.map(file => processPhoto(file, folderPath, existingTitles))
  );
  knownFiles = [...newEntries, ...knownFiles];
  console.log(`Added ${newEntries.length} new file(s):`, newFiles);
} else {
  console.log('No new files found.');
}

await fs.writeFile(jsonPath, JSON.stringify(knownFiles, null, 2));
