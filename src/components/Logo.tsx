import { View } from 'react-native';
import { colors, radius, size } from '../theme';
import { ChromeSurface } from './ChromeSurface';
import { Text } from './Text';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

const dimensions: Record<LogoSize, number> = {
  sm: size.logoSm,
  md: size.logo,
  lg: size.logoMd,
  xl: size.logoLg,
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

/**
 * Square container, neutral background, initials fallback when a business
 * skips the logo upload. Never a forced circle — circles are for people.
 */
export function Logo({ name, size: logoSize = 'md' }: { name: string; size?: LogoSize }) {
  const dimension = dimensions[logoSize];
  const variant = dimension >= size.logoLg ? 'heading3' : dimension >= size.logo ? 'labelLarge' : 'label';

  return (
    <View
      accessible
      accessibilityLabel={`${name} logo`}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: radius.sm,
        backgroundColor: '#D8D2CC',
        borderWidth: 1,
        borderColor: '#EFEAE5',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <ChromeSurface borderRadius={radius.sm} intensity="soft" />
      <Text variant={variant} tone="inverse">
        {initials(name)}
      </Text>
    </View>
  );
}
