import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { FREE_SCAN_LIMIT } from '../utils/iap';
import { Colors } from '../utils/constants';

interface Props {
  /** true when rendered over a dark/camera background */
  dark?: boolean;
  onPress?: () => void;
}

export default function PlanBadge({ dark = false, onPress }: Props) {
  const isPremium = useStore((s) => s.isPremium);
  const freeScansUsed = useStore((s) => s.freeScansUsed);

  const scansLeft = Math.max(0, FREE_SCAN_LIMIT - freeScansUsed);
  const exhausted = !isPremium && scansLeft === 0;

  // ── Colors depending on state & background ──
  let bg: string;
  let border: string;
  let textColor: string;

  if (dark) {
    bg     = isPremium ? 'rgba(139,105,20,0.55)' : exhausted ? 'rgba(192,57,43,0.45)' : 'rgba(0,0,0,0.45)';
    border = isPremium ? Colors.primary           : exhausted ? Colors.fake            : 'rgba(255,255,255,0.2)';
    textColor = isPremium ? Colors.primary        : exhausted ? '#FF6B5B'              : 'rgba(255,255,255,0.85)';
  } else {
    bg     = isPremium ? '#FBF5E8'      : exhausted ? Colors.fakeLight  : Colors.surfaceAlt;
    border = isPremium ? Colors.primary : exhausted ? Colors.fake       : Colors.border;
    textColor = isPremium ? Colors.primary : exhausted ? Colors.fake    : Colors.textSecondary;
  }

  const label = isPremium
    ? 'PREMIUM'
    : exhausted
    ? 'UPGRADE'
    : `${scansLeft}/${FREE_SCAN_LIMIT} FREE`;

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.badge, { backgroundColor: bg, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isPremium && <Ionicons name="trophy" size={11} color={textColor} />}
      {exhausted && <Ionicons name="lock-closed" size={11} color={textColor} />}
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
