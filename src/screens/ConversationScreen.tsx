import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, View } from 'react-native';
import { ActionRow, BackHeader, Button, Divider, Icon, IconButton, Screen, Text, TrustBadge } from '../components';
import { conversations, jobSeekerConversations, swapConversationFor, type UserRole } from '../data/mock';
import { colors, radius, size, spacing, typography } from '../theme';

/**
 * Simple charcoal bubbles, no gradients. The context strip keeps the deal in
 * view so neither side has to ask "which enquiry is this?".
 */
export function ConversationScreen({
  role,
  conversationId,
  onBack,
  onTrustAction,
  onDetails,
}: {
  role: UserRole;
  conversationId: string;
  onBack: () => void;
  onTrustAction?: (action: () => void) => void;
  onDetails?: (name: string) => void;
}) {
  const inbox = role === 'job-seeker' ? jobSeekerConversations : conversations;
  const conversation =
    inbox.find((item) => item.id === conversationId) ?? swapConversationFor(conversationId) ?? inbox[0];
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(conversation.messages);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [attachment, setAttachment] = useState('');

  const commitSend = () => {
    if (!draft.trim() && !attachment) return;
    setMessages((current) => [
      ...current,
      { id: String(current.length + 1), from: 'me', body: attachment ? `Attachment: ${attachment}${draft.trim() ? `\n${draft.trim()}` : ''}` : draft.trim(), time: 'Now' },
    ]);
    setDraft('');
    setAttachment('');
  };
  const send = () => onTrustAction ? onTrustAction(commitSend) : commitSend();

  return (
    <Screen scroll={false} density="dense">
      <BackHeader
        title={conversation.business}
        onBack={onBack}
        action={<IconButton label="More options" onPress={() => onDetails?.(conversation.business)} icon={<Icon name="more" />} />}
      />
      <View style={{ paddingBottom: spacing[3] }}>
        <TrustBadge signal="verified" detail="Active now" />
      </View>

      <View
        style={{
          backgroundColor: colors.surface.soft,
          borderRadius: radius.sm,
          padding: spacing[3],
          gap: spacing[1],
        }}
      >
        <Text variant="micro" tone="tertiary">
          Discussing
        </Text>
        <Text variant="label">{conversation.context}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={spacing[16]}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: spacing[4], gap: spacing[3] }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => {
            const mine = message.from === 'me';
            return (
              <View
                key={message.id}
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  backgroundColor: mine ? colors.surface.selected : colors.bg.raised,
                  borderWidth: size.hairline,
                  borderColor: colors.border.subtle,
                  borderRadius: radius.md,
                  paddingHorizontal: spacing[4],
                  paddingVertical: spacing[3],
                  gap: spacing[1],
                }}
              >
                <Text variant="body" tone={mine ? 'primary' : 'secondary'}>
                  {message.body}
                </Text>
                <Text variant="bodySmall" tone="tertiary">
                  {message.time}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <Divider />

        {attachment ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingTop: spacing[2] }}><Icon name="document" size={size.iconSm}/><Text variant="bodySmall" style={{ flex: 1 }}>{attachment} · Ready to send</Text><Button label="Remove" variant="tertiary" fullWidth={false} onPress={() => setAttachment('')} /></View> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingVertical: spacing[3] }}>
          <IconButton label="Add attachment" onPress={() => setAttachmentOpen(true)} icon={<Icon name="plus" />} />
          <TextInput
            accessibilityLabel="Message"
            value={draft}
            onChangeText={setDraft}
            placeholder="Message..."
            placeholderTextColor={colors.text.tertiary}
            onSubmitEditing={send}
            style={[
              typography.body,
              {
                flex: 1,
                color: colors.text.primary,
                backgroundColor: colors.surface.field,
                borderWidth: size.hairline,
                borderColor: colors.border.field,
                borderRadius: radius.input,
                paddingHorizontal: spacing[4],
                height: size.controlSm,
              },
            ]}
          />
          <IconButton
            label="Send message"
            onPress={send}
            icon={<Icon name="arrowRight" color={colors.chrome[200]} />}
          />
        </View>
      </KeyboardAvoidingView>
      <Modal transparent visible={attachmentOpen} animationType="slide" onRequestClose={() => setAttachmentOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.72)' }}>
          <View style={{ backgroundColor: colors.bg.raised, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: spacing[6], paddingBottom: spacing[8] }}>
            <Text variant="heading2">Add an attachment</Text>
            <Text variant="body" tone="secondary" style={{ marginTop: spacing[2], marginBottom: spacing[4] }}>Choose a useful file to support this conversation.</Text>
            <ActionRow label="Choose a document" detail="PDF or spreadsheet · up to 10 MB" icon="document" onPress={() => { setAttachment('rate-card.pdf'); setAttachmentOpen(false); }} />
            <Divider />
            <ActionRow label="Choose a photo" detail="JPG or PNG · up to 10 MB" icon="camera" onPress={() => { setAttachment('sample-finish.jpg'); setAttachmentOpen(false); }} />
            <Button label="Cancel" variant="tertiary" onPress={() => setAttachmentOpen(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
