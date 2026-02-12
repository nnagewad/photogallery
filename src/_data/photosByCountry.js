import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const photogallery = JSON.parse(readFileSync(join(__dirname, 'photogallery.json'), 'utf-8'));

export default function () {
  const countryMap = {};

  for (const photo of photogallery) {
    if (photo.gps == null) continue;
    const key = photo.country;
    if (!key) continue;
    if (!countryMap[key]) {
      countryMap[key] = [];
    }
    countryMap[key].push(photo);
  }

  const sorted = {};
  for (const key of Object.keys(countryMap).sort()) {
    sorted[key] = countryMap[key];
  }

  return sorted;
}
