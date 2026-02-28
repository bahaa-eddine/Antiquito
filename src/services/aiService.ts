import { AnalysisResult } from '../types';

// ─── Mock Response Library ────────────────────────────────────────────────────
// Replace `mockAnalyzeImage` with a real API call when integrating a vision model.
// The response shape is already typed — just swap the fetch implementation.
//
// Example real integration:
//   const formData = new FormData();
//   formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'photo.jpg' });
//   const response = await fetch('https://your-api.com/analyze', { method: 'POST', body: formData });
//   return response.json() as AnalysisResult;

const MOCK_RESPONSES: AnalysisResult[] = [
  {
    authenticity: 'Real',
    confidence: 87,
    title: 'Victorian Ceramic Vase',
    estimatedPeriod: '1860 – 1880',
    origin: 'Staffordshire, England',
    description:
      'A hand-painted ceramic vase from the Victorian era featuring intricate floral motifs consistent with the Aesthetic Movement. The piece exhibits characteristic crazing patterns in the lead glaze, period-appropriate iron-oxide pigments, and a partial maker\'s mark on the base consistent with Minton & Co. Staffordshire pottery.',
    estimatedPrice: '$2,400 – $3,800',
  },
  {
    authenticity: 'Fake',
    confidence: 93,
    title: 'Reproduction Louis XV Armchair',
    estimatedPeriod: 'Original: 1740 – 1760 (this piece: 1990s)',
    origin: 'Southeast Asia (suspected)',
    description:
      'This armchair mimics the rococo style of Louis XV-period French furniture but contains multiple anachronistic details. The wood grain is machine-cut rather than hand-shaped, the gilding is electroplated rather than water-gilded gesso, and the upholstery webbing shows synthetic fibers inconsistent with 18th-century textile production.',
    estimatedPrice: '$80 – $150',
    authenticPrice: '$12,000 – $28,000',
  },
  {
    authenticity: 'Uncertain',
    confidence: 62,
    title: 'Silver Denarius Coin',
    estimatedPeriod: 'Possibly 100 BC – 200 AD',
    origin: 'Roman Empire (region undetermined)',
    description:
      'This coin bears iconography consistent with Roman Imperial denarii, including a laureate portrait obverse and a reverse deity figure. However, the silver alloy composition and die alignment angle fall within ranges shared by both authentic ancient coins and high-quality modern forgeries produced since the 1970s. Further metallurgical analysis via XRF spectroscopy is strongly recommended.',
  },
];

const SIMULATED_DELAY_MS = 2800;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyze an image of a suspected antique.
 *
 * @param imageUri - Local file URI of the captured photo.
 * @returns Structured analysis result with authenticity, confidence, and historical data.
 *
 * TODO: Replace the mock implementation below with your real vision API call.
 */
export async function analyzeImage(imageUri: string): Promise<AnalysisResult> {
  // Simulate network latency
  await new Promise<void>((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  // Rotate through mock responses so demo feels varied
  const index = Math.floor(Math.random() * MOCK_RESPONSES.length);
  return MOCK_RESPONSES[index];
}
