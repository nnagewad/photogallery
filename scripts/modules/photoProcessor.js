import { extractPhotoData } from './exifr.js';
import { reverseGeocode } from './geocode.js';
import { analyzeImage } from './aiGen.js';
import path from 'path';

export async function processPhoto(file, folderPath) {
  const filePath = path.join(folderPath, file);

  // Extract EXIF
  const exif = await extractPhotoData(filePath);

  // Analyze with Claude
  let title = null, tags = [], alt = '';
  try {
    const result = await analyzeImage(filePath);
    title = result.title;
    tags = result.tags;
    alt = result.alt;
  } catch (err) {
    console.warn(`Claude failed on ${file}:`, err.message);
  }

  // Reverse geocoding if GPS
  let localized = null, country = null;
  if (exif.gps?.lat && exif.gps?.lon) {
    const location = await reverseGeocode(exif.gps.lat, exif.gps.lon);
    localized = location.localized;
    country = location.country;
  }

  return {
    filename: file,
    image: `/photos/${file}`,
    ...exif,
    localized,
    country,
    title,
    tags,
    alt
  };
}
