import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { notify } from './src/notify';
import { MIN_ENTRY_LENGTH, Mission, Proof, canCreateProofCard } from './src/proofline';
import { MissionSheet } from './src/screens/MissionSheet';
import { Onboarding } from './src/screens/Onboarding';
import { Paywall } from './src/screens/Paywall';
import { Profile } from './src/screens/Profile';
import { Today } from './src/screens/Today';
import { Trail } from './src/screens/Trail';
import { shareProof } from './src/share';
import { StoredState, emptyState, loadState, saveState } from './src/storage';
import { colors, s } from './src/styles';
import { useProoflinePlus } from './src/useProoflinePlus';

type Tab = 'Today' | 'Trail' | 'Profile';
const tabs: Tab[] = ['Today', 'Trail', 'Profile'];

export default function App() {
  const [data, setData] = useState<StoredState | null>(null);
  const [tab, setTab] = useState<Tab>('Today');
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [completedProof, setCompletedProof] = useState<Proof | null>(null);
  const [evidence, setEvidence] = useState('');
  const [reflection, setReflection] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);
  const plus = useProoflinePlus({
    onUnlocked: (message) => {
      setPaywallOpen(false);
      notify('Proofline Plus unlocked', message);
    },
  });
  const { isPro } = plus;

  useEffect(() => {
    loadState()
      .then(setData)
      .catch((error: unknown) => {
        notify('Could not load saved data', error instanceof Error ? error.message : 'Local storage could not be read.');
        setData(emptyState);
      });
  }, []);

  const openPaywall = () => {
    setPaywallOpen(true);
    void plus.loadOffering();
  };

  if (!data) {
    return <View style={s.loading}><ActivityIndicator color={colors.green} /></View>;
  }

  const persist = (next: StoredState) => {
    setData(next);
    saveState(next).catch((error: unknown) => notify('Could not save', error instanceof Error ? error.message : 'Local storage could not be written.'));
  };

  if (!data.onboardingComplete) {
    return <Onboarding onFinish={() => persist({ ...data, onboardingComplete: true })} />;
  }

  const atFreeLimit = !canCreateProofCard(data.proofCardsCreated, isPro);

  const startMission = (mission: Mission) => {
    if (atFreeLimit) {
      openPaywall();
      return;
    }
    setCompletedProof(null);
    setActiveMission(mission);
  };

  const closeMission = () => {
    setActiveMission(null);
    setCompletedProof(null);
  };

  const createProof = () => {
    if (!activeMission) return;
    if (atFreeLimit) {
      closeMission();
      openPaywall();
      return;
    }
    if (evidence.trim().length < MIN_ENTRY_LENGTH || reflection.trim().length < MIN_ENTRY_LENGTH) {
      notify('Add a little more', 'Write at least a sentence for both evidence and reflection. Proofline turns real action into credible proof.');
      return;
    }
    const proof: Proof = {
      id: String(Date.now()),
      missionId: activeMission.id,
      title: activeMission.title,
      skill: activeMission.skill,
      minutes: activeMission.minutes,
      evidence: evidence.trim(),
      reflection: reflection.trim(),
      createdAt: new Date().toISOString(),
    };
    persist({ ...data, proofs: [proof, ...data.proofs], proofCardsCreated: data.proofCardsCreated + 1 });
    setEvidence('');
    setReflection('');
    setCompletedProof(proof);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <View style={s.header}>
        <View>
          <Text style={s.wordmark}>proofline</Text>
          <Text style={s.subhead}>Evidence beats empty claims.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={openPaywall} style={s.plusPill}><Text style={s.plusText}>PLUS</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {tab === 'Today' && <Today proofs={data.proofs} cardsUsed={data.proofCardsCreated} isPro={isPro} onStart={startMission} onUpgrade={openPaywall} />}
        {tab === 'Trail' && <Trail proofs={data.proofs} onShare={shareProof} onBrowseMissions={() => setTab('Today')} />}
        {tab === 'Profile' && <Profile proofs={data.proofs} billingReady={plus.billingReady} isPro={isPro} />}
      </ScrollView>
      <View style={s.nav}>
        {tabs.map((item) => (
          <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === item }} key={item} onPress={() => setTab(item)} style={s.navItem}>
            <Text style={[s.navText, tab === item && s.navTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <MissionSheet
        mission={activeMission}
        completedProof={completedProof}
        evidence={evidence}
        reflection={reflection}
        onChangeEvidence={setEvidence}
        onChangeReflection={setReflection}
        onCreate={createProof}
        onClose={closeMission}
        onShare={shareProof}
        onViewTrail={() => {
          closeMission();
          setTab('Trail');
        }}
      />
      <Paywall
        visible={paywallOpen}
        isPro={isPro}
        cardsUsed={data.proofCardsCreated}
        offering={plus.offering}
        action={plus.action}
        notice={plus.notice}
        onClose={() => setPaywallOpen(false)}
        onBuy={plus.buy}
        onRestore={plus.restore}
        onRetry={() => void plus.loadOffering()}
      />
    </SafeAreaView>
  );
}
