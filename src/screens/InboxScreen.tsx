import { useState } from 'react';
import { View } from 'react-native';
import {
  Card,
  Divider,
  EmptyState,
  Logo,
  Screen,
  ScreenHeading,
  Text,
  TopTabs,
} from '../components';
import { conversations, jobSeekerConversations, type UserRole } from '../data/mock';
import { colors, radius, spacing } from '../theme';

export function InboxScreen({
  role,
  onOpenConversation,
}: {
  role: UserRole;
  onOpenConversation: (id: string) => void;
}) {
  const [tab, setTab] = useState<'messages' | 'requests'>('messages');
  const isJobSeeker = role === 'job-seeker';
  const inbox = isJobSeeker ? jobSeekerConversations : conversations;

  return (
    <Screen>
      <ScreenHeading
        title="Inbox"
        supporting={isJobSeeker ? 'Messages from hiring teams and application updates.' : undefined}
      />

      <View style={{ marginTop: spacing[4] }}>
        <TopTabs
          items={[
            { key: 'messages', label: 'Messages' },
            { key: 'requests', label: 'Requests' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </View>

      {tab === 'messages' ? (
        <View style={{ marginTop: spacing[3] }}>
          {inbox.map((conversation, index) => (
            <View key={conversation.id}>
              <Card
                onPress={() => onOpenConversation(conversation.id)}
                accessibilityLabel={`${conversation.business}. ${conversation.unread ? 'Unread. ' : ''}${conversation.preview}`}
                style={{
                  borderWidth: 0,
                  backgroundColor: 'transparent',
                  paddingHorizontal: spacing[2],
                }}
              >
                <View style={{ flexDirection: 'row', gap: spacing[3], alignItems: 'center' }}>
                  <Logo name={conversation.business} size="sm" />
                  <View style={{ flex: 1, gap: spacing[1] }}>
                    <Text variant="labelLarge" tone={conversation.unread ? 'primary' : 'secondary'} numberOfLines={1}>
                      {conversation.business}
                    </Text>
                    <Text variant="bodySmall" tone={conversation.unread ? 'secondary' : 'tertiary'} numberOfLines={1}>
                      {conversation.preview}
                    </Text>
                  </View>
                  <View style={{ minWidth: spacing[8], alignItems: 'flex-end', gap: spacing[2] }}>
                    <Text variant="bodySmall" tone="tertiary" style={{ textAlign: 'right' }}>
                      {conversation.time}
                    </Text>
                    {/* A small chrome indicator, never a bright blue dot. */}
                    {conversation.unread ? (
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: radius.full,
                          backgroundColor: colors.chrome[200],
                        }}
                      />
                    ) : null}
                  </View>
                </View>
              </Card>
              {index < inbox.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          title={isJobSeeker ? 'No interview requests.' : 'No connection requests.'}
          body={
            isJobSeeker
              ? 'When an employer invites you to interview, it will wait here with the role attached.'
              : 'When a business asks to discuss one of your enquiries, it will wait here with the context attached.'
          }
        />
      )}
    </Screen>
  );
}
