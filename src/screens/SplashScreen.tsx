import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../theme';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Binder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.primary,
  },
  title: {
    color: colors.text.primary,
    fontFamily: fontFamily.semibold,
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -1.5,
  },
});
