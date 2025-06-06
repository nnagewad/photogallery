import fs from 'fs/promises';
import ExifReader from 'exifreader';

// Convert [numerator, denominator] rational to number
function rationalToNumber(rational) {
  if (typeof rational === 'number') return rational;
  if (Array.isArray(rational) && rational.length === 2) {
    return rational[0] / rational[1];
  }
  return null;
}

// Convert [degrees, minutes, seconds] + ref into decimal degrees
function dmsToDecimal(dms, ref) {
  if (!Array.isArray(dms) || dms.length !== 3) return null;

  const degrees = rationalToNumber(dms[0]);
  const minutes = rationalToNumber(dms[1]);
  const seconds = rationalToNumber(dms[2]);
  if ([degrees, minutes, seconds].some((v) => v === null)) return null;

  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (ref === 'S' || ref === 'W') decimal *= -1;
  return decimal;
}

export async function extractPhotoData(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const tags = ExifReader.load(buffer);

    const model = tags.Model?.description || '';
    const lens = tags.LensModel?.description || '';
    const iso = tags.ISOSpeedRatings?.description || tags.ISO?.description || null;
    const shutterSpeed = tags.ExposureTime?.description || null;
    const aperture = tags.FNumber?.description || tags.ApertureValue?.description || null;
    const dateTaken = tags.DateTimeOriginal?.description || null;

    // Note: Ref is inside array, take first element
    const rawLat = tags.GPSLatitude?.value;
    const rawLon = tags.GPSLongitude?.value;
    const latRef = tags.GPSLatitudeRef?.value?.[0];
    const lonRef = tags.GPSLongitudeRef?.value?.[0];

    const lat = Array.isArray(rawLat) ? dmsToDecimal(rawLat, latRef) : null;
    const lon = Array.isArray(rawLon) ? dmsToDecimal(rawLon, lonRef) : null;

    return {
      camera: `${model}`.trim(),
      lens,
      iso,
      shutterSpeed,
      aperture,
      dateTaken,
      gps: lat != null && lon != null ? { lat, lon } : null
    };
  } catch (err) {
    console.warn(`EXIF extraction failed for ${filePath}:`, err.message);
    return {};
  }
}