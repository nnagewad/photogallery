import 'dotenv/config';
import fs from 'fs/promises';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

export async function analyzeImage(filePath, existingTitles = [], existingTags = []) {
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
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: 'You are a perceptive photograher and accessibility expert.',
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
            text: `Analyze this image. Return a short title that could be a title for a highbrow film, a useful alt text for screen readers, and 5-10 descriptive tags in an array.
            ${existingTitles.length > 0 ? `IMPORTANT: Avoid using any of these existing titles that are already used in the gallery:
            ${existingTitles.map(title => `- "${title}"`).join('\n')}
            Make sure your title is completely different and unique from all of the above.` : ''}
            ${existingTags.length > 0 ? `IMPORTANT: Before creating new tags, check this list of existing tags used in the gallery and reuse them where they fit. Only create a new tag if none of the existing tags adequately describe the concept:
            ${existingTags.map(tag => `"${tag}"`).join(', ')}` : ''}
            Respond only as JSON like:
            {
              "title": "...",
              "alt": "...",
              "tags": ["...", "..."]
            }`
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
  const msg = data.content.find(block => block.type === 'text');
  if (data.stop_reason === 'refusal') {
    throw new Error('Claude refused to generate content');
  }

  if (!msg) {
    throw new Error(`No text block in response. stop_reason: ${data.stop_reason}, blocks: ${JSON.stringify(data.content.map(b => b.type))}`);
  }

  try {
    const cleaned = msg.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Claude response is not valid JSON: ${msg.text}`);
  }
}
