import { AnalysisResult, AuthenticityLabel } from '../types';

// ─── Config ───────────────────────────────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// ─── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_MESSAGE = `You are an expert antique appraiser with 30 years of experience. You ALWAYS give a decisive score. You NEVER hedge with a score of 46–55 unless the image is literally too blurry or dark to see anything. When you are unsure, you pick the most likely side — that is your professional duty.`;

const ANALYSIS_PROMPT = `Examine the image and return ONLY a raw JSON object — no markdown, no code fences, no explanation before or after.

Required fields:
{
  "confidence": <integer 0–100>,
  "title": "<specific object name>",
  "estimatedPeriod": "<date range e.g. 1860–1880, or 'Modern reproduction'>",
  "origin": "<country or region of manufacture>",
  "description": "<2-3 sentences explaining what you see and WHY you scored it this way>",
  "estimatedPrice": "<USD market value range>",
  "authenticPrice": "<USD range for genuine original — ONLY include when confidence is 0–45>"
}

Scoring guide — pick the most accurate score, AVOID 46–55:
  0–15  = Almost Certainly a Reproduction  → mass-produced, factory finish, plastic, modern branding
 16–35  = Likely a Reproduction            → strong signs of modern manufacture, inconsistencies
 36–45  = Probably a Reproduction          → suspicious, a few period features but mostly modern
 46–55  = Inconclusive                     → USE ONLY when image is too blurry/dark to evaluate
 56–70  = Probably Authentic               → multiple period-consistent features
 71–85  = Likely Authentic                 → strong patina, hand-craftsmanship, period materials
 86–100 = Highly Authentic                 → exceptional period alignment, maker marks, provenance

Pricing:
- Include "estimatedPrice" for confidence 0–45 (replica/resale value) and 56–100 (antique value)
- Include "authenticPrice" for confidence 0–45 only (what the real original would sell for)
- OMIT both price fields for confidence 46–55

Examples of scores:
- iPhone → confidence: 5
- IKEA chair → confidence: 8
- Suspicious "antique" vase with sticker → confidence: 30
- Old coin with visible wear but uncertain origin → confidence: 62
- Victorian ceramic with maker's mark and crazing → confidence: 82`;

// ─── Confidence table helpers ─────────────────────────────────────────────────

function getConfidenceLabel(confidence: number): string {
  if (confidence <= 15) return 'Almost Certainly a Reproduction';
  if (confidence <= 35) return 'Likely a Reproduction';
  if (confidence <= 45) return 'Probably a Reproduction';
  if (confidence <= 55) return 'Inconclusive';
  if (confidence <= 70) return 'Probably Authentic';
  if (confidence <= 85) return 'Likely Authentic';
  return 'Highly Authentic';
}

function getAuthenticity(confidence: number): AuthenticityLabel {
  if (confidence <= 45) return 'Reproduction';
  if (confidence <= 55) return 'Inconclusive';
  return 'Authentic';
}

// ─── Response parser ──────────────────────────────────────────────────────────

function parseResponse(content: string): AnalysisResult {
  const cleaned = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  const confidence = Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 50)));

  const result: AnalysisResult = {
    authenticity: getAuthenticity(confidence),
    confidence,
    confidenceLabel: getConfidenceLabel(confidence),
    title: String(parsed.title || 'Unknown Object'),
    estimatedPeriod: String(parsed.estimatedPeriod || 'Unknown'),
    origin: String(parsed.origin || 'Unknown'),
    description: String(parsed.description || ''),
  };

  // Only include prices when not inconclusive (46–55)
  if (confidence <= 45 || confidence >= 56) {
    if (parsed.estimatedPrice) result.estimatedPrice = String(parsed.estimatedPrice);
    if (parsed.authenticPrice && confidence <= 45) result.authenticPrice = String(parsed.authenticPrice);
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
          role: 'system',
          content: SYSTEM_MESSAGE,
        },
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
      temperature: 0.4,
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

  console.log('[Groq raw response]', content);
  return parseResponse(content);
}
