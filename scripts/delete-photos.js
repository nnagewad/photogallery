import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const [filename] = process.argv.slice(2);
if (!filename) {
  console.error('Check the filename');
  process.exit(1);
}

const run = async () => {
  try {
    await execAsync(`node scripts/remove-photos.js ${filename}`);
    await execAsync(`node scripts/update-gallery.js`);
    console.log('Success: The photo and thumbnail has been deleted and the gallery json file has been updated.');
  } catch (err) {
    console.error('Error:', err.message);
  }
};

run();
