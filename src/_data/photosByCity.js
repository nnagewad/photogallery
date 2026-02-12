import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const photogallery = JSON.parse(readFileSync(join(__dirname, 'photogallery.json'), 'utf-8'));

export default function () {
  const cityMap = {};

  for (const photo of photogallery) {
    if (photo.localized == null) continue;
    const key = photo.localized;
    if (!cityMap[key]) {
      cityMap[key] = [];
    }
    cityMap[key].push(photo);
  }

  const sorted = {};
  for (const key of Object.keys(cityMap).sort()) {
    sorted[key] = cityMap[key];
  }

  return sorted;
}
