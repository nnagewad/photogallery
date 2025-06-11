import { extractPhotoData } from './exifr.js';
import { reverseGeocode } from './geocode.js';
import { analyzeImage } from './aiGen.js';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs/promises';

export async function processPhoto(file, folderPath) {
  const filePath = path.join(folderPath, file);

  // Extract EXIF
  const exif = await extractPhotoData(filePath);

  // Reverse geocoding if GPS
  let localized = null, country = null;
  if (exif.gps?.lat && exif.gps?.lon) {
    const location = await reverseGeocode(exif.gps.lat, exif.gps.lon);
    localized = location.localized;
    country = location.country;
  }

  // Analyze with Claude
  let title = null, alt = '', tags = [];
  try {
    const result = await analyzeImage(filePath);
    title = result.title;
    tags = result.tags;
    alt = result.alt;
  } catch (err) {
    console.warn(`Claude failed on ${file}:`, err.message);
  }

  // Resize and optimize image to third the size
  try {
    // Resize, optimize and overwrite by writing to a temp file and replacing original
    await sharp(filePath)
      .jpeg({
        quality: 80,
        mozjpeg: true,
        progressive: true
      })
      .toFile(filePath + '.tmp');

    await fs.rename(filePath + '.tmp', filePath);
  } catch (err) {
    console.warn(`Failed to resize image ${file}:`, err.message);
  }

  return {
    filename: file,
    image: `/photos/${file}`,
    ...exif,
    localized,
    country,
    title,
    alt,
    tags
  };
}
