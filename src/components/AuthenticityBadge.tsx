import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthenticityLabel } from '../types';
import { Colors, Radius, Spacing } from '../utils/constants';

interface Props {
  label: AuthenticityLabel;
  size?: 'sm' | 'lg';
}

const CONFIG: Record<
  AuthenticityLabel,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string; text: string }
> = {
  Real: {
    icon: 'checkmark-circle',
    bg: Colors.realLight,
    color: Colors.real,
    text: 'Real Antique',
  },
  Fake: {
    icon: 'close-circle',
    bg: Colors.fakeLight,
    color: Colors.fake,
    text: 'Likely Fake',
  },
  Uncertain: {
    icon: 'help-circle',
    bg: Colors.uncertainLight,
    color: Colors.uncertain,
    text: 'Uncertain',
  },
};

export default function AuthenticityBadge({ label, size = 'lg' }: Props) {
  const config = CONFIG[label];
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isLarge ? styles.badgeLarge : styles.badgeSm,
      ]}
    >
      <Ionicons
        name={config.icon}
        size={isLarge ? 28 : 16}
        color={config.color}
        style={styles.icon}
      />
      <Text
        style={[
          styles.label,
          { color: config.color },
          isLarge ? styles.labelLarge : styles.labelSm,
        ]}
      >
        {config.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    alignSelf: 'center',
  },
  badgeLarge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  icon: {},
  label: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelLarge: {
    fontSize: 18,
  },
  labelSm: {
    fontSize: 12,
  },
});
