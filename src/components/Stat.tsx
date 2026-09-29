import { Text, View } from 'react-native';
import { s } from '../styles';

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}
