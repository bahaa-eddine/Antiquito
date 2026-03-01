/** Apple / Google product identifiers — must match what you configure in App Store Connect / Google Play */
export const PRODUCT_IDS = {
  weekly:  'com.antiquito.premium.weekly',
  monthly: 'com.antiquito.premium.monthly',
} as const;

/** Number of free scans allowed (one-time trial). Set via EXPO_PUBLIC_FREE_SCAN_LIMIT in .env */
export const FREE_SCAN_LIMIT = Number(process.env.EXPO_PUBLIC_FREE_SCAN_LIMIT ?? 3);
