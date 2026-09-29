import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { FREE_PROOF_CARD_LIMIT } from '../proofline';
import { colors, s } from '../styles';
import { PlusAction, PlusNotice, PlusOfferingState } from '../useProoflinePlus';

type Props = {
  visible: boolean;
  isPro: boolean;
  cardsUsed: number;
  offering: PlusOfferingState;
  action: PlusAction;
  notice: PlusNotice | null;
  onClose: () => void;
  onBuy: () => void;
  onRestore: () => void;
  onRetry: () => void;
};

const noticeStyle = { success: s.noticeSuccess, info: s.noticeInfo, error: s.noticeError };

export function Paywall({ visible, isPro, cardsUsed, offering, action, notice, onClose, onBuy, onRestore, onRetry }: Props) {
  const busy = action !== 'idle';
  const canBuy = offering.status === 'ready' && !busy;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.paywall}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={s.dismiss}><Text style={s.close}>×</Text></Pressable>
          <Text style={s.eyebrow}>PROOFLINE PLUS</Text>
          <Text style={s.paywallTitle}>Keep building your proof trail.</Text>
          <Text style={s.benefit}>✓  Unlimited Proof Cards</Text>
          <Text style={s.benefit}>✓  Your existing cards stay yours</Text>
          <Text style={s.helper}>
            {isPro ? 'Plus is active: RevenueCat reports the pro entitlement.' : `Free plan: ${Math.min(cardsUsed, FREE_PROOF_CARD_LIMIT)} of ${FREE_PROOF_CARD_LIMIT} Proof Cards used.`}
          </Text>
          <Text style={s.helper}>Plus currently unlocks unlimited Proof Cards. Additional coaching and portfolio features are deliberately not advertised as live until built.</Text>

          {!isPro && (
            <>
              {offering.status === 'loading' && (
                <View style={s.paywallStatus}>
                  <ActivityIndicator color={colors.green} />
                  <Text style={s.paywallStatusText}>Loading Plus from RevenueCat…</Text>
                </View>
              )}
              {(offering.status === 'unavailable' || offering.status === 'error') && (
                <View style={[s.notice, offering.status === 'error' ? s.noticeError : s.noticeInfo]}>
                  <Text style={s.noticeText}>{offering.message}</Text>
                  {offering.status === 'error' && (
                    <Pressable accessibilityRole="button" onPress={onRetry}><Text style={s.noticeAction}>Try again</Text></Pressable>
                  )}
                </View>
              )}
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canBuy, busy: action === 'purchasing' }} disabled={!canBuy} onPress={onBuy} style={[s.primaryButton, !canBuy && s.buttonDisabled]}>
                {action === 'purchasing' ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={s.primaryButtonText}>{offering.status === 'ready' ? `Unlock Plus · ${offering.price}` : 'Unlock Plus with RevenueCat'}</Text>
                )}
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy, busy: action === 'restoring' }} disabled={busy} onPress={onRestore} style={[s.secondaryButton, busy && s.buttonDisabled]}>
                {action === 'restoring' ? <ActivityIndicator color={colors.green} /> : <Text style={s.secondaryButtonText}>Restore Purchases</Text>}
              </Pressable>
            </>
          )}

          {notice && (
            <View style={[s.notice, noticeStyle[notice.tone]]} accessibilityLiveRegion="polite">
              <Text style={s.noticeText}>{notice.text}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
