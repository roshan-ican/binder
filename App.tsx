import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { colors } from './src/theme';

export default function App() {
  const { width, height } = useWindowDimensions();
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    InstrumentSerif_400Regular,
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    const timeout = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timeout);
  }, [fontError, fontsLoaded]);

  // Keep the launch canvas dark while fonts load. If a font fails, continue
  // with the system fallback instead of trapping the user here.
  if (!fontsLoaded && !fontError) {
    return <View style={[styles.appShell, { width, height }]} />;
  }

  if (showSplash) {
    return (
      <View style={[styles.appShell, { width, height }]}>
        <StatusBar style="light" />
        <SplashScreen />
      </View>
    );
  }

  return (
    <View style={[styles.appShell, { width, height }]}>
      <SafeAreaProvider style={styles.safeAreaProvider}>
        <StatusBar style="light" />
        <AppNavigator />
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.bg.primary,
    overflow: 'hidden',
  },
  safeAreaProvider: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
