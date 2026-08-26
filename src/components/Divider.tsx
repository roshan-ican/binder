import { View, type ViewStyle } from 'react-native';
import { colors, size } from '../theme';

/**
 * Hairline rule. `chrome` is the premium variant — one per screen at most,
 * reserved for a high-value section opener.
 */
export function Divider({ tone = 'subtle', style }: { tone?: 'subtle' | 'default' | 'chrome'; style?: ViewStyle }) {
  const backgroundColor =
    tone === 'chrome' ? colors.chrome[500] : tone === 'default' ? colors.border.default : colors.border.subtle;

  return <View style={[{ height: size.hairline, backgroundColor }, style]} />;
}
