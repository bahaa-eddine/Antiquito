import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors, Spacing, Radius, Shadow } from '../utils/constants';

export default function AccountScreen() {
  const { user, logout, scanHistory } = useStore();

  const totalScans = scanHistory.length;
  const realCount = scanHistory.filter((s) => s.result.authenticity === 'Real').length;
  const fakeCount = scanHistory.filter((s) => s.result.authenticity === 'Fake').length;
  const uncertainCount = scanHistory.filter((s) => s.result.authenticity === 'Uncertain').length;

  const initials = user?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ── Avatar + info ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsHeader}>
          <Text style={styles.sectionTitle}>Scan Statistics</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard value={totalScans} label="Total Scans" color={Colors.primary} icon="scan-outline" />
          <StatCard value={realCount} label="Real Antiques" color={Colors.real} icon="checkmark-circle-outline" />
          <StatCard value={fakeCount} label="Likely Fake" color={Colors.fake} icon="close-circle-outline" />
          <StatCard value={uncertainCount} label="Uncertain" color={Colors.uncertain} icon="help-circle-outline" />
        </View>

        {/* ── App info ── */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <InfoRow icon="information-circle-outline" label="Version" value="1.0.0" />
          <View style={styles.divider} />
          <InfoRow icon="shield-checkmark-outline" label="AI Engine" value="Mock (Demo)" />
          <View style={styles.divider} />
          <InfoRow icon="cloud-offline-outline" label="Data Storage" value="On-device only" />
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={Colors.fake} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  color,
  icon,
}: {
  value: number;
  label: string;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={17} color={Colors.primary} style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },

  // ── Profile ──
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.card,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: Colors.text },
  profileEmail: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },

  // ── Stats ──
  statsHeader: { marginBottom: -Spacing.xs },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.card,
  },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500' },

  // ── Info card ──
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  infoIcon: { marginRight: Spacing.sm },
  infoLabel: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
  infoValue: { fontSize: 14, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.separator },

  // ── Logout ──
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.fakeLight,
    borderRadius: Radius.lg,
    height: 52,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: Colors.fake },
});
