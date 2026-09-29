import AsyncStorage from '@react-native-async-storage/async-storage';
import { Proof, skills } from './proofline';

const STORAGE_KEY = 'proofline/state/v1';

export type StoredState = {
  onboardingComplete: boolean;
  proofs: Proof[];
  /** Counts every card ever created, so the free-plan limit cannot be reset by removing cards. */
  proofCardsCreated: number;
};

export const emptyState: StoredState = { onboardingComplete: false, proofs: [], proofCardsCreated: 0 };

function isProof(value: unknown): value is Proof {
  if (!value || typeof value !== 'object') return false;
  const proof = value as Record<string, unknown>;
  return (
    typeof proof.id === 'string' &&
    typeof proof.missionId === 'string' &&
    typeof proof.title === 'string' &&
    skills.includes(proof.skill as Proof['skill']) &&
    typeof proof.minutes === 'number' &&
    typeof proof.evidence === 'string' &&
    typeof proof.reflection === 'string' &&
    typeof proof.createdAt === 'string'
  );
}

export async function loadState(): Promise<StoredState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyState;
  const parsed = JSON.parse(raw) as Partial<StoredState>;
  const proofs = Array.isArray(parsed.proofs) ? parsed.proofs.filter(isProof) : [];
  const created = typeof parsed.proofCardsCreated === 'number' ? parsed.proofCardsCreated : 0;
  return {
    onboardingComplete: parsed.onboardingComplete === true,
    proofs,
    proofCardsCreated: Math.max(created, proofs.length),
  };
}

export async function saveState(state: StoredState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
