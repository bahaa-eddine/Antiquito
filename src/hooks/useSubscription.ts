import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  Subscription,
  Purchase,
} from 'react-native-iap';
import { useStore } from '../store/useStore';
import { PRODUCT_IDS } from '../utils/iap';

const SKUS = Object.values(PRODUCT_IDS);

// IAP native APIs are unavailable inside Expo Go — use simulated responses instead
const IS_EXPO_GO = Constants.appOwnership === 'expo';

const MOCK_PRODUCTS = [
  { productId: PRODUCT_IDS.weekly,  title: 'Weekly Premium',  localizedPrice: '$0.99' },
  { productId: PRODUCT_IDS.monthly, title: 'Monthly Premium', localizedPrice: '$2.99' },
] as unknown as Subscription[];

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export function useSubscription() {
  const isPremium = useStore((s) => s.isPremium);
  const setIsPremium = useStore((s) => s.setIsPremium);
  const [products, setProducts] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isTestMode = IS_EXPO_GO;

  useEffect(() => {
    if (IS_EXPO_GO) {
      // Load mock products immediately so the paywall is fully previewable
      setProducts(MOCK_PRODUCTS);
      return;
    }

    let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener>;
    let purchaseErrorSub: ReturnType<typeof purchaseErrorListener>;

    const init = async () => {
      try {
        await initConnection();

        purchaseUpdateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
          await finishTransaction({ purchase, isConsumable: false });
          setIsPremium(true);
        });

        purchaseErrorSub = purchaseErrorListener(() => {});

        const subs = await getSubscriptions({ skus: SKUS });
        setProducts(subs);

        const existing = await getAvailablePurchases();
        if (existing.length > 0) setIsPremium(true);
      } catch {
        // IAP unavailable (simulator without StoreKit config, etc.)
      }
    };

    init();

    return () => {
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
      endConnection();
    };
  }, []);

  const subscribe = async (productId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (IS_EXPO_GO) {
        // Simulate purchase flow for Expo Go preview
        await delay(1500);
        setIsPremium(true);
        return true;
      }

      if (Platform.OS === 'android') {
        const product = products.find((p) => p.productId === productId);
        const offerToken =
          (product as any)?.subscriptionOfferDetails?.[0]?.offerToken ?? '';
        await requestSubscription({
          sku: productId,
          subscriptionOffers: [{ sku: productId, offerToken }],
        });
      } else {
        await requestSubscription({ sku: productId });
      }
      return true;
    } catch (e: any) {
      if (e?.code !== 'E_USER_CANCELLED') {
        setError(e?.message ?? 'Purchase failed. Please try again.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restore = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (IS_EXPO_GO) {
        await delay(1000);
        setError('No active subscription found. (Test mode)');
        return false;
      }

      const purchases = await getAvailablePurchases();
      if (purchases.length > 0) {
        setIsPremium(true);
        return true;
      }
      setError('No active subscription found to restore.');
      return false;
    } catch (e: any) {
      setError(e?.message ?? 'Restore failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { isPremium, products, loading, error, isTestMode, subscribe, restore };
}
