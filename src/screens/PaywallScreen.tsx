import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useSubscription } from '../hooks/useSubscription';
import { PRODUCT_IDS, FREE_SCAN_LIMIT } from '../utils/iap';
import { Colors, Spacing, Radius, Shadow } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const BENEFITS = [
  { icon: 'scan-outline' as const, text: 'Unlimited daily scans' },
  { icon: 'flash-outline' as const, text: 'Priority AI analysis' },
  { icon: 'time-outline' as const, text: 'Full scan history access' },
  { icon: 'shield-checkmark-outline' as const, text: 'Detailed authenticity reports' },
  { icon: 'star-outline' as const, text: 'Support independent development' },
];

export default function PaywallScreen({ navigation }: Props) {
  const { isPremium, products, loading, error, isTestMode, subscribe, restore } = useSubscription();
  const [selectedId, setSelectedId] = useState<string>(PRODUCT_IDS.monthly);

  // Navigate back automatically as soon as the purchase is confirmed
  useEffect(() => {
    if (isPremium) {
      Alert.alert('Welcome to Premium!', 'You now have unlimited scans.', [
        { text: 'Get Started', onPress: () => navigation.goBack() },
      ]);
    }
  }, [isPremium]);

  const monthlyProduct = products.find((p) => p.productId === PRODUCT_IDS.monthly);
  const weeklyProduct  = products.find((p) => p.productId === PRODUCT_IDS.weekly);

  const handleSubscribe = () => subscribe(selectedId);

  const handleRestore = async () => {
    const success = await restore();
    if (!success && !error) {
      Alert.alert('Nothing to Restore', 'No active subscription was found for this account.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Go Premium</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Test mode banner ── */}
        {isTestMode && (
          <View style={styles.testBanner}>
            <Ionicons name="flask-outline" size={15} color={Colors.uncertain} />
            <Text style={styles.testBannerText}>
              Test mode — purchases are simulated in Expo Go
            </Text>
          </View>
        )}

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="crown" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Unlock Unlimited Scans</Text>
          <Text style={styles.heroSubtitle}>
            You've used your {FREE_SCAN_LIMIT} free scans for today.{'\n'}
            Upgrade to continue analyzing antiques.
          </Text>
        </View>

        {/* ── Benefits list ── */}
        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.text} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={b.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Product cards ── */}
        {products.length > 0 ? (
          <View style={styles.products}>
            {/* Monthly — best value, shown first */}
            {monthlyProduct && (
              <TouchableOpacity
                style={[
                  styles.productCard,
                  selectedId === PRODUCT_IDS.monthly && styles.productCardSelected,
                ]}
                onPress={() => setSelectedId(PRODUCT_IDS.monthly)}
                activeOpacity={0.85}
              >
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
                <View style={styles.productCardContent}>
                  <View style={styles.productRadio}>
                    {selectedId === PRODUCT_IDS.monthly ? (
                      <Ionicons name="radio-button-on" size={22} color={Colors.primary} />
                    ) : (
                      <Ionicons name="radio-button-off" size={22} color={Colors.textTertiary} />
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{monthlyProduct.title ?? 'Monthly Premium'}</Text>
                    <Text style={styles.productDescription}>Billed monthly</Text>
                  </View>
                  <Text style={styles.productPrice}>{monthlyProduct.localizedPrice}</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Weekly — entry-level option */}
            {weeklyProduct && (
              <TouchableOpacity
                style={[
                  styles.productCard,
                  selectedId === PRODUCT_IDS.weekly && styles.productCardSelected,
                ]}
                onPress={() => setSelectedId(PRODUCT_IDS.weekly)}
                activeOpacity={0.85}
              >
                <View style={styles.productCardContent}>
                  <View style={styles.productRadio}>
                    {selectedId === PRODUCT_IDS.weekly ? (
                      <Ionicons name="radio-button-on" size={22} color={Colors.primary} />
                    ) : (
                      <Ionicons name="radio-button-off" size={22} color={Colors.textTertiary} />
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{weeklyProduct.title ?? 'Weekly Premium'}</Text>
                    <Text style={styles.productDescription}>Billed weekly</Text>
                  </View>
                  <Text style={styles.productPrice}>{weeklyProduct.localizedPrice}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.loadingProducts}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingText}>Loading plans…</Text>
          </View>
        )}

        {/* ── Error message ── */}
        {error && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={15} color={Colors.fake} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Subscribe button ── */}
        <TouchableOpacity
          style={[
            styles.subscribeBtn,
            (loading || products.length === 0) && styles.subscribeBtnDisabled,
          ]}
          onPress={handleSubscribe}
          disabled={loading || products.length === 0}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.subscribeBtnText}>
              {isTestMode ? 'Subscribe (Simulated)' : 'Subscribe Now'}
            </Text>
          )}
        </TouchableOpacity>

        {/* ── Legal note + Restore ── */}
        {!isTestMode && (
          <Text style={styles.legalNote}>
            Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date.
            Manage or cancel in your account settings.
          </Text>
        )}

        <TouchableOpacity onPress={handleRestore} disabled={loading} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },

  // ── Scroll ──
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // ── Test mode banner ──
  testBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.uncertainLight,
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignSelf: 'center',
  },
  testBannerText: {
    fontSize: 12,
    color: Colors.uncertain,
    fontWeight: '600',
  },

  // ── Hero ──
  hero: { alignItems: 'center', gap: Spacing.sm },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },

  // ── Benefits ──
  benefits: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { fontSize: 15, color: Colors.text, fontWeight: '500', flex: 1 },

  // ── Products ──
  products: { gap: Spacing.sm },
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.card,
  },
  productCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FBF8F2',
  },
  bestValueBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    borderBottomRightRadius: Radius.sm,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  productCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  productRadio: { width: 24, alignItems: 'center' },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  productDescription: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  productPrice: { fontSize: 17, fontWeight: '800', color: Colors.primary },

  // ── Loading ──
  loadingProducts: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  loadingText: { fontSize: 14, color: Colors.textSecondary },

  // ── Error ──
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.fakeLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: { fontSize: 13, color: Colors.fake, flex: 1 },

  // ── Subscribe button ──
  subscribeBtn: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.strong,
  },
  subscribeBtnDisabled: { opacity: 0.6 },
  subscribeBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Legal / Restore ──
  legalNote: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  restoreBtn: { alignItems: 'center', paddingVertical: Spacing.xs },
  restoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
