import { View } from 'react-native';
import {
  Card,
  Button,
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
import { candidate, me, type BusinessProfileData, type JobSeekerProfileData, type UserRole } from '../data/mock';
import { professions, roles, skills, taxonomyLabel } from '../data/jobTaxonomy';
import { colors, rhythm, size, spacing } from '../theme';

export function ProfileScreen({
  role,
  businessProfile,
  jobSeekerProfile,
  onVerifyBusiness,
}: {
  role: UserRole;
  businessProfile?: BusinessProfileData | null;
  jobSeekerProfile?: JobSeekerProfileData | null;
  onVerifyBusiness?: () => void;
}) {
  const isJobSeeker = role === 'job-seeker';
  const profileName = isJobSeeker ? (jobSeekerProfile?.fullName ?? candidate.person) : (businessProfile?.businessName ?? me.business);
  const profileMeta = isJobSeeker
    ? `${jobSeekerProfile?.headline ?? candidate.headline} · ${jobSeekerProfile?.city ?? candidate.city}`
    : `${businessProfile?.industry ?? me.industry} · ${businessProfile?.city ?? me.city}`;
  const completeness = isJobSeeker ? (jobSeekerProfile ? 100 : candidate.completeness) : (businessProfile ? 100 : me.completeness);
  const offerTitle = isJobSeeker ? 'Your skills' : 'What you offer';
  const needTitle = isJobSeeker ? 'Roles you want' : 'What you need';
  const offers = isJobSeeker
    ? (jobSeekerProfile?.skillIds.map((id) => taxonomyLabel(id, skills)) ?? candidate.skills)
    : (businessProfile?.offers ?? me.offers);
  const needs = isJobSeeker
    ? (jobSeekerProfile?.desiredRoleIds.map((id) => taxonomyLabel(id, roles)) ?? candidate.seeking)
    : (businessProfile?.needs ?? me.needs);

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
          {!isJobSeeker && businessProfile ? (
            <Text variant="bodySmall" tone="tertiary">Managed by {businessProfile.contactName}</Text>
          ) : null}
          <TextButton label={isJobSeeker ? 'View candidate profile' : 'View public profile'} />
        </View>
      </View>

      {/* Completeness is stated plainly. No progress arcade. */}
      <Card style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <Text variant="body">Your profile is {completeness}% complete.</Text>
        {completeness < 100 ? <Text variant="bodySmall" tone="secondary">
          {isJobSeeker ? 'Add two details to improve job matching.' : 'Add two details to improve matching.'}
        </Text> : isJobSeeker ? <TrustBadge signal="verified" detail="Candidate profile complete" /> : <TrustBadge signal={businessProfile?.verificationStatus === 'verified' ? 'verified' : 'pending'} detail={businessProfile?.verificationStatus === 'verified' ? 'GST verified' : 'Unverified business'} />}
        {completeness < 100 ? <View style={{ gap: spacing[2], marginTop: spacing[1] }}>
          <Text variant="bodySmall" tone="tertiary">
            {isJobSeeker ? '+ Resume or work history' : '+ Monthly capacity'}
          </Text>
          <Text variant="bodySmall" tone="tertiary">
            {isJobSeeker ? '+ Expected salary' : '+ Registration document'}
          </Text>
        </View> : null}
      </Card>

      {isJobSeeker && jobSeekerProfile ? (
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
          <SectionHeader title="Primary profession" />
          <Chip label={taxonomyLabel(jobSeekerProfile.professionId, professions)} />
        </View>
      ) : null}

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
        <TrustBadge signal={isJobSeeker || businessProfile?.verificationStatus === 'verified' ? 'verified' : 'pending'} detail={isJobSeeker ? (jobSeekerProfile ? `${jobSeekerProfile.email} · email verified` : 'Phone · verified 12 Aug 2026') : businessProfile?.verificationStatus === 'verified' ? `GSTIN ${businessProfile.gstin}` : 'Unverified business · GST can be added later'} />
        {!isJobSeeker && businessProfile?.verificationStatus !== 'verified' ? <Button label="Verify your business" variant="secondary" onPress={onVerifyBusiness} /> : null}
        {isJobSeeker || !businessProfile ? (
          <TrustBadge signal="pending" detail={isJobSeeker ? 'Work history' : 'Company registration'} />
        ) : null}
        {isJobSeeker || !businessProfile ? (
          <TrustBadge signal="documents" detail={isJobSeeker ? 'Resume · not verified' : 'Catalogue · not verified'} />
        ) : null}
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
