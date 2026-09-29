import { Pressable, Text, View } from 'react-native';
import { Proof, formatProofDate } from '../proofline';
import { s } from '../styles';

export function ProofCardView({ proof, onShare }: { proof: Proof; onShare?: (proof: Proof) => void }) {
  return (
    <View style={s.card}>
      <Text style={s.cardMeta}>{formatProofDate(proof.createdAt).toUpperCase()} · {proof.skill.toUpperCase()}</Text>
      <Text style={s.cardTitle}>{proof.title}</Text>
      <Text style={s.cardLabel}>WHAT I DID</Text>
      <Text style={s.cardText}>{proof.evidence}</Text>
      <Text style={s.cardLabel}>WHAT I LEARNED</Text>
      <Text style={s.cardText}>{proof.reflection}</Text>
      <View style={s.cardFooter}>
        <Text style={s.cardBrand}>proofline</Text>
        <Text style={s.verified}>● Evidence captured · {proof.minutes} min</Text>
      </View>
      {onShare && (
        <Pressable accessibilityRole="button" onPress={() => onShare(proof)} style={s.shareButton}>
          <Text style={s.shareButtonText}>Share Proof Card</Text>
        </Pressable>
      )}
    </View>
  );
}
