import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useStore } from '../store/useStore';
import { analyzeImage } from '../services/aiService';
import AuthenticityBadge from '../components/AuthenticityBadge';
import ConfidenceBar from '../components/ConfidenceBar';
import SkeletonLoader from '../components/SkeletonLoader';
import { Colors, Spacing, Radius, Shadow } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ navigation }: Props) {
  const {
    capturedImageUri,
    analysisResult,
    isLoading,
    error,
    viewingScan,
    setLoading,
    setAnalysisResult,
    setError,
    setViewingScan,
    addScanRecord,
    reset,
  } = useStore();

  // When replaying a past scan, use its data directly
  const displayResult = viewingScan ? viewingScan.result : analysisResult;
  const displayImageUri = viewingScan ? viewingScan.imageUri : capturedImageUri;

  // Guard against double-saving the same scan
  const savedRef = useRef(false);

  // ─── Trigger analysis (only for fresh scans) ──────────────────────────────

  useEffect(() => {
    if (viewingScan || !capturedImageUri || analysisResult) return;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await analyzeImage(capturedImageUri);
        setAnalysisResult(result);
      } catch {
        setError('Analysis failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [capturedImageUri, viewingScan]);

  // ─── Auto-save to history after fresh analysis ────────────────────────────

  useEffect(() => {
    if (viewingScan || !analysisResult || !capturedImageUri || savedRef.current) return;
    savedRef.current = true;
    addScanRecord({
      id: Date.now().toString(),
      imageUri: capturedImageUri,
      result: analysisResult,
      createdAt: new Date().toISOString(),
    });
  }, [analysisResult]);

  // ─── Navigation handlers ──────────────────────────────────────────────────

  const handleBack = () => {
    if (viewingScan) setViewingScan(null);
    navigation.goBack();
  };

  const handleScanAnother = () => {
    setViewingScan(null);
    reset();
    navigation.navigate('Camera');
  };

  // ─── Error state ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={56} color={Colors.fake} />
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleScanAnother}>
            <Text style={styles.retryBtnText}>Scan Another Object</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {viewingScan ? 'Scan Detail' : 'Analysis Result'}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Image thumbnail ── */}
        {displayImageUri && (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: displayImageUri }} style={styles.thumbnail} resizeMode="cover" />
            {isLoading && (
              <View style={styles.thumbnailOverlay}>
                <View style={styles.scanLine} />
              </View>
            )}
          </View>
        )}

        {/* ── Loading: skeleton ── */}
        {isLoading && !viewingScan && <SkeletonLoader />}

        {/* ── Result content ── */}
        {displayResult && (
          <View style={styles.resultsContainer}>
            <AuthenticityBadge label={displayResult.authenticity} size="lg" />

            <View style={styles.card}>
              <ConfidenceBar confidence={displayResult.confidence} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Object Details</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="bookmark-outline" size={16} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{displayResult.title}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Estimated Period</Text>
                  <Text style={styles.infoValue}>{displayResult.estimatedPeriod}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="location-outline" size={16} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Origin</Text>
                  <Text style={styles.infoValue}>{displayResult.origin}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Expert Analysis</Text>
              <Text style={styles.description}>{displayResult.description}</Text>
            </View>

            {displayResult.authenticity !== 'Uncertain' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {displayResult.authenticity === 'Fake' ? 'Pricing' : 'Estimated Value'}
                </Text>

                <View style={styles.priceRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="pricetag-outline" size={16} color={Colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>
                      {displayResult.authenticity === 'Fake'
                        ? 'Counterfeit Market Value'
                        : 'Estimated Market Value'}
                    </Text>
                    <Text style={[styles.priceValue, styles.priceMain]}>
                      {displayResult.estimatedPrice}
                    </Text>
                  </View>
                </View>

                {displayResult.authenticity === 'Fake' && displayResult.authenticPrice && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.priceRow}>
                      <View style={[styles.infoIcon, styles.realPriceIcon]}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={Colors.real} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Genuine Original Value</Text>
                        <Text style={[styles.priceValue, styles.priceReal]}>
                          {displayResult.authenticPrice}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}

            <Text style={styles.disclaimer}>
              This analysis is AI-generated and intended for informational purposes only. For
              certified authentication, consult a professional appraiser.
            </Text>

            <TouchableOpacity style={styles.ctaBtn} onPress={handleScanAnother} activeOpacity={0.85}>
              <Ionicons name="camera-outline" size={20} color={Colors.white} />
              <Text style={styles.ctaBtnText}>Scan Another Object</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: Platform.OS === 'ios' ? 24 : 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    backgroundColor: Colors.background,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.text, letterSpacing: 0.2 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.lg },

  thumbnailContainer: {
    margin: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    height: 200,
    ...Shadow.card,
  },
  thumbnail: { width: '100%', height: '100%' },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139,105,20,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: { width: '80%', height: 2, backgroundColor: Colors.primary, opacity: 0.7 },

  resultsContainer: { gap: Spacing.md, paddingHorizontal: Spacing.md },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm, ...Shadow.card },
  cardTitle: { fontSize: 12, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: Spacing.xs },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  infoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  infoContent: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.separator, marginVertical: 2 },

  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  priceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  priceValue: { fontSize: 20, fontWeight: '700', marginTop: 2 },
  priceMain: { color: Colors.text },
  priceReal: { color: Colors.real },
  realPriceIcon: { backgroundColor: 'rgba(26,115,64,0.1)' },
  disclaimer: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center', lineHeight: 18, paddingHorizontal: Spacing.sm },

  ctaBtn: { backgroundColor: Colors.primary, height: 54, borderRadius: Radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xs, ...Shadow.strong },
  ctaBtnText: { color: Colors.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  errorTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  errorMessage: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  retryBtn: { marginTop: Spacing.sm, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.lg },
  retryBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
