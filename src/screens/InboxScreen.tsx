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
import { conversations } from '../data/mock';
import { colors, radius, spacing } from '../theme';

export function InboxScreen({ onOpenConversation }: { onOpenConversation: (id: string) => void }) {
  const [tab, setTab] = useState<'messages' | 'requests'>('messages');

  return (
    <Screen>
      <ScreenHeading title="Inbox" />

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
          {conversations.map((conversation, index) => (
            <View key={conversation.id}>
              <Card
                onPress={() => onOpenConversation(conversation.id)}
                accessibilityLabel={`${conversation.business}. ${conversation.unread ? 'Unread. ' : ''}${conversation.preview}`}
                style={{ borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0 }}
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
                  <View style={{ alignItems: 'flex-end', gap: spacing[2] }}>
                    <Text variant="bodySmall" tone="tertiary">
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
              {index < conversations.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          title="No connection requests."
          body="When a business asks to discuss one of your enquiries, it will wait here with the context attached."
        />
      )}
    </Screen>
  );
}
