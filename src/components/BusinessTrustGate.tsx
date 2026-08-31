import { Modal, View } from 'react-native';
import { Button } from './Button';
import { Card } from './Card';
import { Text } from './Text';
import { TrustBadge } from './TrustBadge';
import { colors, spacing } from '../theme';

export function BusinessTrustGate({ visible, onVerify, onClose }: { visible: boolean; onVerify: () => void; onClose: () => void }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View accessibilityViewIsModal style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.78)', padding: spacing[4] }}>
        <Card style={{ gap: spacing[4] }}>
          <TrustBadge signal="pending" detail="GST verification required" />
          <View style={{ gap: spacing[2] }}><Text variant="heading2">Verify before you continue</Text><Text variant="body" tone="secondary">Browsing is always available. Verify once with GST to connect, message, reply, or publish an enquiry.</Text></View>
          <Button label="Verify with GST" onPress={onVerify} />
          <Button label="Not now" variant="tertiary" onPress={onClose} />
        </Card>
      </View>
    </Modal>
  );
}
