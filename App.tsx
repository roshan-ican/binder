import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    InstrumentSerif_400Regular,
  });

  // Black canvas while the faces load — no artificial splash time, and if a
  // font fails we still render rather than trapping the user on a blank screen.
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.bg.primary }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
