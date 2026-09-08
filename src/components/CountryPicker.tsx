import { View } from 'react-native';
import { countries, type CountryCode } from '../data/countries';
import { spacing } from '../theme';
import { Chip } from './Chip';
import { Text } from './Text';

export function CountryPicker({ selected, onChange }: { selected: CountryCode; onChange: (code: CountryCode) => void }) {
  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="label" tone="secondary">Where does your business operate?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
        {countries.map((country) => (
          <Chip key={country.code} label={`${country.flag}  ${country.name}`} selected={country.code === selected} onPress={() => onChange(country.code)} />
        ))}
      </View>
      <Text variant="bodySmall" tone="tertiary">This sets your location list, registration number and currency.</Text>
    </View>
  );
}
