import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PlusOffering,
  PlusResult,
  configureRevenueCat,
  errorText,
  hasProoflinePlus,
  loadPlusOffering,
  onProoflinePlusChange,
  purchasePlus,
  restorePlus,
} from './revenuecat';

export type PlusOfferingState = { status: 'loading' } | PlusOffering;
export type PlusAction = 'idle' | 'purchasing' | 'restoring';
export type PlusNotice = { tone: 'success' | 'info' | 'error'; text: string };

const noticeFor = (result: PlusResult): PlusNotice => {
  switch (result.outcome) {
    case 'unlocked':
      return { tone: 'success', text: result.message };
    case 'inactive':
    case 'cancelled':
    case 'pending':
      return { tone: 'info', text: result.message };
    case 'failed':
      return { tone: 'error', text: result.message };
    default: {
      const unhandled: never = result.outcome;
      throw new Error(`Unhandled outcome ${unhandled}`);
    }
  }
};

export function useProoflinePlus({ onUnlocked }: { onUnlocked?: (message: string) => void } = {}) {
  const [billingReady, setBillingReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [offering, setOffering] = useState<PlusOfferingState>({ status: 'loading' });
  const [action, setAction] = useState<PlusAction>('idle');
  const [notice, setNotice] = useState<PlusNotice | null>(null);
  const setup = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    setup.current = configureRevenueCat()
      .then((ready) => {
        if (!active) return null;
        setBillingReady(ready);
        if (ready) {
          unsubscribe = onProoflinePlusChange(setIsPro);
          hasProoflinePlus().then((pro) => active && setIsPro(pro)).catch(() => {});
        }
        return null;
      })
      .catch((error: unknown) => `RevenueCat could not start: ${errorText(error)}`);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const loadOffering = useCallback(async () => {
    setNotice(null);
    setOffering({ status: 'loading' });
    const setupError = await setup.current;
    setOffering(setupError ? { status: 'unavailable', message: setupError } : await loadPlusOffering());
  }, []);

  const run = async (kind: Exclude<PlusAction, 'idle'>, task: () => Promise<PlusResult>) => {
    if (action !== 'idle') return;
    setAction(kind);
    setNotice(null);
    const result = await task();
    setAction('idle');
    setNotice(noticeFor(result));
    if (result.outcome === 'unlocked') {
      setIsPro(true);
      onUnlocked?.(result.message);
    }
  };

  const buy = () => {
    if (offering.status !== 'ready') return;
    const { pkg } = offering;
    void run('purchasing', () => purchasePlus(pkg));
  };

  const restore = () => {
    void run('restoring', restorePlus);
  };

  return { billingReady, isPro, offering, action, notice, loadOffering, buy, restore };
}
