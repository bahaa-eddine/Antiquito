import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // still used by EmptyState
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { ScanRecord, RootStackParamList } from '../types';
import ScanHistoryCard from '../components/ScanHistoryCard';
import PlanBadge from '../components/PlanBadge';
import { Colors, Spacing, Radius } from '../utils/constants';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HistoryScreen() {
  const { scanHistory, setViewingScan } = useStore();
  const navigation = useNavigation<NavProp>();
  const isPremium = useStore((s) => s.isPremium);

  const handleCardPress = (record: ScanRecord) => {
    setViewingScan(record);
    navigation.navigate('Result');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Scans</Text>
          {scanHistory.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {scanHistory.length} object{scanHistory.length !== 1 ? 's' : ''} analyzed
            </Text>
          )}
        </View>
        <PlanBadge
          onPress={isPremium ? undefined : () => navigation.navigate('Paywall')}
        />
      </View>

      {scanHistory.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={scanHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ScanHistoryCard record={item} onPress={() => handleCardPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="camera-outline" size={44} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Scans Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the camera button below to photograph your first antique and discover its history.
      </Text>
      <View style={styles.emptyArrowHint}>
        <Ionicons name="arrow-down-outline" size={22} color={Colors.primary} />
        <Text style={styles.emptyArrowText}>Use the camera button</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  // ── List ──
  listContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  separator: { height: Spacing.sm },

  // ── Empty state ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyArrowHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  emptyArrowText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
