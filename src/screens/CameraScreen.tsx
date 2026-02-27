import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useCamera } from '../hooks/useCamera';
import { Colors, Spacing, SCREEN_HEIGHT } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const { cameraRef, facing, flash, isTaking, toggleFacing, toggleFlash, takePicture } =
    useCamera();
  const flashAnim = useRef(new Animated.Value(0)).current;

  // ─── Permission gating ──────────────────────────────────────────────────────

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="camera-outline" size={64} color={Colors.primary} />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionSubtitle}>
          Antiquito needs your camera to photograph and analyze antique objects.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Capture handler ────────────────────────────────────────────────────────

  const handleCapture = async () => {
    // Quick white flash feedback
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();

    const uri = await takePicture();
    if (uri) {
      navigation.navigate('Preview', { imageUri: uri });
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Camera preview */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        flash={flash}
      />

      {/* Shutter flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { opacity: flashAnim, backgroundColor: '#fff' }]}
      />

      {/* ── Top controls ── */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <TouchableOpacity onPress={toggleFlash} style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons
            name={flash === 'on' ? 'flash' : 'flash-off'}
            size={22}
            color={flash === 'on' ? '#FFD700' : Colors.white}
          />
        </TouchableOpacity>

        <Text style={styles.appName}>ANTIQUITO</Text>

        {/* Placeholder to center title */}
        <View style={styles.iconBtn} />
      </SafeAreaView>

      {/* ── Bottom controls ── */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        style={styles.bottomGradient}
        pointerEvents="box-none"
      >
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          {/* Flip camera */}
          <TouchableOpacity onPress={toggleFacing} style={styles.sideBtn} activeOpacity={0.7}>
            <Ionicons name="camera-reverse-outline" size={28} color={Colors.white} />
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity
            onPress={handleCapture}
            disabled={isTaking}
            activeOpacity={0.85}
            style={[styles.shutterOuter, isTaking && { opacity: 0.6 }]}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          {/* Spacer mirror */}
          <View style={styles.sideBtn} />
        </SafeAreaView>
      </LinearGradient>

      {/* Hint label */}
      <View style={styles.hintContainer} pointerEvents="none">
        <Text style={styles.hintText}>Point camera at any antique object</Text>
      </View>
    </View>
  );
}

const SHUTTER_OUTER = 76;
const SHUTTER_INNER = 62;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.black,
  },

  // ── Permission screen ──
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  permissionSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 14,
  },
  permissionBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
  },

  // ── Bottom gradient + bar ──
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.28,
    justifyContent: 'flex-end',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl + Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.lg,
  },
  sideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: SHUTTER_OUTER,
    height: SHUTTER_OUTER,
    borderRadius: SHUTTER_OUTER / 2,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: SHUTTER_INNER,
    height: SHUTTER_INNER,
    borderRadius: SHUTTER_INNER / 2,
    backgroundColor: Colors.white,
  },

  // ── Hint ──
  hintContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.28,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  hintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
