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
import { candidate, me, type UserRole } from '../data/mock';
import { colors, rhythm, size, spacing } from '../theme';

export function ProfileScreen({ role }: { role: UserRole }) {
  const isJobSeeker = role === 'job-seeker';
  const profileName = isJobSeeker ? candidate.person : me.business;
  const profileMeta = isJobSeeker ? `${candidate.headline} · ${candidate.city}` : `${me.industry} · ${me.city}`;
  const completeness = isJobSeeker ? candidate.completeness : me.completeness;
  const offerTitle = isJobSeeker ? 'Your skills' : 'What you offer';
  const needTitle = isJobSeeker ? 'Roles you want' : 'What you need';
  const offers = isJobSeeker ? candidate.skills : me.offers;
  const needs = isJobSeeker ? candidate.seeking : me.needs;

  return (
    <Screen>
      <ScreenHeading title="Profile" />

      <View style={{ flexDirection: 'row', gap: spacing[4], alignItems: 'center', marginTop: rhythm.titleToContent }}>
        <Logo name={profileName} size="lg" />
        <View style={{ flex: 1, gap: spacing[1] }}>
          <Text variant="heading3">{profileName}</Text>
          <Text variant="bodySmall" tone="secondary">
            {profileMeta}
          </Text>
          <TextButton label={isJobSeeker ? 'View candidate profile' : 'View public profile'} />
        </View>
      </View>

      {/* Completeness is stated plainly. No progress arcade. */}
      <Card style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <Text variant="body">Your profile is {completeness}% complete.</Text>
        <Text variant="bodySmall" tone="secondary">
          {isJobSeeker ? 'Add two details to improve job matching.' : 'Add two details to improve matching.'}
        </Text>
        <View style={{ gap: spacing[2], marginTop: spacing[1] }}>
          <Text variant="bodySmall" tone="tertiary">
            {isJobSeeker ? '+ Resume or work history' : '+ Monthly capacity'}
          </Text>
          <Text variant="bodySmall" tone="tertiary">
            {isJobSeeker ? '+ Expected salary' : '+ Registration document'}
          </Text>
        </View>
      </Card>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title={offerTitle} action="Edit" />
        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          {offers.map((offer) => (
            <Chip key={offer} label={offer} />
          ))}
        </View>
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title={needTitle} action="Edit" />
        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          {needs.map((need) => (
            <Chip key={need} label={need} />
          ))}
        </View>
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title={isJobSeeker ? 'Resume & verification' : 'Documents & verification'} />
        <TrustBadge signal="verified" detail={isJobSeeker ? 'Phone · verified 12 Aug 2026' : 'GST · verified 12 Aug 2026'} />
        <TrustBadge signal="pending" detail={isJobSeeker ? 'Work history' : 'Company registration'} />
        <TrustBadge signal="documents" detail={isJobSeeker ? 'Resume · not verified' : 'Catalogue · not verified'} />
      </View>

      <Divider style={{ marginTop: rhythm.sectionToSection }} />

      <View style={{ marginTop: spacing[4] }}>
        {[
          { label: 'Saved searches', onPress: undefined },
          { label: 'Team', onPress: undefined },
          { label: 'Notification preferences', onPress: undefined },
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
