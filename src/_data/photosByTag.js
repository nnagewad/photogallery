import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const photogallery = JSON.parse(readFileSync(join(__dirname, 'photogallery.json'), 'utf-8'));

function normalizeTag(tag) {
  return String(tag)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function () {
  const tagMap = {};

  for (const photo of photogallery) {
    if (!photo.tags) continue;
    for (const tag of photo.tags) {
      const key = normalizeTag(tag);
      if (!tagMap[key]) {
        tagMap[key] = [];
      }
      tagMap[key].push(photo);
    }
  }

  const sorted = {};
  for (const key of Object.keys(tagMap).sort()) {
    sorted[key] = tagMap[key];
  }

  return sorted;
}
