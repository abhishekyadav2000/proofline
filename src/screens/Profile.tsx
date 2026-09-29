import { Platform, Text, View } from 'react-native';
import { Stat } from '../components/Stat';
import { Proof, currentStreak, totalMinutes } from '../proofline';
import { s } from '../styles';

export function Profile({ proofs, billingReady, isPro }: { proofs: Proof[]; billingReady: boolean; isPro: boolean }) {
  return (
    <View>
      <View style={s.profileCircle}><Text style={s.profileInitial}>A</Text></View>
      <Text style={s.profileTitle}>Your potential needs proof.</Text>
      <Text style={s.body}>Proofline helps turn small, real actions into a portfolio you can stand behind.</Text>
      <View style={s.profileStats}>
        <Stat label="Proof Cards" value={String(proofs.length)} />
        <Stat label="Action minutes" value={String(totalMinutes(proofs))} />
        <Stat label="Day streak" value={String(currentStreak(proofs))} />
      </View>
      <View style={s.status}>
        <Text style={s.statusTitle}>Saved on this device</Text>
        <Text style={s.statusText}>Your Proof Cards stay in this app’s local storage. There is no account or cloud sync, so they are not backed up.</Text>
      </View>
      <View style={s.status}>
        <Text style={s.statusTitle}>RevenueCat integration</Text>
        <Text style={s.statusText}>
          {isPro
            ? 'Plus is active: RevenueCat reports the pro entitlement.'
            : billingReady
              ? 'SDK configured and ready to load offerings.'
              : `Add your ${Platform.OS} key from .env.example to activate store purchases.`}
        </Text>
      </View>
    </View>
  );
}
