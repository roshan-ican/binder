import { View } from 'react-native';
import {
  Card,
  Chip,
  Divider,
  Icon,
  Logo,
  Screen,
  ScreenHeading,
  SectionHeader,
  Text,
  TextButton,
  TrustBadge,
} from '../components';
import { me } from '../data/mock';
import { colors, rhythm, size, spacing } from '../theme';

export function ProfileScreen({ onOpenFoundations }: { onOpenFoundations: () => void }) {
  return (
    <Screen>
      <ScreenHeading title="Profile" />

      <View style={{ flexDirection: 'row', gap: spacing[4], alignItems: 'center', marginTop: rhythm.titleToContent }}>
        <Logo name={me.business} size="lg" />
        <View style={{ flex: 1, gap: spacing[1] }}>
          <Text variant="heading3">{me.business}</Text>
          <Text variant="bodySmall" tone="secondary">
            {me.industry} · {me.city}
          </Text>
          <TextButton label="View public profile" />
        </View>
      </View>

      {/* Completeness is stated plainly. No progress arcade. */}
      <Card style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <Text variant="body">Your profile is {me.completeness}% complete.</Text>
        <Text variant="bodySmall" tone="secondary">
          Add two details to improve matching.
        </Text>
        <View style={{ gap: spacing[2], marginTop: spacing[1] }}>
          <Text variant="bodySmall" tone="tertiary">
            + Monthly capacity
          </Text>
          <Text variant="bodySmall" tone="tertiary">
            + Registration document
          </Text>
        </View>
      </Card>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="What you offer" action="Edit" />
        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          {me.offers.map((offer) => (
            <Chip key={offer} label={offer} />
          ))}
        </View>
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="What you need" action="Edit" />
        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          {me.needs.map((need) => (
            <Chip key={need} label={need} />
          ))}
        </View>
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="Documents & verification" />
        <TrustBadge signal="verified" detail="GST · verified 12 Aug 2026" />
        <TrustBadge signal="pending" detail="Company registration" />
        <TrustBadge signal="documents" detail="Catalogue · not verified" />
      </View>

      <Divider style={{ marginTop: rhythm.sectionToSection }} />

      <View style={{ marginTop: spacing[4] }}>
        {[
          { label: 'Saved searches', onPress: undefined },
          { label: 'Team', onPress: undefined },
          { label: 'Notification preferences', onPress: undefined },
          { label: 'Design system', onPress: onOpenFoundations },
          { label: 'Account', onPress: undefined },
        ].map((row) => (
          <View key={row.label}>
            <SettingRow label={row.label} onPress={row.onPress} />
            <Divider />
          </View>
        ))}
      </View>
    </Screen>
  );
}

function SettingRow({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={label}
      style={{ borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0, minHeight: size.tap }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="body" tone={onPress ? 'primary' : 'secondary'}>
          {label}
        </Text>
        <Icon name="chevronRight" size={size.iconSm} color={colors.text.tertiary} />
      </View>
    </Card>
  );
}
