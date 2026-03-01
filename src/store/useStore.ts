import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult, ScanRecord, User } from '../types';

interface AppState {
  // ── Auth ──────────────────────────────────────────────────────────────────
  user: User | null;
  isAuthenticated: boolean;
  authReady: boolean; // true once Firebase has resolved initial auth state

  // ── Current scan session ──────────────────────────────────────────────────
  capturedImageUri: string | null;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;

  // ── Past-scan viewer ──────────────────────────────────────────────────────
  viewingScan: ScanRecord | null;

  // ── Scan history (persisted locally) ─────────────────────────────────────
  scanHistory: ScanRecord[];

  // ── Subscription ──────────────────────────────────────────────────────────
  isPremium: boolean;
  freeScansUsed: number;

  // ── Actions ───────────────────────────────────────────────────────────────
  login: (user: User) => void;
  logout: () => void;
  setAuthReady: () => void;

  setCapturedImage: (uri: string) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  addScanRecord: (record: ScanRecord) => void;
  setViewingScan: (record: ScanRecord | null) => void;

  setIsPremium: (val: boolean) => void;
  incrementFreeScans: () => void;
  resetFreeScans: () => void;

  reset: () => void;
}

const initialScanState = {
  capturedImageUri: null,
  analysisResult: null,
  isLoading: false,
  error: null,
  viewingScan: null,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      authReady: false,
      ...initialScanState,
      scanHistory: [],
      isPremium: false,
      freeScansUsed: 0,

      login: (user) => set({ user, isAuthenticated: true }),
      // scanHistory intentionally NOT cleared on logout — it's local-only data
      logout: () => set({ user: null, isAuthenticated: false, ...initialScanState }),
      setAuthReady: () => set({ authReady: true }),

      setCapturedImage: (uri) => set({ capturedImageUri: uri, analysisResult: null, error: null }),
      setAnalysisResult: (result) => set({ analysisResult: result }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      addScanRecord: (record) =>
        set((state) => ({ scanHistory: [record, ...state.scanHistory] })),
      setViewingScan: (record) => set({ viewingScan: record }),

      setIsPremium: (val) => set({ isPremium: val }),
      incrementFreeScans: () => set((state) => ({ freeScansUsed: state.freeScansUsed + 1 })),
      resetFreeScans: () => set({ freeScansUsed: 0 }),

      reset: () => set(initialScanState),
    }),
    {
      name: 'antiquito-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist scan history and subscription state — auth is managed by Firebase
      partialize: (state) => ({
        scanHistory: state.scanHistory,
        isPremium: state.isPremium,
        freeScansUsed: state.freeScansUsed,
      }),
    }
  )
);
