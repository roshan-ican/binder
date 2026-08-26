import { View } from 'react-native';
import { colors, radius, size, spacing } from '../theme';
import { Button } from './Button';
import { Text } from './Text';

/**
 * Every empty state says what to do next. "No enquiries." on its own is a
 * dead end and is never shipped.
 */
export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ paddingVertical: spacing[12], gap: spacing[3] }}>
      <Text variant="heading3">{title}</Text>
      <Text variant="body" tone="secondary">
        {body}
      </Text>
      {actionLabel ? (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} style={{ marginTop: spacing[3] }} />
      ) : null}
    </View>
  );
}

/** Errors are non-technical and always leave a way forward. */
export function InlineError({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <View
      accessibilityRole="alert"
      style={{
        borderRadius: radius.md,
        borderWidth: size.hairline,
        borderColor: colors.semantic.danger,
        padding: spacing[4],
        gap: spacing[2],
      }}
    >
      <Text variant="labelLarge" tone="danger">
        {title}
      </Text>
      <Text variant="bodySmall" tone="secondary">
        {body}
      </Text>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} style={{ marginTop: spacing[2] }} /> : null}
    </View>
  );
}

/** Skeletons, used sparingly — three rows, never a full-screen spinner. */
export function Skeleton({ height = 16, width }: { height?: number; width?: number | `${number}%` }) {
  return (
    <View
      accessibilityElementsHidden
      style={{
        height,
        width: width ?? '100%',
        borderRadius: radius.xs,
        backgroundColor: colors.surface.soft,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <View
      style={{
        borderRadius: radius.md,
        borderWidth: size.hairline,
        borderColor: colors.border.subtle,
        padding: spacing[4],
        gap: spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', gap: spacing[3] }}>
        <Skeleton height={size.logo} width={size.logo} />
        <View style={{ flex: 1, gap: spacing[2], justifyContent: 'center' }}>
          <Skeleton height={14} width="60%" />
          <Skeleton height={12} width="40%" />
        </View>
      </View>
      <Skeleton height={12} width="80%" />
    </View>
  );
}

/** SME connectivity is uneven — say so plainly and keep the drafts safe. */
export function OfflineBanner() {
  return (
    <View
      accessibilityRole="alert"
      style={{
        backgroundColor: colors.surface.soft,
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[3],
        borderBottomWidth: size.hairline,
        borderBottomColor: colors.border.subtle,
      }}
    >
      <Text variant="bodySmall" tone="secondary">
        You're offline. Changes will sync when you're connected.
      </Text>
    </View>
  );
}
