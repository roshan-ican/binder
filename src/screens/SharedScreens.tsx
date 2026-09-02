import { useState } from "react";
import { View } from "react-native";
import {
  ActionRow,
  BackHeader,
  Button,
  Card,
  Chip,
  ConfirmSheet,
  Divider,
  EmptyState,
  Input,
  OfflineBanner,
  Screen,
  ScreenHeading,
  SectionHeader,
  StatusNotice,
  Text,
  ToggleRow,
  TrustBadge,
} from "../components";
import type { UserRole } from "../data/mock";
import { rhythm, spacing } from "../theme";

export function SignInScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: (role: UserRole) => void;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [role, setRole] = useState<UserRole>("business");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <Screen
      density="hero"
      scroll={false}
      footer={
        <Button
          label={sent ? "Enter Binder" : "Send sign-in link"}
          disabled={!valid}
          onPress={() => (sent ? onContinue(role) : setSent(true))}
        />
      }
    >
      <BackHeader onBack={onBack} />
      <View style={{ flex: 1, justifyContent: "center", gap: spacing[8] }}>
        <ScreenHeading
          title={sent ? "Check your email." : "Welcome back."}
          supporting={
            sent
              ? `We sent a secure test link to ${email}.`
              : "Use the email linked to your Binder profile."
          }
        />
        {sent ? (
          <StatusNotice
            title="Test link ready"
            body="This prototype lets you continue immediately; production will verify the link."
          />
        ) : (
          <>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@company.com"
            />
            <View style={{ gap: spacing[2] }}>
              <Text variant="label" tone="secondary">
                Return as
              </Text>
              <View style={{ flexDirection: "row", gap: spacing[2] }}>
                <Chip
                  label="Business"
                  selected={role === "business"}
                  onPress={() => setRole("business")}
                />
                <Chip
                  label="Job seeker"
                  selected={role === "job-seeker"}
                  onPress={() => setRole("job-seeker")}
                />
              </View>
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

export function SettingsHubScreen({
  role,
  onBack,
  onOpen,
}: {
  role: UserRole;
  onBack: () => void;
  onOpen: (
    key:
      | "saved"
      | "documents"
      | "team"
      | "searches"
      | "notifications"
      | "account",
  ) => void;
}) {
  return (
    <Screen>
      <BackHeader title="Manage profile" onBack={onBack} />
      <ScreenHeading
        title="Manage Binder"
        supporting="Profile, saved items, alerts, and privacy in one place."
      />
      <View style={{ marginTop: rhythm.titleToContent }}>
        <ActionRow
          label={role === "business" ? "Saved businesses" : "Saved jobs"}
          detail="Items to revisit"
          onPress={() => onOpen("saved")}
        />
        <Divider />
        <ActionRow
          label={
            role === "business"
              ? "Documents & catalogue"
              : "Resume & experience"
          }
          detail="Files and public evidence"
          onPress={() => onOpen("documents")}
        />
        <Divider />
        {role === "business" ? (
          <>
            <ActionRow
              label="Team members"
              detail="Invitations and access"
              onPress={() => onOpen("team")}
            />
            <Divider />
          </>
        ) : null}
        <ActionRow
          label="Saved searches & alerts"
          detail="Matching criteria and frequency"
          onPress={() => onOpen("searches")}
        />
        <Divider />
        <ActionRow
          label="Notification preferences"
          detail="Push, email, and quiet hours"
          onPress={() => onOpen("notifications")}
        />
        <Divider />
        <ActionRow
          label="Account & privacy"
          detail="Session, visibility, and data controls"
          onPress={() => onOpen("account")}
        />
        <Divider />
      </View>
    </Screen>
  );
}

export function SavedSearchesScreen({
  role,
  onBack,
}: {
  role: UserRole;
  onBack: () => void;
}) {
  const [enabled, setEnabled] = useState(true);
  const [removed, setRemoved] = useState(false);
  return (
    <Screen>
      <BackHeader title="Saved searches" onBack={onBack} />
      <ScreenHeading
        title="Saved searches & alerts"
        supporting="Keep useful searches and decide when Binder should notify you."
      />
      <View style={{ marginTop: rhythm.titleToContent, gap: spacing[3] }}>
        {removed ? (
          <EmptyState
            title="No saved searches."
            body={`Save a ${role === "business" ? "supplier" : "job"} search to receive relevant updates.`}
            actionLabel="Explore matches"
            onAction={onBack}
          />
        ) : (
          <Card>
            <Text variant="heading3">
              {role === "business"
                ? "Packaging suppliers · Kanpur"
                : "Production Supervisor · Kanpur"}
            </Text>
            <Text variant="bodySmall" tone="secondary">
              {role === "business"
                ? "Verified businesses · MOQ under 10,000"
                : "Full-time · ₹35,000+ · Strong matches"}
            </Text>
            <Divider style={{ marginVertical: spacing[3] }} />
            <ToggleRow
              label="New match alert"
              detail="Weekly email and push summary"
              value={enabled}
              onChange={setEnabled}
            />
            <Button
              label="Delete saved search"
              variant="tertiary"
              onPress={() => setRemoved(true)}
            />
          </Card>
        )}
      </View>
    </Screen>
  );
}

export function NotificationPreferencesScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [messages, setMessages] = useState(true),
    [matches, setMatches] = useState(true),
    [updates, setUpdates] = useState(true),
    [email, setEmail] = useState(false);
  return (
    <Screen>
      <BackHeader title="Notifications" onBack={onBack} />
      <ScreenHeading
        title="Notification preferences"
        supporting="Choose useful updates without losing important conversations."
      />
      <View style={{ marginTop: rhythm.titleToContent }}>
        <SectionHeader title="Push notifications" />
        <ToggleRow
          label="Messages"
          detail="New messages and replies"
          value={messages}
          onChange={setMessages}
        />
        <Divider />
        <ToggleRow
          label="New matches"
          detail="Businesses, enquiries, or jobs that fit"
          value={matches}
          onChange={setMatches}
        />
        <Divider />
        <ToggleRow
          label="Status updates"
          detail="Applications, invitations, and enquiry activity"
          value={updates}
          onChange={setUpdates}
        />
        <Divider />
        <View style={{ marginTop: rhythm.sectionToSection }}>
          <SectionHeader title="Email" />
          <ToggleRow
            label="Weekly summary"
            detail="One concise activity digest"
            value={email}
            onChange={setEmail}
          />
        </View>
        <StatusNotice
          title="Preferences saved locally"
          body="These prototype settings stay on this device."
        />
      </View>
    </Screen>
  );
}

export function AccountPrivacyScreen({
  onBack,
  onSignOut,
}: {
  onBack: () => void;
  onSignOut: () => void;
}) {
  const [visible, setVisible] = useState(true),
    [analytics, setAnalytics] = useState(false),
    [signOut, setSignOut] = useState(false),
    [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <Screen>
      <BackHeader title="Account & privacy" onBack={onBack} />
      <ScreenHeading
        title="Account & privacy"
        supporting="Control profile visibility, data use, and this session."
      />
      <View style={{ marginTop: rhythm.titleToContent }}>
        <TrustBadge
          signal="verified"
          detail="candidate@binder.test · signed in"
        />
        <View style={{ marginTop: spacing[5] }}>
          <ToggleRow
            label="Public profile"
            detail="Allow relevant Binder members to discover you"
            value={visible}
            onChange={setVisible}
          />
          <Divider />
          <ToggleRow
            label="Product analytics"
            detail="Share anonymous usage to improve Binder"
            value={analytics}
            onChange={setAnalytics}
          />
          <Divider />
          <ActionRow
            label="Download my data"
            detail="Prepare a portable account archive"
          />
          <Divider />
          <ActionRow label="Sign out" onPress={() => setSignOut(true)} />
          <Divider />
          <ActionRow
            label="Delete account"
            detail="Permanently remove profile and activity"
            danger
            onPress={() => setDeleteOpen(true)}
          />
        </View>
      </View>
      <ConfirmSheet
        visible={signOut}
        title="Sign out of Binder?"
        body="Drafts saved on this device will remain here."
        confirmLabel="Sign out"
        onClose={() => setSignOut(false)}
        onConfirm={onSignOut}
      />
      <ConfirmSheet
        visible={deleteOpen}
        eyebrow="Permanent action"
        title="Delete your account?"
        body="Your profile, applications, enquiries, and saved items will be permanently removed."
        confirmLabel="Delete account"
        destructive
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => setDeleteOpen(false)}
      />
    </Screen>
  );
}

export function StateGalleryScreen({ onBack }: { onBack: () => void }) {
  const [offline, setOffline] = useState(true),
    [error, setError] = useState(true);
  return (
    <View style={{ flex: 1 }}>
      {offline ? <OfflineBanner /> : null}
      <Screen>
        <BackHeader title="Connection states" onBack={onBack} />
        <ScreenHeading
          title="State patterns"
          supporting="Reusable feedback for loading, empty, offline, error, disabled, and success variants."
        />
        <View style={{ marginTop: rhythm.titleToContent, gap: spacing[5] }}>
          {error ? (
            <StatusNotice
              title="Couldn’t refresh matches"
              body="Your saved content is still available. Check your connection and try again."
              tone="danger"
            />
          ) : (
            <StatusNotice
              title="Matches updated"
              body="Three new relevant results are ready."
            />
          )}
          <Button
            label={error ? "Try again" : "Refresh complete"}
            disabled={!error}
            onPress={() => {
              setError(false);
              setOffline(false);
            }}
          />
          <Button label="Publishing…" loading />
          <EmptyState
            title="Nothing here yet."
            body="Adjust the filters or return to Discover for a useful next step."
            actionLabel="Back to Discover"
            onAction={onBack}
          />
        </View>
      </Screen>
    </View>
  );
}

export function ConversationDetailsScreen({
  name,
  onBack,
}: {
  name: string;
  onBack: () => void;
}) {
  const [report, setReport] = useState(false),
    [block, setBlock] = useState(false),
    [blocked, setBlocked] = useState(false);
  return (
    <Screen>
      <BackHeader title="Conversation details" onBack={onBack} />
      <ScreenHeading
        title={name}
        supporting="Conversation actions apply only to this member and thread."
      />
      <View style={{ marginTop: rhythm.titleToContent }}>
        <ActionRow
          label="Shared attachments"
          detail="2 files in this conversation"
        />
        <Divider />
        <ActionRow
          label="Mute conversation"
          detail="Keep messages without notifications"
        />
        <Divider />
        <ActionRow
          label="Report conversation"
          detail="Tell Binder about unsafe or misleading activity"
          onPress={() => setReport(true)}
        />
        <Divider />
        <ActionRow
          label={blocked ? "Member blocked" : "Block member"}
          detail={
            blocked
              ? "They can no longer contact you"
              : "Stops new messages and connection requests"
          }
          danger
          onPress={() => setBlock(true)}
        />
        <Divider />
      </View>
      {blocked ? (
        <View style={{ marginTop: spacing[5] }}>
          <StatusNotice
            title="Member blocked"
            body="You can unblock them from account settings."
            tone="warning"
          />
        </View>
      ) : null}
      <ConfirmSheet
        visible={report}
        title="Report this conversation?"
        body="Binder will review the thread for spam, fraud, harassment, or unsafe activity. The other member is not told who reported it."
        confirmLabel="Submit report"
        onClose={() => setReport(false)}
        onConfirm={() => setReport(false)}
      />
      <ConfirmSheet
        visible={block}
        eyebrow="Safety action"
        title={`Block ${name}?`}
        body="They will no longer be able to message or send connection requests to you."
        confirmLabel="Block member"
        destructive
        onClose={() => setBlock(false)}
        onConfirm={() => {
          setBlock(false);
          setBlocked(true);
        }}
      />
    </Screen>
  );
}
