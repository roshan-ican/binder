import { useState } from 'react';
import { View } from 'react-native';
import { BackHeader, Button, Card, Divider, EmptyState, Icon, MatchLabel, OpportunityCard, Screen, Text, TrustBadge } from '../components';
import { jobOpportunities, opportunities, type Enquiry, type JobOpportunity, type UserRole } from '../data/mock';
import { colors, size, spacing } from '../theme';

/**
 * Active demand, one card at a time. Not a dating app: no hearts, no
 * confetti, no red/green. Interest is a quiet confirmation and moves on.
 */
export function OpportunitiesScreen({ role, onBack }: { role: UserRole; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Job-seeker path disabled — Binder is business-only for now.
  // const isJobSeeker = role === 'job-seeker';
  const isJobSeeker = false;

  const list = isJobSeeker ? jobOpportunities : opportunities;
  const item = list[index];
  const advance = () => {
    setSentTo(null);
    setIndex((current) => current + 1);
  };

  if (!item) {
    return (
      <Screen scroll={false}>
        <BackHeader title={isJobSeeker ? 'Jobs' : 'Opportunities'} onBack={onBack} />
        <EmptyState
          title={isJobSeeker ? "That's every job for today." : "That's everything for today."}
          body={
            isJobSeeker
              ? "New roles matching your skills will appear here. We'll notify you when a strong match arrives."
              : "New enquiries matching what you offer will appear here. We'll notify you when a strong match arrives."
          }
          actionLabel="Back to Discover"
          onAction={onBack}
        />
      </Screen>
    );
  }

  if (sentTo) {
    return (
      <Screen scroll={false}>
        <BackHeader title={isJobSeeker ? 'Jobs' : 'Opportunities'} onBack={onBack} />
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing[3] }}>
          <Text variant="heading2">{isJobSeeker ? 'Application sent.' : 'Interest sent.'}</Text>
          <Text variant="body" tone="secondary">
            {isJobSeeker ? `${sentTo} can now review your candidate profile.` : `${sentTo} can now review your business profile.`}
          </Text>
          <Button label={isJobSeeker ? 'Next job' : 'Next opportunity'} onPress={advance} style={{ marginTop: spacing[4] }} />
        </View>
      </Screen>
    );
  }

  // Job-seeker path disabled — Binder is business-only for now.
  // if (isJobSeeker) {
  //   const job = item as JobOpportunity;
  //
  //   return (
  //     <Screen scroll={false}>
  //       <BackHeader title={`Job ${index + 1} of ${list.length}`} onBack={onBack} />
  //       <View style={{ flex: 1, paddingBottom: spacing[6], paddingTop: spacing[2] }}>
  //         <JobOpportunityCard job={job} onPass={advance} onApply={() => setSentTo(job.company)} />
  //       </View>
  //     </Screen>
  //   );
  // }

  const enquiry = item as Enquiry;

  return (
    <Screen scroll={false}>
      <BackHeader title={`Opportunity ${index + 1} of ${list.length}`} onBack={onBack} />
      <View style={{ flex: 1, paddingBottom: spacing[6], paddingTop: spacing[2] }}>
        <OpportunityCard enquiry={enquiry} onPass={advance} onInterested={() => setSentTo(enquiry.buyer)} />
      </View>
    </Screen>
  );
}

function JobOpportunityCard({
  job,
  onPass,
  onApply,
}: {
  job: JobOpportunity;
  onPass: () => void;
  onApply: () => void;
}) {
  return (
    <View style={{ flex: 1, gap: spacing[4] }}>
      <Card style={{ flex: 1, padding: spacing[6] }}>
        {job.match ? <MatchLabel quality={job.match} /> : null}

        <View style={{ marginTop: spacing[6] }}>
          <Text variant="heading2">{job.title}</Text>
          <Text variant="body" tone="secondary" style={{ marginTop: spacing[2] }}>
            {job.company}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[5] }}>
          <Icon name="mapPin" size={size.iconSm} color={colors.text.tertiary} />
          <Text variant="body" tone="secondary">
            {job.city}, {job.region}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing[8], marginTop: spacing[5] }}>
          <View style={{ gap: spacing[1] }}>
            <Text variant="micro" tone="tertiary">
              Work type
            </Text>
            <Text variant="labelLarge">{job.workType}</Text>
          </View>
          <View style={{ gap: spacing[1] }}>
            <Text variant="micro" tone="tertiary">
              Salary
            </Text>
            <Text variant="labelLarge">{job.salary}</Text>
          </View>
        </View>

        <Divider style={{ marginVertical: spacing[5] }} />

        <Text variant="micro" tone="tertiary">
          Why this fits
        </Text>
        <View style={{ gap: spacing[2], marginTop: spacing[3] }}>
          {job.whyItFits.map((reason) => (
            <View key={reason} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
              <Icon name="check" size={size.iconSm} color={colors.chrome[300]} />
              <Text variant="bodySmall" tone="secondary">
                {reason}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 'auto', gap: spacing[2] }}>
          <Text variant="label" tone="secondary">
            {job.company.toUpperCase()}
          </Text>
          <TrustBadge signal={job.trust} detail="employer" />
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing[3] }}>
        <Button label="Pass" variant="secondary" onPress={onPass} fullWidth={false} style={{ flex: 1 }} />
        <Button label="Apply" onPress={onApply} fullWidth={false} style={{ flex: 2 }} />
      </View>
    </View>
  );
}
