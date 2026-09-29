export type Skill = 'Communication' | 'Problem solving' | 'Leadership';
export type Mission = { id: string; title: string; minutes: number; skill: Skill; prompt: string };
export type Proof = {
  id: string;
  missionId: string;
  title: string;
  skill: Skill;
  minutes: number;
  evidence: string;
  reflection: string;
  createdAt: string;
};
export type EvidenceCheck = { label: string; rule: string; met: boolean };

export const FREE_PROOF_CARD_LIMIT = 3;
export const MIN_ENTRY_LENGTH = 10;
export const skills: Skill[] = ['Communication', 'Problem solving', 'Leadership'];

export const missions: Mission[] = [
  { id: '1', title: 'Make technology easier for someone', minutes: 15, skill: 'Communication', prompt: 'Help someone complete a digital task they find difficult. What changed for them?' },
  { id: '2', title: 'Fix one friction point around you', minutes: 20, skill: 'Problem solving', prompt: 'Notice a repeated inconvenience and make a small improvement. What was the before and after?' },
  { id: '3', title: 'Create a useful learning guide', minutes: 25, skill: 'Leadership', prompt: 'Turn something you know into a simple guide another person can use.' },
];

/** Free users get FREE_PROOF_CARD_LIMIT cards; only a verified pro entitlement lifts the limit. */
export function canCreateProofCard(cardsCreated: number, hasVerifiedPro: boolean): boolean {
  return hasVerifiedPro || cardsCreated < FREE_PROOF_CARD_LIMIT;
}

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const OUTCOME_WORDS = /\b(change[ds]?|now|results?|resulted|so that|helped|improved|fixed|saved|able|became|learned|finished|solved|could|faster|easier)\b/i;

export function evidenceChecks(evidence: string, reflection: string): EvidenceCheck[] {
  return [
    { label: 'Describes an action', rule: '“What did you do?” has at least 6 words.', met: wordCount(evidence) >= 6 },
    { label: 'Mentions an outcome', rule: 'Uses a result word such as changed, now, helped, fixed, or learned.', met: OUTCOME_WORDS.test(`${evidence} ${reflection}`) },
    { label: 'Includes a reflection', rule: '“What changed or what did you learn?” has at least 6 words.', met: wordCount(reflection) >= 6 },
  ];
}

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

/** Consecutive local days with at least one Proof Card, ending today or yesterday. */
export function currentStreak(proofs: Proof[], now = new Date()): number {
  const days = new Set(proofs.map((proof) => dayKey(new Date(proof.createdAt))));
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function totalMinutes(proofs: Proof[]): number {
  return proofs.reduce((sum, proof) => sum + proof.minutes, 0);
}

/** Recommends the mission whose skill has the fewest Proof Cards; ties go to list order. */
export function nextBestMission(proofs: Proof[]): { mission: Mission; reason: string } {
  const counts = new Map<Skill, number>(skills.map((skill) => [skill, 0]));
  proofs.forEach((proof) => counts.set(proof.skill, (counts.get(proof.skill) ?? 0) + 1));
  const countFor = (mission: Mission) => counts.get(mission.skill) ?? 0;
  const mission = missions.reduce((best, candidate) => (countFor(candidate) < countFor(best) ? candidate : best), missions[0]);
  const count = countFor(mission);
  if (proofs.length === 0) return { mission, reason: `The shortest mission (${mission.minutes} min). A good first step.` };
  if (count === 0) return { mission, reason: `You have no ${mission.skill} proof yet.` };
  return { mission, reason: `${mission.skill} has your fewest Proof Cards (${count}).` };
}

export function proofShareMessage(proof: Proof): string {
  return [
    `${proof.title}`,
    `Skill: ${proof.skill}`,
    '',
    'What I did:',
    proof.evidence,
    '',
    'What I learned:',
    proof.reflection,
    '',
    'Captured with Proofline',
  ].join('\n');
}

export function formatProofDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
