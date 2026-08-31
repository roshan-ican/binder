import { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  EmptyState,
  Icon,
  Metric,
  MetricRow,
  Screen,
  ScreenHeading,
  Text,
  TopTabs,
  TrustBadge,
} from '../components';
import { jobOpportunities, myEnquiries, type UserRole } from '../data/mock';
import { colors, rhythm, size, spacing } from '../theme';

/** Status language is fixed across the product: Draft, Active, Closed, Expired. */
type StatusTab = 'active' | 'draft' | 'closed' | 'expired';

export function EnquiriesScreen({
  role,
  onOpenEnquiry,
  onCreateEnquiry,
}: {
  role: UserRole;
  onOpenEnquiry: (id: string) => void;
  onCreateEnquiry?: () => void;
}) {
  const [tab, setTab] = useState<StatusTab>('active');
  const list = myEnquiries.filter((enquiry) => enquiry.status === tab);
  const isJobSeeker = role === 'job-seeker';

  if (isJobSeeker) {
    return (
      <Screen>
        <ScreenHeading title="Applications" supporting="Track roles you applied to and jobs worth saving." />

        <View style={{ marginTop: spacing[4] }}>
          <TopTabs
            items={[
              { key: 'active', label: 'Active' },
              { key: 'draft', label: 'Saved' },
              { key: 'closed', label: 'Closed' },
              { key: 'expired', label: 'Expired' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </View>

        <View style={{ marginTop: rhythm.cardToCard, gap: spacing[3] }}>
          {(tab === 'active' ? jobOpportunities.slice(0, 1) : tab === 'draft' ? jobOpportunities.slice(1, 2) : []).map(
            (job) => (
              <Card key={job.id} accessibilityLabel={`${job.title} at ${job.company}`}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing[3] }}>
                  <View style={{ flex: 1, gap: spacing[1] }}>
                    <Text variant="heading3">{job.title}</Text>
                    <Text variant="bodySmall" tone="secondary">
                      {job.company} · {job.city}
                    </Text>
                    <TrustBadge signal={job.trust} />
                  </View>
                  <Icon name="chevronRight" size={size.icon} color={colors.text.tertiary} />
                </View>

                <Divider style={{ marginVertical: spacing[4] }} />

                <MetricRow>
                  <Metric value={job.match === 'strong' ? 'Strong' : 'Good'} label="Match" />
                  <Metric value={job.workType} label="Type" />
                  <Metric value={job.activity} label="Status" />
                </MetricRow>
              </Card>
            ),
          )}

          {(tab === 'closed' || tab === 'expired') ? (
            <EmptyState
              title="No roles here yet."
              body="Closed and expired applications will move here when hiring teams update them."
            />
          ) : null}
        </View>

        <Button label="Find jobs" style={{ marginTop: rhythm.sectionToSection }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeading title="Your enquiries" />

      <View style={{ marginTop: spacing[4] }}>
        <TopTabs
          items={[
            { key: 'active', label: 'Active' },
            { key: 'draft', label: 'Drafts' },
            { key: 'closed', label: 'Closed' },
            { key: 'expired', label: 'Expired' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </View>

      <View style={{ marginTop: rhythm.cardToCard, gap: spacing[3] }}>
        {list.map((enquiry) => (
          <Card key={enquiry.id} onPress={() => onOpenEnquiry(enquiry.id)} accessibilityLabel={enquiry.title}>
            <Text variant="heading3">{enquiry.title}</Text>
            <Divider style={{ marginVertical: spacing[4] }} />
            <MetricRow>
              <Metric value={enquiry.relevant} label="Relevant" />
              <Metric value={enquiry.interested} label="Interested" />
              <Metric value={enquiry.connected} label="Connected" />
            </MetricRow>
            <Text variant="bodySmall" tone="tertiary" style={{ marginTop: spacing[4] }}>
              {enquiry.status === 'draft' ? 'Draft — not published' : `Expires in ${enquiry.expiresIn}`}
            </Text>
          </Card>
        ))}

        {list.length === 0 ? (
          <EmptyState
            title="No enquiries yet."
            body="Publish what your business needs and Binder will find relevant suppliers."
            actionLabel="Create enquiry"
            onAction={onCreateEnquiry}
          />
        ) : null}
      </View>

      <Button label="New enquiry" onPress={onCreateEnquiry} style={{ marginTop: rhythm.sectionToSection }} />
    </Screen>
  );
}
