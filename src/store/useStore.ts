import { create } from 'zustand';
import { AnalysisResult, ScanRecord, User } from '../types';

interface AppState {
  // ── Auth ──────────────────────────────────────────────────────────────────
  user: User | null;
  isAuthenticated: boolean;

  // ── Current scan session ──────────────────────────────────────────────────
  capturedImageUri: string | null;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;

  // ── Past-scan viewer ──────────────────────────────────────────────────────
  viewingScan: ScanRecord | null;

  // ── Scan history ──────────────────────────────────────────────────────────
  scanHistory: ScanRecord[];

  // ── Actions ───────────────────────────────────────────────────────────────
  login: (user: User) => void;
  logout: () => void;

  setCapturedImage: (uri: string) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  addScanRecord: (record: ScanRecord) => void;
  setViewingScan: (record: ScanRecord | null) => void;

  reset: () => void;
}

const initialScanState = {
  capturedImageUri: null,
  analysisResult: null,
  isLoading: false,
  error: null,
  viewingScan: null,
};

export const useStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  ...initialScanState,
  scanHistory: [],

  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false, scanHistory: [], ...initialScanState }),

  setCapturedImage: (uri) => set({ capturedImageUri: uri, analysisResult: null, error: null }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  addScanRecord: (record) =>
    set((state) => ({ scanHistory: [record, ...state.scanHistory] })),
  setViewingScan: (record) => set({ viewingScan: record }),

  reset: () => set(initialScanState),
}));
