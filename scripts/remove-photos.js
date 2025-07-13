// delete-file.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [filename] = process.argv.slice(2);

const folders = [
  path.join(__dirname, '../src/img/photos'),
  path.join(__dirname, '../src/img/thumbnails'),
  path.join(__dirname, '../src/img/open-graph')
];

async function deleteFile(filename, folder) {
  const filePath = path.join(folder, filename);
  try {
    await fs.unlink(filePath);
    console.log(`Deleted: ${filePath}`);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`File not found: ${filePath}`);
      return false;
    } else {
      console.error(`Error deleting ${filePath}:`, err.message);
      return false;
    }
  }
}

if (!filename) {
  console.error('Usage: node delete-file.js <filename>');
  process.exit(1);
}

let deletedAtLeastOne = false;
for (const folder of folders) {
  const deleted = await deleteFile(filename, folder);
  if (deleted) deletedAtLeastOne = true;
}

if (!deletedAtLeastOne) {
  console.error(`No files deleted. "${filename}" not found in any folder.`);
  process.exit(1);
}
