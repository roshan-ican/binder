import { useState } from "react";
import { View } from "react-native";
import {
  ActionRow,
  BackHeader,
  BusinessIndustryPicker,
  Button,
  Chip,
  ConfirmSheet,
  Divider,
  EmptyState,
  Icon,
  Input,
  Logo,
  ProfileCard,
  Screen,
  ScreenHeading,
  SectionHeader,
  StatusNotice,
  Text,
  TextButton,
  TrustBadge,
} from "../components";
import { businesses, me, type BusinessProfileData, type BuyerAudience } from "../data/mock";
import { colors, rhythm, size, spacing } from "../theme";

export function SavedBusinessesScreen({
  onBack,
  onOpenBusiness,
}: {
  onBack: () => void;
  onOpenBusiness: (id: string) => void;
}) {
  const [saved, setSaved] = useState(businesses.slice(0, 3));
  return (
    <Screen>
      <BackHeader title="Saved businesses" onBack={onBack} />
      <ScreenHeading
        title="Saved businessesr"
        supporting="Suppliers and partners you want to revisit."
      />
      <View style={{ marginTop: rhythm.titleToContent, gap: spacing[3] }}>
        {saved.map((business) => (
          <View key={business.id} style={{ gap: spacing[2] }}>
            <ProfileCard
              business={business}
              onPress={() => onOpenBusiness(business.id)}
            />
            <TextButton
              label="Remove from saved"
              tone="danger"
              onPress={() =>
                setSaved((current) =>
                  current.filter((item) => item.id !== business.id),
                )
              }
            />
          </View>
        ))}
        {saved.length === 0 ? (
          <EmptyState
            title="No saved businesses."
            body="Save suppliers from Discover to compare them here."
            actionLabel="Browse businesses"
            onAction={onBack}
          />
        ) : null}
      </View>
    </Screen>
  );
}

export function BusinessProfileEditorScreen({
  profile,
  previewOnly = false,
  onBack,
  onPreview,
  onSave,
}: {
  profile?: BusinessProfileData | null;
  previewOnly?: boolean;
  onBack: () => void;
  onPreview?: () => void;
  onSave?: (profile: BusinessProfileData) => void;
}) {
  const [name, setName] = useState(profile?.businessName ?? me.business);
  const [contact, setContact] = useState(profile?.contactName ?? me.person);
  const [industries, setIndustries] = useState(
    profile?.industries ?? [profile?.industry ?? me.industry],
  );
  const [city, setCity] = useState(profile?.city ?? me.city);
  const [acceptsOrdersFrom, setAcceptsOrdersFrom] = useState<BuyerAudience>(
    profile?.acceptsOrdersFrom ?? me.acceptsOrdersFrom,
  );
  const [about, setAbout] = useState(
    "Apparel production partner for growing Indian labels, with in-house sampling and quality control.",
  );
  if (previewOnly)
    return (
      <Screen>
        <BackHeader title="Public profile preview" onBack={onBack} />
        <View style={{ gap: spacing[4], paddingTop: spacing[6] }}>
          <Logo name={name} size="xl" />
          <Text variant="heading1">{name}</Text>
          <Text variant="body" tone="secondary">
            {industries.join(", ")} · {city}
          </Text>
          <TrustBadge
            signal={
              profile?.verificationStatus === "verified"
                ? "verified"
                : "pending"
            }
            detail={
              profile?.verificationStatus === "verified"
                ? "GST verified"
                : "Verification pending"
            }
          />
        </View>
        <Divider tone="chrome" style={{ marginTop: rhythm.sectionToSection }} />
        <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
          <SectionHeader title="About" />
          <Text variant="body" tone="secondary">
            {about}
          </Text>
        </View>
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
          <SectionHeader title="Offers" />
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}
          >
            {(profile?.offers ?? me.offers).map((offer) => (
              <Chip key={offer} label={offer} />
            ))}
          </View>
        </View>
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[2] }}>
          <SectionHeader title="Who can order" />
          <Text variant="body" tone="secondary">
            {acceptsOrdersFrom === "businesses-only" ? "Business buyers only" : "Businesses and individual buyers"}
          </Text>
        </View>
        <StatusNotice
          title="Preview mode"
          body="This is how other businesses see your profile."
          tone="warning"
        />
      </Screen>
    );
  const save = () =>
    onSave?.({
      businessName: name,
      contactName: contact,
      industry: industries[0],
      industries,
      city,
      offers: profile?.offers ?? me.offers,
      needs: profile?.needs ?? me.needs,
      acceptsOrdersFrom,
      verificationStatus: profile?.verificationStatus ?? "unverified",
      gstin: profile?.gstin,
    });
  return (
    <Screen footer={<Button label="Save profile" onPress={save} />}>
      <BackHeader
        title="Edit business profile"
        onBack={onBack}
        action={<TextButton label="Preview" onPress={onPreview} />}
      />
      <ScreenHeading
        title="Business profile"
        supporting="Keep the public information buyers use to judge fit up to date."
      />
      <View style={{ gap: spacing[5], marginTop: spacing[8] }}>
        <Input label="Business name" value={name} onChangeText={setName} />
        <Input label="Managed by" value={contact} onChangeText={setContact} />
        <BusinessIndustryPicker selected={industries} onChange={setIndustries} />
        <View style={{ gap: spacing[2] }}>
          <Text variant="label" tone="secondary">Who can order from you?</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}>
            <Chip label="Businesses only" selected={acceptsOrdersFrom === "businesses-only"} onPress={() => setAcceptsOrdersFrom("businesses-only")} />
            <Chip label="Businesses & individuals" selected={acceptsOrdersFrom === "businesses-and-individuals"} onPress={() => setAcceptsOrdersFrom("businesses-and-individuals")} />
          </View>
          <Text variant="bodySmall" tone="tertiary">Business accounts do not need GST to join. Individual orders are your choice.</Text>
        </View>
        <Input label="City" value={city} onChangeText={setCity} />
        <Input label="About" value={about} onChangeText={setAbout} multiline />
        <View style={{ gap: spacing[3] }}>
          <SectionHeader title="Capabilities" />
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}
          >
            {(profile?.offers ?? me.offers).map((offer) => (
              <Chip key={offer} label={offer} selected />
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

export function BusinessDocumentsScreen({ onBack }: { onBack: () => void }) {
  const [catalogues, setCatalogues] = useState(["Winter 2026 catalogue.pdf"]);
  return (
    <Screen>
      <BackHeader title="Documents & catalogue" onBack={onBack} />
      <ScreenHeading
        title="Documents & catalogue"
        supporting="Keep buyer-facing files current. Documents are never presented as verified unless Binder checks them."
      />
      <View style={{ marginTop: rhythm.titleToContent, gap: spacing[3] }}>
        <SectionHeader title="Verification documents" />
        <DocumentRow
          name="GST registration.pdf"
          detail="Verified 12 Aug 2026"
          status="verified"
        />
        <DocumentRow
          name="Company registration.pdf"
          detail="Review pending"
          status="pending"
        />
      </View>
      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="Catalogues" />
        {catalogues.map((name) => (
          <DocumentRow
            key={name}
            name={name}
            detail="Public · 2.4 MB"
            onRemove={() => setCatalogues([])}
          />
        ))}
        {catalogues.length === 0 ? (
          <EmptyState
            title="No catalogue uploaded."
            body="Add a concise catalogue so buyers can assess your range."
          />
        ) : null}
        <Button
          label="Upload catalogue"
          variant="secondary"
          icon={<Icon name="upload" />}
          onPress={() => setCatalogues(["Winter 2026 catalogue.pdf"])}
        />
      </View>
    </Screen>
  );
}

function DocumentRow({
  name,
  detail,
  status,
  onRemove,
}: {
  name: string;
  detail: string;
  status?: "verified" | "pending";
  onRemove?: () => void;
}) {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[3],
          paddingVertical: spacing[3],
        }}
      >
        <Icon
          name="document"
          color={
            status === "verified"
              ? colors.semantic.success
              : colors.text.secondary
          }
        />
        <View style={{ flex: 1, gap: spacing[1] }}>
          <Text variant="body">{name}</Text>
          <Text variant="bodySmall" tone="tertiary">
            {detail}
          </Text>
        </View>
        {onRemove ? (
          <TextButton label="Remove" tone="danger" onPress={onRemove} />
        ) : status ? (
          <TrustBadge signal={status} />
        ) : null}
      </View>
      <Divider />
    </View>
  );
}

export function TeamScreen({ onBack }: { onBack: () => void }) {
  const [invite, setInvite] = useState("");
  const [sent, setSent] = useState(false);
  const [remove, setRemove] = useState(false);
  return (
    <Screen>
      <BackHeader title="Team" onBack={onBack} />
      <ScreenHeading
        title="Team members"
        supporting="Invite people who help manage enquiries and conversations."
      />
      {sent ? (
        <View style={{ marginTop: spacing[5] }}>
          <StatusNotice
            title="Invitation sent"
            body={`We sent an invitation to ${invite}.`}
          />
        </View>
      ) : null}
      <View style={{ marginTop: rhythm.titleToContent, gap: spacing[2] }}>
        <SectionHeader title="2 members" />
        <Member name="Roshan Sahani" role="Owner · Full access" />
        <Member
          name="Priya Mehta"
          role="Member · Enquiries and inbox"
          onRemove={() => setRemove(true)}
        />
      </View>
      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[4] }}>
        <SectionHeader title="Invite a member" />
        <Input
          label="Work email"
          value={invite}
          onChangeText={setInvite}
          keyboardType="email-address"
          placeholder="name@company.com"
        />
        <Button
          label="Send invitation"
          disabled={!invite.includes("@")}
          onPress={() => setSent(true)}
        />
      </View>
      <ConfirmSheet
        visible={remove}
        title="Remove Priya from the team?"
        body="She will lose access to this business profile and its conversations."
        confirmLabel="Remove member"
        destructive
        onClose={() => setRemove(false)}
        onConfirm={() => setRemove(false)}
      />
    </Screen>
  );
}
function Member({
  name,
  role,
  onRemove,
}: {
  name: string;
  role: string;
  onRemove?: () => void;
}) {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[3],
          paddingVertical: spacing[3],
        }}
      >
        <Logo name={name} size="sm" />
        <View style={{ flex: 1 }}>
          <Text variant="body">{name}</Text>
          <Text variant="bodySmall" tone="tertiary">
            {role}
          </Text>
        </View>
        {onRemove ? (
          <TextButton label="Remove" tone="danger" onPress={onRemove} />
        ) : null}
      </View>
      <Divider />
    </View>
  );
}
