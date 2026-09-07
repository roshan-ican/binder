import { useMemo, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { indiaStatesWithCities } from '../data/indiaLocations';
import { colors, radius, size, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { Button } from './Button';
import { Icon } from './Icon';
import { Input } from './Input';
import { Text } from './Text';

export function CityStatePicker({
  city,
  state,
  onChange,
  error,
}: {
  city: string;
  state: string;
  onChange: (value: { city: string; state: string }) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeState, setActiveState] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const activeStateEntry = indiaStatesWithCities.find((entry) => entry.state === activeState);

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return indiaStatesWithCities.flatMap((entry) => entry.cities
      .filter((city) => city.toLowerCase().includes(term) || entry.state.toLowerCase().includes(term))
      .map((city) => ({ city, state: entry.state })));
  }, [query]);

  const select = (nextCity: string, nextState: string) => {
    onChange({ city: nextCity, state: nextState });
    close();
  };
  const close = () => { setOpen(false); setActiveState(null); setQuery(''); };

  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="label" tone="secondary">City &amp; state</Text>
      <Button
        label={city && state ? `${city}, ${state}` : 'Choose city & state'}
        variant="secondary"
        onPress={() => setOpen(true)}
      />
      <Text variant="bodySmall" tone={error ? 'danger' : 'tertiary'}>{error ?? 'Buyers and sellers you connect with will see this.'}</Text>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.68)' }}>
          <View style={{ height: '88%', backgroundColor: colors.bg.raised, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing[5], gap: spacing[4] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
              {activeStateEntry ? <AnimatedPressable accessibilityRole="button" accessibilityLabel="Back to states" onPress={() => setActiveState(null)} hitSlop={spacing[2]}><Icon name="arrowLeft" color={colors.text.primary} /></AnimatedPressable> : null}
              <Text variant="heading3" style={{ flex: 1 }}>{activeStateEntry?.state ?? 'Choose state'}</Text>
              <AnimatedPressable accessibilityRole="button" accessibilityLabel="Close city and state picker" onPress={close} hitSlop={spacing[2]}><Text variant="labelLarge" tone="secondary">Close</Text></AnimatedPressable>
            </View>
            {!activeStateEntry ? <Input label="Search states or cities" value={query} onChangeText={setQuery} placeholder="Kanpur, Maharashtra..." /> : null}
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing[5] }}>
              {query.trim()
                ? searchResults.map(({ city: resultCity, state: resultState }) => (
                  <LocationRow
                    key={`${resultState}-${resultCity}`}
                    label={resultCity}
                    detail={resultState}
                    selected={resultCity === city && resultState === state}
                    onPress={() => select(resultCity, resultState)}
                  />
                ))
                : activeStateEntry
                  ? activeStateEntry.cities.map((entryCity) => (
                    <LocationRow
                      key={entryCity}
                      label={entryCity}
                      selected={entryCity === city && activeStateEntry.state === state}
                      onPress={() => select(entryCity, activeStateEntry.state)}
                    />
                  ))
                  : indiaStatesWithCities.map((entry) => (
                    <AnimatedPressable
                      key={entry.state}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${entry.state}`}
                      onPress={() => setActiveState(entry.state)}
                      style={{ minHeight: size.control, flexDirection: 'row', alignItems: 'center', gap: spacing[3], borderBottomWidth: size.hairline, borderBottomColor: colors.border.subtle, paddingVertical: spacing[3] }}
                    >
                      <View style={{ flex: 1, gap: spacing[1] }}>
                        <Text variant="body">{entry.state}</Text>
                        <Text variant="bodySmall" tone="tertiary">{entry.cities.length} cities{entry.state === state ? ` · ${city} selected` : ''}</Text>
                      </View>
                      <Icon name="chevronRight" size={size.iconSm} color={colors.text.tertiary} />
                    </AnimatedPressable>
                  ))}
              {query.trim() && !searchResults.length ? <Text variant="body" tone="secondary" style={{ paddingVertical: spacing[6] }}>No matching city or state found.</Text> : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function LocationRow({ label, detail, selected, onPress }: { label: string; detail?: string; selected: boolean; onPress: () => void }) {
  return <AnimatedPressable accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={label} onPress={onPress} style={{ minHeight: size.control, flexDirection: 'row', alignItems: 'center', gap: spacing[3], borderBottomWidth: size.hairline, borderBottomColor: colors.border.subtle, paddingVertical: spacing[3] }}>
    <View style={{ flex: 1, gap: spacing[1] }}><Text variant="body" tone={selected ? 'chrome' : 'primary'}>{label}</Text>{detail ? <Text variant="bodySmall" tone="tertiary">{detail}</Text> : null}</View>
    {selected ? <Icon name="badgeCheck" size={size.icon} color={colors.chrome[200]} /> : null}
  </AnimatedPressable>;
}
