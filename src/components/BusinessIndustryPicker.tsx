import { useMemo, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { businessIndustryGroups } from '../data/businessTaxonomy';
import { colors, radius, size, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { Button } from './Button';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { Input } from './Input';
import { Text } from './Text';

export function BusinessIndustryPicker({ selected, onChange, error }: { selected: string[]; onChange: (industries: string[]) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const activeGroup = businessIndustryGroups.find((group) => group.id === groupId);
  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return businessIndustryGroups.flatMap((group) => group.industries
      .filter((industry) => industry.toLowerCase().includes(term) || group.label.toLowerCase().includes(term))
      .map((industry) => ({ industry, group: group.label })));
  }, [query]);

  const toggle = (industry: string) => onChange(selected.includes(industry)
    ? selected.filter((item) => item !== industry)
    : [...selected, industry]);
  const close = () => { setOpen(false); setGroupId(null); setQuery(''); };

  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="label" tone="secondary">Industries</Text>
      {selected.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
        {selected.map((industry) => <Chip key={industry} label={industry} selected onRemove={() => toggle(industry)} />)}
      </View> : null}
      <Button label={selected.length ? 'Add more industries' : 'Choose industries'} variant="secondary" onPress={() => setOpen(true)} />
      <Text variant="bodySmall" tone={error ? 'danger' : 'tertiary'}>{error ?? 'Choose more than one if your business works across industries.'}</Text>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.68)' }}>
          <View style={{ height: '88%', backgroundColor: colors.bg.raised, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing[5], gap: spacing[4] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
              {activeGroup ? <AnimatedPressable accessibilityRole="button" accessibilityLabel="Back to industry groups" onPress={() => setGroupId(null)} hitSlop={spacing[2]}><Icon name="arrowLeft" color={colors.text.primary} /></AnimatedPressable> : null}
              <Text variant="heading3" style={{ flex: 1 }}>{activeGroup?.label ?? 'Choose industries'}</Text>
              <AnimatedPressable accessibilityRole="button" accessibilityLabel="Close industry picker" onPress={close} hitSlop={spacing[2]}><Text variant="labelLarge" tone="secondary">Close</Text></AnimatedPressable>
            </View>
            {!activeGroup ? <Input label="Search all industries" value={query} onChangeText={setQuery} placeholder="Crypto, healthcare, textiles..." /> : null}
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing[5] }}>
              {query.trim() ? searchResults.map(({ industry, group }) => <IndustryRow key={`${group}-${industry}`} label={industry} detail={group} selected={selected.includes(industry)} onPress={() => toggle(industry)} />)
                : activeGroup ? activeGroup.industries.map((industry) => <IndustryRow key={industry} label={industry} selected={selected.includes(industry)} onPress={() => toggle(industry)} />)
                  : businessIndustryGroups.map((group) => {
                    const count = group.industries.filter((industry) => selected.includes(industry)).length;
                    return <AnimatedPressable key={group.id} accessibilityRole="button" accessibilityLabel={`Open ${group.label}`} onPress={() => setGroupId(group.id)} style={{ minHeight: size.control, flexDirection: 'row', alignItems: 'center', gap: spacing[3], borderBottomWidth: size.hairline, borderBottomColor: colors.border.subtle, paddingVertical: spacing[3] }}>
                      <View style={{ flex: 1, gap: spacing[1] }}><Text variant="body">{group.label}</Text><Text variant="bodySmall" tone="tertiary">{group.industries.length} options{count ? ` · ${count} selected` : ''}</Text></View>
                      <Icon name="chevronRight" size={size.iconSm} color={colors.text.tertiary} />
                    </AnimatedPressable>;
                  })}
              {query.trim() && !searchResults.length ? <Text variant="body" tone="secondary" style={{ paddingVertical: spacing[6] }}>No matching industries found.</Text> : null}
            </ScrollView>
            <Button label={selected.length ? `Done · ${selected.length} selected` : 'Select an industry'} disabled={!selected.length} onPress={close} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function IndustryRow({ label, detail, selected, onPress }: { label: string; detail?: string; selected: boolean; onPress: () => void }) {
  return <AnimatedPressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={label} onPress={onPress} style={{ minHeight: size.control, flexDirection: 'row', alignItems: 'center', gap: spacing[3], borderBottomWidth: size.hairline, borderBottomColor: colors.border.subtle, paddingVertical: spacing[3] }}>
    <View style={{ flex: 1, gap: spacing[1] }}><Text variant="body" tone={selected ? 'chrome' : 'primary'}>{label}</Text>{detail ? <Text variant="bodySmall" tone="tertiary">{detail}</Text> : null}</View>
    {selected ? <Icon name="badgeCheck" size={size.icon} color={colors.chrome[200]} /> : null}
  </AnimatedPressable>;
}
