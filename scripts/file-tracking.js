import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import vision from '@google-cloud/vision';
import ExifReader from 'exifreader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, './google-credentials.json')
});

const folderPath = path.join(__dirname, '../src/photos');
const jsonPath = path.join(__dirname, '../src/_data/photogallery.json');

// --------- Helper: EXIF parsing ---------
async function extractExif(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const tags = ExifReader.load(buffer);

    const make = tags.Make?.description || '';
    const model = tags.Model?.description || '';
    const lens = tags.LensModel?.description || '';
    const iso = tags.ISOSpeedRatings?.description || tags.ISO?.description || null;
    const shutterSpeed = tags.ExposureTime?.description || null;
    const aperture = tags.FNumber?.description || tags.ApertureValue?.description || null;
    const dateTaken = tags.DateTimeOriginal?.description || null;

    // Use decimal values directly
    const lat = typeof tags.GPSLatitude?.description === 'number' ? tags.GPSLatitude.description : null;
    const lon = typeof tags.GPSLongitude?.description === 'number' ? tags.GPSLongitude.description : null;

    return {
      camera: `${make} ${model}`.trim(),
      lens,
      iso,
      shutterSpeed,
      aperture,
      dateTaken,
      gps: lat && lon ? { lat, lon } : null
    };
  } catch (err) {
    console.warn(`EXIF extraction failed for ${filePath}:`, err.message);
    return {};
  }
}

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

// Find new files not yet in knownFiles
const newFiles = filteredCurrentFiles.filter(f => !knownFilenames.includes(f));

// --------- Process new files ---------
if (newFiles.length > 0) {
  const newEntries = await Promise.all(
    newFiles.map(async (file) => {
      const filePath = path.join(folderPath, file);

      // Get EXIF metadata
      const exif = await extractExif(filePath);

      // Get Vision API tags
      const [result] = await client.labelDetection(filePath);
      const labels = result.labelAnnotations || [];
      const tags = labels.slice(0, 10).map(label => label.description.toLowerCase());

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
