import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert is a no-op, so the browser needs window.alert.
export function notify(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}
