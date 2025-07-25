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

  // Create thumbnail if it doesn't already exist
  try {
    const thumbnailDir = path.join(folderPath, '..', 'thumbnails');
    await fs.mkdir(thumbnailDir, { recursive: true });

    const thumbPath = path.join(thumbnailDir, file);

    try {
      await fs.access(thumbPath); // Will throw if file doesn't exist
      console.log(`Thumbnail already exists for ${file}, skipping.`);
    } catch {
      await sharp(filePath)
        .resize(450, 450, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 80,
          mozjpeg: true,
          progressive: true
        })
        .toFile(thumbPath);
      console.log(`Thumbnail created for ${file}.`);
    }
  } catch (err) {
    console.warn(`Failed to create thumbnail for ${file}:`, err.message);
  }

  // Create open-graph image if it doesn't already exist
  try {
    const openGraphDir = path.join(folderPath, '..', 'open-graph');
    await fs.mkdir(openGraphDir, { recursive: true });

    const openGraphPath = path.join(openGraphDir, file);

    try {
      await fs.access(openGraphPath); // Will throw if file doesn't exist
      console.log(`Open-graph image already exists for ${file}, skipping.`);
    } catch {
      await sharp(filePath)
        .resize(1200, 630, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 80,
          mozjpeg: true,
          progressive: true
        })
        .toFile(openGraphPath);
      console.log(`Open-graph image created for ${file}.`);
    }
  } catch (err) {
    console.warn(`Failed to create Open-graph image for ${file}:`, err.message);
  }

  return {
    filename: file,
    image: `/img/photos/${file}`,
    thumbnail: `/img/thumbnails/${file}`,
    opengraph: `/img/open-graph/${file}`,
    ...exif,
    localized,
    country,
    title,
    alt,
    tags,
    dateAdded: new Date().toUTCString()
  };
}
