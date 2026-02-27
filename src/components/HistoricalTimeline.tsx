import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../utils/constants';

interface Props {
  items: string[];
}

export default function HistoricalTimeline({ items }: Props) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          {/* Left rail: dot + connecting line */}
          <View style={styles.rail}>
            <View style={styles.dot} />
            {index < items.length - 1 && <View style={styles.line} />}
          </View>

          {/* Content */}
          <Text style={[styles.itemText, index === items.length - 1 && styles.lastItem]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 36,
  },
  rail: {
    width: 20,
    alignItems: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 4,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 2,
    marginBottom: -2,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingBottom: Spacing.md,
  },
  lastItem: {
    paddingBottom: 0,
  },
});
