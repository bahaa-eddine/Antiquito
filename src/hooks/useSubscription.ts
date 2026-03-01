import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  ProductSubscription,
  Purchase,
} from 'react-native-iap';
import { useStore } from '../store/useStore';
import { PRODUCT_IDS } from '../utils/iap';

const SKUS = Object.values(PRODUCT_IDS);

// Use mock products in Expo Go and all debug builds (real IAP needs Play Console setup)
const IS_EXPO_GO = Constants.appOwnership === 'expo';
const USE_MOCK = IS_EXPO_GO || __DEV__;

const MOCK_PRODUCTS = [
  { id: PRODUCT_IDS.weekly,  title: 'Weekly Premium',  displayPrice: '$0.99', type: 'subs', platform: 'android' },
  { id: PRODUCT_IDS.monthly, title: 'Monthly Premium', displayPrice: '$2.99', type: 'subs', platform: 'android' },
] as unknown as ProductSubscription[];

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export function useSubscription() {
  const isPremium = useStore((s) => s.isPremium);
  const setIsPremium = useStore((s) => s.setIsPremium);
  const [products, setProducts] = useState<ProductSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isTestMode = IS_EXPO_GO;

  useEffect(() => {
    if (USE_MOCK) {
      // Load mock products immediately (Expo Go or debug build)
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

        const subs = await fetchProducts({ skus: SKUS, type: 'subs' });
        setProducts(subs as ProductSubscription[]);

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
      if (USE_MOCK) {
        // Simulate purchase flow in Expo Go / debug build
        await delay(1500);
        setIsPremium(true);
        return true;
      }

      const product = products.find((p) => p.id === productId);
      const offerToken =
        (product as any)?.subscriptionOfferDetails?.[0]?.offerToken ?? '';

      if (Platform.OS === 'android') {
        await requestPurchase({
          type: 'subs',
          request: { google: { skus: [productId], offerToken } },
        });
      } else {
        await requestPurchase({
          type: 'subs',
          request: { apple: { sku: productId } },
        });
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
      if (USE_MOCK) {
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
