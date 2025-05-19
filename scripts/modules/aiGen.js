import fs from 'fs/promises';
import fetch from 'node-fetch';
import {CLAUDE_API_KEY} from './apiCredentials.js';

export async function analyzeImage(filePath) {
  const imageBuffer = await fs.readFile(filePath);
  const base64Image = imageBuffer.toString('base64');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            },
            {
              type: 'text',
              text:
                'Analyze this image. Return a short title that could be a title for a highbrow film, a useful alt text for screen readers, and 5-10 descriptive tags in an array. Respond only as JSON like: {"title": "...", "alt": "...", "tags": ["...", "..."]}'
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();

  try {
    return JSON.parse(data.content[0].text); // The Claude reply is in the `text` key
  } catch {
    throw new Error('Claude response is not valid JSON');
  }
}
