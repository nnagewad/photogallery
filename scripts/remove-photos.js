// delete-file.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get arguments from command line
const [filename] = process.argv.slice(2);

const folder1 = path.join(__dirname, '../src/img/photos'); // update paths as needed
const folder2 = path.join(__dirname, '../src/img/thumbnails');

async function deleteFile(filename, folder) {
  const filePath = path.join(folder, filename);
  try {
    await fs.unlink(filePath);
    console.log(`Deleted: ${filePath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`File not found: ${filePath}`);
    } else {
      console.error(`Error deleting ${filePath}:`, err.message);
    }
  }
}

if (!filename) {
  console.error('Usage: node delete-file.js <filename>');
  process.exit(1);
}

await deleteFile(filename, folder1);
await deleteFile(filename, folder2);
