import { useState } from 'react';
import { View } from 'react-native';
import type { PublicBusinessEnquiry } from '../data/businessActivity';
import { spacing } from '../theme';
import { Button, TextButton } from './Button';
import { Card } from './Card';
import { Chip } from './Chip';
import { Text } from './Text';

/** Public activity has no private quotes, contact details, or completion claims. */
export function BusinessEnquiryActivity({ enquiry, onRespond }: {
  enquiry: PublicBusinessEnquiry;
  onRespond: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const active = enquiry.status === 'active';
  return (
    <Card>
      <View style={{ gap: spacing[3] }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing[2] }}>
          <Chip label={active ? 'Open' : enquiry.status === 'closed' ? 'Closed' : 'Expired'} />
          <Text variant="bodySmall" tone="tertiary">{enquiry.dateLabel}</Text>
        </View>
        <Text variant="heading3">{enquiry.title}</Text>
        <Text variant="bodySmall" tone="secondary">{enquiry.quantity} · {enquiry.location}</Text>
        <View style={{ alignItems: 'flex-start' }}>
          <TextButton label={expanded ? 'Hide details' : 'View details'} onPress={() => setExpanded(!expanded)} />
        </View>
        {expanded ? (
          <View style={{ gap: spacing[3] }}>
            <Text variant="body" tone="secondary">{enquiry.description}</Text>
            {active ? <Button label="Respond to enquiry" variant="secondary" onPress={onRespond} /> : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
}
