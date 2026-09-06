import { useState } from "react";
import { View } from "react-native";
import { Button, Screen, Text, TextButton, ToggleRow } from "../components";
import type { TradeIntent, UserRole } from "../data/mock";
import { colors, spacing } from "../theme";

/** First choose the side of the marketplace before entering the app. */
export function WelcomeScreen({
  onSelectRole,
  onExplore,
  onSignIn,
}: {
  onSelectRole: (role: UserRole, intent: TradeIntent) => void;
  onExplore: () => void;
  onSignIn?: () => void;
}) {
  const [isBuyer, setIsBuyer] = useState(false);
  const [wantsToSell, setWantsToSell] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!isBuyer && !wantsToSell) {
      setError('Choose at least one to continue.');
      return;
    }
    const intent: TradeIntent = isBuyer && wantsToSell ? 'both' : wantsToSell ? 'seller' : 'buyer';
    onSelectRole('business', intent);
  };

  return (
    <Screen density="hero" scroll={false}>
      <View
        style={{ flex: 1, justifyContent: "center", paddingBottom: spacing[8] }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 620,
            alignSelf: "center",
            gap: spacing[12],
          }}
        >
          <View style={{ gap: spacing[6] }}>
            <Text variant="micro" style={{ color: colors.chrome[200] }}>
              Binder
            </Text>
            <Text variant="displayMedium">What brings you to Binder?</Text>
            <Text variant="heading3" style={{ color: colors.chrome[100] }}>
              Choose how you want to start.
            </Text>
          </View>

          <View style={{ gap: spacing[3] }}>
            <ToggleRow
              label="Are you a buyer?"
              detail="You'll browse and post what your business needs."
              value={isBuyer}
              onChange={(value) => { setIsBuyer(value); setError(null); }}
            />
            <ToggleRow
              label="Do you also want to sell?"
              detail="List what your business can offer to other buyers."
              value={wantsToSell}
              onChange={(value) => { setWantsToSell(value); setError(null); }}
            />
            {error ? (
              <Text variant="bodySmall" tone="danger">{error}</Text>
            ) : null}
            <Button label="Continue" onPress={handleContinue} />
            {/* Job-seeker path disabled — Binder is business-only for now.
            <Button
              label="I am a job seeker"
              onPress={() => onSelectRole("job-seeker")}
            /> */}
            <TextButton label="Already have an account? Sign in" onPress={onSignIn} tone="chrome" />
            {/* <View style={{ alignItems: 'center', paddingTop: spacing[2] }}>
              <TextButton label="Look around first" onPress={onExplore} tone="secondary" />
            </View> */}
            <Text
              variant="bodySmall"
              tone="tertiary"
              style={{ textAlign: "center", marginTop: spacing[2] }}
            >
              Business discovery, hiring, buying, and selling stay in one place.
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}
