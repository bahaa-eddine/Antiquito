export type AuthenticityLabel = 'Authentic' | 'Reproduction' | 'Inconclusive';

export interface AnalysisResult {
  authenticity: AuthenticityLabel;
  confidence: number;          // 0–100
  confidenceLabel: string;     // e.g. "Likely Authentic", "Almost Certainly Fake"
  title: string;
  estimatedPeriod: string;
  origin: string;
  description: string;
  estimatedPrice?: string;     // Market value; omitted when Uncertain (46–55%)
  authenticPrice?: string;     // Only for Fake: what the genuine original is worth
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ScanRecord {
  id: string;
  imageUri: string;
  result: AnalysisResult;
  createdAt: string; // ISO date string
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  Camera: undefined;
  Preview: { imageUri: string };
  Result: undefined;
  Paywall: undefined;
};

export type TabParamList = {
  History: undefined;
  Account: undefined;
};
