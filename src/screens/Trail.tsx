import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ProofCardView } from '../components/ProofCardView';
import { Proof, Skill, skills } from '../proofline';
import { s } from '../styles';

type Filter = 'All' | Skill;
const filters: Filter[] = ['All', ...skills];

function EmptyTrail({ onBrowseMissions }: { onBrowseMissions: () => void }) {
  return (
    <View style={s.empty}>
      <View style={s.trailArt}>
        <View style={s.trailDot} />
        <View style={s.trailLine} />
        <View style={s.trailDot} />
        <View style={s.trailLine} />
        <View style={s.trailStart}><Text style={s.trailEmoji}>🌱</Text></View>
      </View>
      <Text style={s.emptyTitle}>Your trail starts with one real action.</Text>
      <Text style={s.emptyBody}>Complete a mission to create your first Proof Card.</Text>
      <Pressable accessibilityRole="button" onPress={onBrowseMissions} style={[s.primaryButton, s.compactButton, { alignSelf: 'stretch' }]}>
        <Text style={s.primaryButtonText}>Choose a mission</Text>
      </Pressable>
    </View>
  );
}

type Props = { proofs: Proof[]; onShare: (proof: Proof) => void; onBrowseMissions: () => void };

export function Trail({ proofs, onShare, onBrowseMissions }: Props) {
  const [filter, setFilter] = useState<Filter>('All');
  if (!proofs.length) return <EmptyTrail onBrowseMissions={onBrowseMissions} />;
  const visible = filter === 'All' ? proofs : proofs.filter((proof) => proof.skill === filter);

  return (
    <>
      <Text style={s.sectionTitle}>Your Proof Cards</Text>
      <View style={s.chips}>
        {filters.map((item) => {
          const active = item === filter;
          return (
            <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} key={item} onPress={() => setFilter(item)} style={[s.chip, active && s.chipActive]}>
              <Text style={[s.chipText, active && s.chipTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
      {visible.length ? (
        visible.map((proof) => <ProofCardView key={proof.id} proof={proof} onShare={onShare} />)
      ) : (
        <View style={s.empty}>
          <Text style={s.emptyBody}>No {filter} Proof Cards yet.</Text>
        </View>
      )}
    </>
  );
}
