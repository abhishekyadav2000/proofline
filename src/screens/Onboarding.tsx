import { useState } from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { s } from '../styles';

const slides = [
  { emoji: '🌱', title: 'Skills are built in real life.', body: 'Proofline gives you short real-world missions: help someone, fix something, teach something.' },
  { emoji: '✍️', title: 'Capture the action, not just the claim.', body: 'Write what you actually did and what changed. Proofline structures your words. It never invents achievements.' },
  { emoji: '🧭', title: 'Build a proof trail you can share.', body: 'Each mission becomes a Proof Card on your trail, saved on this device. Share any card as text.' },
];

export function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.onboard}>
        <Pressable accessibilityRole="button" onPress={onFinish} style={s.skip}>
          <Text style={s.close}>Skip</Text>
        </Pressable>
        <View style={s.onboardBody}>
          <View style={s.onboardVisual}><Text style={s.onboardEmoji}>{slide.emoji}</Text></View>
          <Text style={s.eyebrowDark}>STEP {index + 1} OF {slides.length}</Text>
          <Text style={s.onboardTitle}>{slide.title}</Text>
          <Text style={s.body}>{slide.body}</Text>
        </View>
        <View style={s.dots}>
          {slides.map((item, dotIndex) => <View key={item.title} style={[s.dot, dotIndex === index && s.dotActive]} />)}
        </View>
        <Pressable accessibilityRole="button" onPress={isLast ? onFinish : () => setIndex(index + 1)} style={s.primaryButton}>
          <Text style={s.primaryButtonText}>{isLast ? 'Start building my trail' : 'Next'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
