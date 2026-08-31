import { useMemo, useState } from 'react';
import { FlatList, Modal, View } from 'react-native';
import type { TaxonomyItem } from '../data/jobTaxonomy';
import { customTaxonomyId, matchesTaxonomy, taxonomyLabel } from '../data/jobTaxonomy';
import { colors, radius, size, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { Button } from './Button';
import { Chip } from './Chip';
import { Input } from './Input';
import { Text } from './Text';

export function TaxonomyPicker({
  label,
  placeholder,
  searchPlaceholder,
  options,
  selectedIds,
  onChange,
  multiple = false,
  allowCustom = false,
  error,
  helper,
}: {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  options: TaxonomyItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  multiple?: boolean;
  allowCustom?: boolean;
  error?: string;
  helper?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = useMemo(() => options.filter((item) => matchesTaxonomy(item, query)), [options, query]);
  const exactMatch = options.some((item) =>
    [item.label, ...item.aliases].some((value) => value.toLowerCase() === query.trim().toLowerCase()),
  );
  const customId = customTaxonomyId(query);

  const toggle = (id: string) => {
    if (!multiple) {
      onChange([id]);
      setOpen(false);
      setQuery('');
      return;
    }
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  };

  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="label" tone="secondary">{label}</Text>
      {selectedIds.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
          {selectedIds.map((id) => (
            <Chip
              key={id}
              label={taxonomyLabel(id, options)}
              selected
              onRemove={multiple ? () => toggle(id) : undefined}
            />
          ))}
        </View>
      ) : null}
      <Button
        label={selectedIds.length ? (multiple ? `Add more ${label.toLowerCase()}` : `Change ${label.toLowerCase()}`) : placeholder}
        variant="secondary"
        onPress={() => setOpen(true)}
      />
      {error || helper ? (
        <Text variant="bodySmall" tone={error ? 'danger' : 'tertiary'}>{error ?? helper}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.68)' }}>
          <View style={{ height: '82%', backgroundColor: colors.bg.raised, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing[5], gap: spacing[4] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="heading3">{label}</Text>
              <AnimatedPressable accessibilityRole="button" accessibilityLabel={`Close ${label}`} onPress={() => setOpen(false)} hitSlop={spacing[2]}>
                <Text variant="labelLarge" tone="secondary">Close</Text>
              </AnimatedPressable>
            </View>
            <Input label={`Search ${label.toLowerCase()}`} value={query} onChangeText={setQuery} placeholder={searchPlaceholder} />
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text variant="body" tone="secondary">No catalogue results.</Text>
              }
              renderItem={({ item }) => {
                const selected = selectedIds.includes(item.id);
                return (
                  <AnimatedPressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${selected ? 'Remove' : 'Select'} ${item.label}`}
                    onPress={() => toggle(item.id)}
                    style={{ minHeight: size.control, justifyContent: 'center', borderBottomWidth: size.hairline, borderBottomColor: colors.border.subtle }}
                  >
                    <Text variant="body" tone={selected ? 'chrome' : 'primary'}>{selected ? '✓ ' : ''}{item.label}</Text>
                  </AnimatedPressable>
                );
              }}
              ListFooterComponent={
                allowCustom && customId !== 'custom:' && query.trim().length >= 2 && !exactMatch && !selectedIds.includes(customId) ? (
                  <AnimatedPressable
                    accessibilityRole="button"
                    accessibilityLabel={`Add custom ${label} ${query.trim()}`}
                    onPress={() => toggle(customId)}
                    style={{ minHeight: size.control, justifyContent: 'center' }}
                  >
                    <Text variant="body" tone="chrome">+ Add “{query.trim()}”</Text>
                  </AnimatedPressable>
                ) : null
              }
            />
            {multiple ? <Button label="Done" onPress={() => { setOpen(false); setQuery(''); }} /> : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
