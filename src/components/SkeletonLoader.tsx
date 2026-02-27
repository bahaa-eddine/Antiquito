import React, { useEffect, useRef, FC } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../utils/constants';

// ─── Shimmer Primitive ────────────────────────────────────────────────────────

interface ShimmerBoxProps {
  style?: ViewStyle | ViewStyle[];
}

const ShimmerBox: FC<ShimmerBoxProps> = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[styles.shimmer, { opacity }, style]} />;
};

// ─── Full Result Skeleton ─────────────────────────────────────────────────────

export default function SkeletonLoader() {
  return (
    <View style={styles.container}>
      {/* Badge placeholder */}
      <ShimmerBox style={styles.badge} />

      {/* Confidence bar */}
      <View style={styles.card}>
        <ShimmerBox style={styles.lineShort} />
        <ShimmerBox style={styles.barTrack} />
      </View>

      {/* Info card */}
      <View style={styles.card}>
        <ShimmerBox style={styles.sectionTitle} />
        <ShimmerBox style={styles.lineFull} />
        <ShimmerBox style={styles.lineMid} />
        <ShimmerBox style={styles.lineFull} />
      </View>

      {/* Description card */}
      <View style={styles.card}>
        <ShimmerBox style={styles.sectionTitle} />
        <ShimmerBox style={styles.lineFull} />
        <ShimmerBox style={styles.lineFull} />
        <ShimmerBox style={styles.lineShort} />
      </View>

      {/* Timeline card */}
      <View style={styles.card}>
        <ShimmerBox style={styles.sectionTitle} />
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.timelineRow}>
            <ShimmerBox style={styles.dot} />
            <ShimmerBox style={styles.timelineLine} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  shimmer: {
    backgroundColor: Colors.skeleton,
    borderRadius: Radius.sm,
  },
  badge: {
    height: 44,
    width: 200,
    borderRadius: Radius.full,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    height: 14,
    width: '40%',
    marginBottom: Spacing.xs,
  },
  lineFull: {
    height: 13,
    width: '100%',
  },
  lineMid: {
    height: 13,
    width: '75%',
  },
  lineShort: {
    height: 13,
    width: '50%',
  },
  barTrack: {
    height: 8,
    width: '100%',
    borderRadius: Radius.full,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  timelineLine: {
    height: 13,
    flex: 1,
  },
});
