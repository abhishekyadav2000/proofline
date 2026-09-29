import { Pressable, Text, View } from 'react-native';
import { Stat } from '../components/Stat';
import { FREE_PROOF_CARD_LIMIT, Mission, Proof, canCreateProofCard, currentStreak, missions, nextBestMission, totalMinutes } from '../proofline';
import { s } from '../styles';

const steps = ['Choose a real-world mission', 'Capture what you did', 'Build proof of skill'];

type Props = { proofs: Proof[]; cardsUsed: number; isPro: boolean; onStart: (mission: Mission) => void; onUpgrade: () => void };

export function Today({ proofs, cardsUsed, isPro, onStart, onUpgrade }: Props) {
  const streak = currentStreak(proofs);
  const next = nextBestMission(proofs);
  const used = Math.min(cardsUsed, FREE_PROOF_CARD_LIMIT);
  const atLimit = !canCreateProofCard(cardsUsed, isPro);

  return (
    <>
      <View style={s.hero}>
        <Text style={s.eyebrow}>YOUR SKILL TRAIL</Text>
        <Text style={s.heroTitle}>Do something real.{'\n'}Make it count.</Text>
        <Text style={s.heroCopy}>Capture the effort that a résumé cannot show.</Text>
        <View style={s.statRow}>
          <Stat label="Proof Cards" value={String(proofs.length)} />
          <Stat label="Action minutes" value={String(totalMinutes(proofs))} />
          <Stat label="Day streak" value={String(streak)} />
        </View>
      </View>

      <View style={s.howCard}>
        <Text style={s.eyebrowDark}>HOW PROOFLINE WORKS</Text>
        {steps.map((step, index) => (
          <View key={step} style={s.howStep}>
            <View style={s.howNumber}><Text style={s.howNumberText}>{index + 1}</Text></View>
            <Text style={s.howStepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={s.nextCard}>
        <Text style={s.eyebrowDark}>NEXT BEST ACTION</Text>
        <Text style={s.nextTitle}>{next.mission.title}</Text>
        <Text style={s.nextReason}>{next.mission.minutes} min · {next.reason}</Text>
        <Pressable accessibilityRole="button" onPress={() => onStart(next.mission)} style={[s.primaryButton, s.compactButton]}>
          <Text style={s.primaryButtonText}>{atLimit ? 'Unlock Plus to continue' : 'Start this mission'}</Text>
        </Pressable>
      </View>

      <Pressable accessibilityRole={atLimit ? 'button' : undefined} disabled={!atLimit} onPress={onUpgrade} style={s.planCard}>
        {isPro ? (
          <Text style={s.planText}>Proofline Plus: unlimited Proof Cards.</Text>
        ) : (
          <>
            <Text style={s.planText}>Free plan: {used} of {FREE_PROOF_CARD_LIMIT} Proof Cards used.</Text>
            <View style={s.planBar}>
              {Array.from({ length: FREE_PROOF_CARD_LIMIT }, (_, index) => <View key={index} style={[s.planSegment, index < used && s.planSegmentFilled]} />)}
            </View>
            {atLimit && <Text style={s.planHint}>Your next Proof Card needs Plus. Tap to see details.</Text>}
          </>
        )}
      </Pressable>

      <Text style={s.sectionTitle}>Today’s missions</Text>
      {missions.map((mission, index) => (
        <Pressable accessibilityRole="button" key={mission.id} style={s.mission} onPress={() => onStart(mission)}>
          <View style={s.number}><Text style={s.numberText}>0{index + 1}</Text></View>
          <View style={s.missionCopy}>
            <Text style={s.missionMeta}>{mission.minutes} min · {mission.skill}</Text>
            <Text style={s.missionTitle}>{mission.title}</Text>
            <Text style={s.missionOutcome}>Turns into proof of {mission.skill}.</Text>
          </View>
          <Text style={s.arrow}>→</Text>
        </Pressable>
      ))}
    </>
  );
}
