import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useStore } from '../store/useStore';
import { Colors, Spacing, Radius } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export default function PreviewScreen({ route, navigation }: Props) {
  const { imageUri } = route.params;
  const { setCapturedImage, isLoading } = useStore();

  const handleAnalyze = () => {
    setCapturedImage(imageUri);
    navigation.navigate('Result');
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Full-screen image */}
      <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      {/* Dark gradient overlay (top) */}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* Dark gradient overlay (bottom) */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.82)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* ── Top bar ── */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <TouchableOpacity onPress={handleRetake} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Preview</Text>
        <View style={{ width: 44 }} />
      </SafeAreaView>

      {/* ── Bottom CTA ── */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSection}>
        <Text style={styles.readyText}>Ready to analyze?</Text>
        <Text style={styles.readySubtext}>
          Our AI will examine this object and identify its authenticity, origin, and history.
        </Text>

        <TouchableOpacity
          style={[styles.analyzeBtn, isLoading && styles.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="scan-outline" size={20} color={Colors.white} style={styles.btnIcon} />
              <Text style={styles.analyzeBtnText}>Analyze Object</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake} activeOpacity={0.7}>
          <Text style={styles.retakeBtnText}>Retake Photo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },

  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 320,
  },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ── Bottom section ──
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  readyText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  readySubtext: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  analyzeBtn: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzeBtnDisabled: {
    opacity: 0.7,
  },
  btnIcon: {},
  analyzeBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  retakeBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '500',
  },
});
