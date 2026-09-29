import { Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { ProofCardView } from '../components/ProofCardView';
import { Mission, Proof, evidenceChecks } from '../proofline';
import { colors, s } from '../styles';

type Props = {
  mission: Mission | null;
  completedProof: Proof | null;
  evidence: string;
  reflection: string;
  onChangeEvidence: (text: string) => void;
  onChangeReflection: (text: string) => void;
  onCreate: () => void;
  onClose: () => void;
  onShare: (proof: Proof) => void;
  onViewTrail: () => void;
};

function EvidenceChecklist({ evidence, reflection }: { evidence: string; reflection: string }) {
  return (
    <View style={s.checklist}>
      <Text style={s.checklistTitle}>Evidence quality</Text>
      <Text style={s.checklistNote}>Simple checks on the words you typed. This is guidance, not a score.</Text>
      {evidenceChecks(evidence, reflection).map((check) => (
        <View key={check.label} style={s.checkRow} accessibilityLabel={`${check.label}: ${check.met ? 'met' : 'not yet'}`}>
          <View style={[s.checkIcon, check.met && s.checkIconMet]}>{check.met && <Text style={s.checkMark}>✓</Text>}</View>
          <View style={s.checkCopy}>
            <Text style={s.checkLabel}>{check.label}</Text>
            <Text style={s.checkRule}>{check.rule}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function MissionSheet({ mission, completedProof, evidence, reflection, onChangeEvidence, onChangeReflection, onCreate, onClose, onShare, onViewTrail }: Props) {
  return (
    <Modal visible={!!mission} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.modal}>
        <View style={s.modalHeader}>
          <Pressable accessibilityRole="button" onPress={onClose}><Text style={s.close}>Close</Text></Pressable>
          <Text style={s.modalBrand}>proofline</Text>
        </View>
        {completedProof ? (
          <ScrollView contentContainerStyle={s.modalContent}>
            <Text style={s.eyebrowDark}>PROOF CARD CREATED</Text>
            <Text style={s.modalTitle}>This is now on your trail.</Text>
            <ProofCardView proof={completedProof} />
            <Pressable accessibilityRole="button" onPress={() => onShare(completedProof)} style={[s.primaryButton, { marginTop: 8 }]}>
              <Text style={s.primaryButtonText}>Share it</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onViewTrail} style={s.secondaryButton}>
              <Text style={s.secondaryButtonText}>View my trail</Text>
            </Pressable>
          </ScrollView>
        ) : mission && (
          <ScrollView contentContainerStyle={s.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={s.eyebrowDark}>REAL-WORLD MISSION · {mission.minutes} MIN</Text>
            <Text style={s.modalTitle}>{mission.title}</Text>
            <Text style={s.body}>{mission.prompt}</Text>
            <Text style={s.inputLabel}>What did you do? <Text style={s.required}>*</Text></Text>
            <TextInput value={evidence} onChangeText={onChangeEvidence} multiline placeholder="I helped my neighbor set up video calling with her family..." placeholderTextColor={colors.placeholder} style={s.input} />
            <Text style={s.inputLabel}>What changed or what did you learn? <Text style={s.required}>*</Text></Text>
            <TextInput value={reflection} onChangeText={onChangeReflection} multiline placeholder="I learned to explain technical steps without jargon..." placeholderTextColor={colors.placeholder} style={s.input} />
            <EvidenceChecklist evidence={evidence} reflection={reflection} />
            <Pressable accessibilityRole="button" onPress={onCreate} style={s.primaryButton}>
              <Text style={s.primaryButtonText}>Create my Proof Card</Text>
            </Pressable>
            <Text style={s.helper}>Proofline structures your own evidence. It does not invent achievements.</Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
