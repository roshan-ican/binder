import { View } from 'react-native';
import {
  BackHeader,
  Button,
  Chip,
  Divider,
  Icon,
  Input,
  MatchLabel,
  Screen,
  SectionHeader,
  SkeletonCard,
  Text,
  TextButton,
  TrustBadge,
} from '../components';
import { colors, radius, size, spacing, typography } from '../theme';
import type { TypeVariant } from '../theme';

/**
 * The design system, rendered by the design system. Useful as a visual diff
 * against the Figma file when either side changes.
 */
export function FoundationsScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen>
      <BackHeader title="Design system" onBack={onBack} />

      <Text variant="editorial" style={{ marginTop: spacing[4] }}>
        Black, quiet, sharp.
      </Text>
      <Text variant="body" tone="secondary" style={{ marginTop: spacing[3] }}>
        Roughly 90% black and neutral, 10% chrome. Borders carry the structure; shadows barely exist.
      </Text>

      <Divider tone="chrome" style={{ marginTop: spacing[8] }} />

      <View style={{ marginTop: spacing[6], gap: spacing[4] }}>
        <SectionHeader title="Colour" />
        <Swatches
          title="Background"
          entries={[
            ['bg.primary', colors.bg.primary],
            ['bg.secondary', colors.bg.secondary],
            ['bg.raised', colors.bg.raised],
            ['bg.elevated', colors.bg.elevated],
          ]}
        />
        <Swatches
          title="Surface"
          entries={[
            ['surface.soft', colors.surface.soft],
            ['surface.hover', colors.surface.hover],
            ['surface.selected', colors.surface.selected],
            ['surface.field', colors.surface.field],
          ]}
        />
        <Swatches
          title="Chrome"
          entries={[
            ['chrome.100', colors.chrome[100]],
            ['chrome.200', colors.chrome[200]],
            ['chrome.300', colors.chrome[300]],
            ['chrome.400', colors.chrome[400]],
            ['chrome.500', colors.chrome[500]],
            ['chrome.600', colors.chrome[600]],
          ]}
        />
        <Swatches
          title="Semantic — errors and states only"
          entries={[
            ['success', colors.semantic.success],
            ['warning', colors.semantic.warning],
            ['danger', colors.semantic.danger],
            ['info', colors.semantic.info],
          ]}
        />
      </View>

      <Divider style={{ marginTop: spacing[8] }} />

      <View style={{ marginTop: spacing[6], gap: spacing[4] }}>
        <SectionHeader title="Type scale" />
        {(
          [
            ['displayLarge', 'Display large · 40/44'],
            ['displayMedium', 'Display medium · 32/36'],
            ['heading1', 'Heading 1 · 28/34'],
            ['heading2', 'Heading 2 · 24/30'],
            ['heading3', 'Heading 3 · 20/26'],
            ['bodyLarge', 'Body large · 17/25'],
            ['body', 'Body default · 15/22'],
            ['bodySmall', 'Body small · 13/18'],
            ['labelLarge', 'Label large · 14/18'],
            ['label', 'Label default · 12/16'],
            ['micro', 'Label micro · 10/14'],
            ['numberHero', '500'],
          ] as [TypeVariant, string][]
        ).map(([variant, sample]) => (
          <View key={variant} style={{ gap: spacing[1] }}>
            <Text variant="micro" tone="tertiary">
              {variant}
            </Text>
            <Text variant={variant}>{sample}</Text>
          </View>
        ))}
      </View>

      <Divider style={{ marginTop: spacing[8] }} />

      <View style={{ marginTop: spacing[6], gap: spacing[4] }}>
        <SectionHeader title="Spacing & radius" />
        {([4, 8, 12, 16, 20, 24, 32] as const).map((value) => (
          <View key={value} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
            <View style={{ width: value, height: spacing[4], backgroundColor: colors.chrome[500] }} />
            <Text variant="bodySmall" tone="tertiary">
              {value}
            </Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: spacing[3], marginTop: spacing[2] }}>
          {([radius.sm, radius.input, radius.md, radius.lg] as const).map((value) => (
            <View key={value} style={{ alignItems: 'center', gap: spacing[2] }}>
              <View
                style={{
                  width: 56,
                  height: 44,
                  borderRadius: value,
                  borderWidth: size.hairline,
                  borderColor: colors.border.default,
                }}
              />
              <Text variant="bodySmall" tone="tertiary">
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Divider style={{ marginTop: spacing[8] }} />

      <View style={{ marginTop: spacing[6], gap: spacing[4] }}>
        <SectionHeader title="Actions" />
        <Button label="Publish enquiry" />
        <Button label="Connect" variant="secondary" />
        <Button label="Publishing" loading loadingLabel="Publishing…" />
        <Button label="Close enquiry" variant="destructive" />
        <View style={{ flexDirection: 'row', gap: spacing[4] }}>
          <TextButton label="Skip for now" />
          <TextButton label="View all" tone="chrome" />
        </View>
      </View>

      <View style={{ marginTop: spacing[8], gap: spacing[4] }}>
        <SectionHeader title="Forms" />
        <Input label="Business name" value="Roshan Clothing" onChangeText={() => {}} />
        <Input label="Website" value="" placeholder="binder.example" onChangeText={() => {}} optional />
        <Input
          label="Minimum order"
          value="500"
          onChangeText={() => {}}
          error="Enter a number above 0"
          keyboardType="number-pad"
        />
        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          <Chip label="Leather" selected />
          <Chip label="Synthetic" />
          <Chip label="Kanpur" icon="mapPin" />
        </View>
      </View>

      <View style={{ marginTop: spacing[8], gap: spacing[4] }}>
        <SectionHeader title="Match & trust" />
        <MatchLabel quality="strong" />
        <MatchLabel quality="good" />
        <MatchLabel quality="potential" />
        <Divider />
        <TrustBadge signal="documents" />
        <TrustBadge signal="pending" />
        <TrustBadge signal="verified" detail="12 Aug 2026" />
        <TrustBadge signal="proven" />
      </View>

      <View style={{ marginTop: spacing[8], gap: spacing[4] }}>
        <SectionHeader title="Icons" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[5] }}>
          {(['search', 'plus', 'filter', 'mapPin', 'building', 'package', 'truck', 'message', 'bell', 'shield', 'document', 'star'] as const).map(
            (name) => (
              <Icon key={name} name={name} size={size.iconNav} />
            ),
          )}
        </View>
      </View>

      <View style={{ marginTop: spacing[8], gap: spacing[4] }}>
        <SectionHeader title="Loading" supporting="Three skeleton rows. Never a full-screen spinner." />
        <SkeletonCard />
      </View>
    </Screen>
  );
}

function Swatches({ title, entries }: { title: string; entries: [string, string][] }) {
  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="label" tone="secondary">
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
        {entries.map(([name, value]) => (
          <View key={name} style={{ gap: spacing[1], width: 96 }}>
            <View
              style={{
                height: 44,
                borderRadius: radius.sm,
                backgroundColor: value,
                borderWidth: size.hairline,
                borderColor: colors.border.subtle,
              }}
            />
            <Text style={[typography.micro, { color: colors.text.tertiary }]}>{name}</Text>
            <Text style={[typography.micro, { color: colors.text.disabled }]}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
