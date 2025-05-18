import fs from 'fs/promises';
import ExifReader from 'exifreader';

export async function extractExif(filePath) {
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