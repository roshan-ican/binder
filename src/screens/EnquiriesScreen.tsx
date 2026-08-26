import { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  EmptyState,
  Metric,
  MetricRow,
  Screen,
  ScreenHeading,
  Text,
  TopTabs,
} from '../components';
import { myEnquiries } from '../data/mock';
import { rhythm, spacing } from '../theme';

/** Status language is fixed across the product: Draft, Active, Closed, Expired. */
type StatusTab = 'active' | 'draft' | 'closed' | 'expired';

export function EnquiriesScreen({ onOpenEnquiry }: { onOpenEnquiry: (id: string) => void }) {
  const [tab, setTab] = useState<StatusTab>('active');
  const list = myEnquiries.filter((enquiry) => enquiry.status === tab);

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
          />
        ) : null}
      </View>

      <Button label="New enquiry" variant="secondary" style={{ marginTop: rhythm.sectionToSection }} />
    </Screen>
  );
}
