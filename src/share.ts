import { Platform, Share } from 'react-native';
import { notify } from './notify';
import { Proof, proofShareMessage } from './proofline';

const isCancel = (error: unknown) => error instanceof Error && error.name === 'AbortError';
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Sharing failed.');

async function copyForWeb(message: string) {
  await navigator.clipboard.writeText(message);
  notify('Copied to clipboard', 'This browser could not open a share sheet, so the Proof Card text was copied for you to paste.');
}

export async function shareProof(proof: Proof): Promise<void> {
  const message = proofShareMessage(proof);
  if (Platform.OS !== 'web') {
    try {
      await Share.share({ title: proof.title, message });
    } catch (error) {
      notify('Could not share', errorMessage(error));
    }
    return;
  }
  try {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: proof.title, text: message });
        return;
      } catch (error) {
        if (isCancel(error)) return;
      }
    }
    await copyForWeb(message);
  } catch (error) {
    notify('Could not share', errorMessage(error));
  }
}
