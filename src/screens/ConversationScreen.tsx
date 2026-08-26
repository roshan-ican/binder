import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { BackHeader, Divider, Icon, IconButton, Screen, Text, TrustBadge } from '../components';
import { conversations } from '../data/mock';
import { colors, radius, size, spacing, typography } from '../theme';

/**
 * Simple charcoal bubbles, no gradients. The context strip keeps the deal in
 * view so neither side has to ask "which enquiry is this?".
 */
export function ConversationScreen({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const conversation = conversations.find((item) => item.id === conversationId) ?? conversations[0];
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(conversation.messages);

  const send = () => {
    if (!draft.trim()) return;
    setMessages((current) => [
      ...current,
      { id: String(current.length + 1), from: 'me', body: draft.trim(), time: 'Now' },
    ]);
    setDraft('');
  };

  return (
    <Screen scroll={false} density="dense">
      <BackHeader
        title={conversation.business}
        onBack={onBack}
        action={<IconButton label="More options" icon={<Icon name="more" />} />}
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

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingVertical: spacing[3] }}>
          <IconButton label="Add attachment" icon={<Icon name="plus" />} />
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
    </Screen>
  );
}
