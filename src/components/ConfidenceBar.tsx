import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Radius, Spacing } from '../utils/constants';

interface Props {
  confidence: number;    // 0–100
  confidenceLabel: string; // e.g. "Likely Authentic"
}

function getBarColor(confidence: number): string {
  if (confidence <= 15) return '#922B21'; // Almost Certainly Fake — dark red
  if (confidence <= 35) return '#C0392B'; // Likely Fake — red
  if (confidence <= 45) return '#D35400'; // Probably Fake — orange
  if (confidence <= 55) return '#B7770D'; // Inconclusive — amber
  if (confidence <= 70) return '#27AE60'; // Probably Authentic — light green
  if (confidence <= 85) return '#1A7340'; // Likely Authentic — green
  return '#0D5C35';                       // Highly Authentic — deep green
}

export default function ConfidenceBar({ confidence, confidenceLabel }: Props) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: confidence,
      duration: 1100,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [confidence]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const barColor = getBarColor(confidence);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: barColor }]}>{confidenceLabel}</Text>
        <Text style={[styles.value, { color: barColor }]}>{confidence}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { width: widthInterpolated, backgroundColor: barColor }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs + 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  track: {
    height: 8,
    backgroundColor: '#E5E0D8',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
