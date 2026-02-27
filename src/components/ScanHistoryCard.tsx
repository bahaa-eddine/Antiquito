import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScanRecord } from '../types';
import AuthenticityBadge from './AuthenticityBadge';
import { Colors, Spacing, Radius, Shadow } from '../utils/constants';

interface Props {
  record: ScanRecord;
  onPress: () => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Today at ${timeStr}`;
  if (diffDays === 1) return `Yesterday at ${timeStr}`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` at ${timeStr}`;
}

export default function ScanHistoryCard({ record, onPress }: Props) {
  const { result, imageUri, createdAt } = record;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Thumbnail */}
      <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {result.title}
        </Text>
        <Text style={styles.period} numberOfLines={1}>
          {result.estimatedPeriod}
        </Text>
        <View style={styles.footer}>
          <AuthenticityBadge label={result.authenticity} size="sm" />
          <Text style={styles.date}>{formatDate(createdAt)}</Text>
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.card,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  period: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
});
