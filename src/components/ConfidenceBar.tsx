import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../utils/constants';

interface Props {
  confidence: number; // 0–100
}

function getBarColor(confidence: number): string {
  if (confidence >= 75) return Colors.real;
  if (confidence >= 50) return Colors.uncertain;
  return Colors.fake;
}

export default function ConfidenceBar({ confidence }: Props) {
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
        <Text style={styles.label}>Confidence</Text>
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
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  track: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
