import { AnalysisResult } from '../types';

// ─── Config ───────────────────────────────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// ─── Prompt ───────────────────────────────────────────────────────────────────

const ANALYSIS_PROMPT = `You are a world-renowned antique appraiser and art historian with 30 years of field experience. You ALWAYS give a decisive verdict. You never refuse to judge.

Examine the image carefully and return ONLY a raw JSON object — absolutely no markdown, no code fences, no explanation before or after.

JSON schema:
{
  "authenticity": "Real" | "Fake" | "Uncertain",
  "confidence": <integer 0-100>,
  "title": "<specific object name>",
  "estimatedPeriod": "<date range, e.g. 1860–1880, or 'Modern reproduction'>",
  "origin": "<country or region of manufacture>",
  "description": "<2-3 sentences: describe what you see and WHY you classified it as Real, Fake, or Uncertain based on visible details>",
  "estimatedPrice": "<market value range in USD, e.g. $500 – $1,200>",
  "authenticPrice": "<only include if Fake: what the genuine original sells for, e.g. $8,000 – $15,000>"
}

Classification rules — follow these strictly:
- "Real": the object shows genuine age indicators (patina, wear patterns, hand-craftsmanship, period-correct materials, maker's marks). Confidence 70–95.
- "Fake": the object is a modern reproduction, mass-produced imitation, or clearly not an antique (factory finish, plastic parts, modern hardware, copyright marks, contemporary design). Also use Fake for any clearly modern everyday object that is NOT an antique. Confidence 75–97.
- "Uncertain": ONLY use this when the image quality is too poor to judge, or the object is partially hidden, or evidence is genuinely contradictory. Do NOT use Uncertain simply because you are unsure — make your best professional judgment. Confidence 40–65.

Pricing rules:
- Always include "estimatedPrice" for Real and Fake objects
- For Fake: "estimatedPrice" = what this reproduction sells for; "authenticPrice" = what the genuine antique original is worth
- OMIT "estimatedPrice" and "authenticPrice" ONLY when authenticity is "Uncertain"

Important: if the image shows a modern everyday object (phone, laptop, shoe, food, etc.), classify it as "Fake" with a note in description that it is not an antique, and set estimatedPrice to its approximate resale value.`;

// ─── Response parser ──────────────────────────────────────────────────────────

function parseResponse(content: string): AnalysisResult {
  // Strip markdown code fences if the model wraps the JSON
  const cleaned = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!['Real', 'Fake', 'Uncertain'].includes(parsed.authenticity)) {
    throw new Error(`Unexpected authenticity value: ${parsed.authenticity}`);
  }

  const result: AnalysisResult = {
    authenticity: parsed.authenticity,
    confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 50)),
    title: String(parsed.title || 'Unknown Object'),
    estimatedPeriod: String(parsed.estimatedPeriod || 'Unknown'),
    origin: String(parsed.origin || 'Unknown'),
    description: String(parsed.description || ''),
  };

  if (parsed.estimatedPrice) {
    result.estimatedPrice = String(parsed.estimatedPrice);
  }
  if (parsed.authenticPrice) {
    result.authenticPrice = String(parsed.authenticPrice);
  }

  return result;
}

// ─── Image helper ─────────────────────────────────────────────────────────────

async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1]); // strip "data:image/jpeg;base64," prefix
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(blob);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyze an image of a suspected antique using Llama 3.2 Vision via Groq.
 *
 * @param imageUri - Local file URI of the captured photo.
 * @returns Structured analysis result with authenticity, confidence, and pricing.
 */
export async function analyzeImage(imageUri: string): Promise<AnalysisResult> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key not configured. Add EXPO_PUBLIC_GROQ_API_KEY to your .env file.');
  }

  // Convert local photo URI to base64 using fetch + FileReader (no deprecated APIs)
  const base64 = await uriToBase64(imageUri);

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
            {
              type: 'text',
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from Groq API');
  }

  return parseResponse(content);
}
