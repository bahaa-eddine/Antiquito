export type AuthenticityLabel = 'Real' | 'Fake' | 'Uncertain';

export interface AnalysisResult {
  authenticity: AuthenticityLabel;
  confidence: number;
  title: string;
  estimatedPeriod: string;
  origin: string;
  description: string;
  historicalTimeline: string[];
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
};

export type TabParamList = {
  History: undefined;
  Account: undefined;
};
