import { Platform } from 'react-native';
import Purchases, { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import type { CustomerInfo, CustomerInfoUpdateListener, PurchasesError, PurchasesPackage } from 'react-native-purchases';

export const PRO_ENTITLEMENT_ID = 'pro';
export const BILLING_SETUP_MESSAGE = 'Billing setup is needed. Add a RevenueCat public SDK key and a current offering before a purchase can be made.';

const apiKey = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY,
  default: process.env.EXPO_PUBLIC_REVENUECAT_WEB_API_KEY,
});
let configured = false;

export async function configureRevenueCat(): Promise<boolean> {
  if (!apiKey || configured) return configured;
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
  configured = true;
  return true;
}

const hasProEntitlement = (info: CustomerInfo) => Boolean(info.entitlements.active[PRO_ENTITLEMENT_ID]);

export async function hasProoflinePlus(): Promise<boolean> {
  if (!configured) return false;
  return hasProEntitlement(await Purchases.getCustomerInfo());
}

/** Keeps Plus in sync with RevenueCat, including renewals and expirations. */
export function onProoflinePlusChange(callback: (active: boolean) => void): () => void {
  if (!configured) return () => {};
  const listener: CustomerInfoUpdateListener = (info) => callback(hasProEntitlement(info));
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

export type PlusOffering =
  | { status: 'ready'; pkg: PurchasesPackage; price: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

export async function loadPlusOffering(): Promise<PlusOffering> {
  if (!configured) return { status: 'unavailable', message: BILLING_SETUP_MESSAGE };
  try {
    const current = (await Purchases.getOfferings()).current;
    if (!current) return { status: 'unavailable', message: 'RevenueCat has no current offering. Mark an offering as current in the RevenueCat dashboard.' };
    const pkg = current.availablePackages[0];
    if (!pkg) return { status: 'unavailable', message: 'The current offering has no packages. Attach a product to it in RevenueCat.' };
    return { status: 'ready', pkg, price: pkg.product.priceString };
  } catch (error) {
    return { status: 'error', message: `Could not load Plus from RevenueCat: ${errorText(error)}` };
  }
}

export type PlusResult = { outcome: 'unlocked' | 'inactive' | 'cancelled' | 'pending' | 'failed'; message: string };

export async function purchasePlus(pkg: PurchasesPackage): Promise<PlusResult> {
  if (!configured) return { outcome: 'failed', message: BILLING_SETUP_MESSAGE };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    if (hasProEntitlement(customerInfo)) {
      return { outcome: 'unlocked', message: 'RevenueCat confirmed the pro entitlement. Unlimited Proof Cards are unlocked.' };
    }
    return { outcome: 'inactive', message: 'The store finished, but RevenueCat reports no active pro entitlement, so Plus stays locked. Check that this product is attached to the pro entitlement, then tap Restore Purchases.' };
  } catch (error) {
    return failure(error, 'Purchase');
  }
}

export async function restorePlus(): Promise<PlusResult> {
  if (!configured) return { outcome: 'failed', message: BILLING_SETUP_MESSAGE };
  try {
    const customerInfo = await Purchases.restorePurchases();
    if (hasProEntitlement(customerInfo)) {
      return { outcome: 'unlocked', message: 'Purchases restored. RevenueCat confirmed an active pro entitlement.' };
    }
    return { outcome: 'inactive', message: 'Restore finished, but no active Plus purchase was found for this store account.' };
  } catch (error) {
    return failure(error, 'Restore');
  }
}

export function errorText(error: unknown): string {
  if (error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'Unknown error.';
}

const failureMessages: Partial<Record<PURCHASES_ERROR_CODE, string>> = {
  [PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR]: 'Payment is pending approval. Plus unlocks only after the store confirms it. Tap Restore Purchases later.',
  [PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR]: 'This store account already owns Plus. Tap Restore Purchases to unlock it here.',
  [PURCHASES_ERROR_CODE.NETWORK_ERROR]: 'Network error. Check your connection and try again.',
  [PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR]: 'Purchases are not allowed on this device or store account.',
  [PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR]: 'The store had a problem. Try again in a moment.',
};

function failure(error: unknown, action: 'Purchase' | 'Restore'): PlusResult {
  const { code, userCancelled } = (error ?? {}) as Partial<PurchasesError>;
  if (code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || userCancelled) {
    return { outcome: 'cancelled', message: 'Purchase cancelled. You were not charged, and Plus stays locked.' };
  }
  if (code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
    return { outcome: 'pending', message: failureMessages[code] ?? '' };
  }
  const known = code ? failureMessages[code] : undefined;
  return { outcome: 'failed', message: known ?? `${action} failed: ${errorText(error)}` };
}
