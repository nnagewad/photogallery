import { fileURLToPath } from 'url';
import path from 'path';
import vision from '@google-cloud/vision';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, './google-credentials.json')
});

/**
 * Run label detection on an image file and return an array of tags.
 * @param {string} filePath - Full path to the image file.
 * @returns {Promise<string[]>} Array of tags (labels) describing the image.
 */
export async function detectLabels(filePath) {
  const [result] = await client.labelDetection(filePath);
  const labels = result.labelAnnotations || [];
  return labels.slice(0, 10).map(label => label.description.toLowerCase());
}