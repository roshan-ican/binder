import { Modal, Switch, View } from 'react-native';
import { colors, elevation, radius, size, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { Button } from './Button';
import { Divider } from './Divider';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing[4], paddingVertical: spacing[2] }}>
      <Text variant="body" tone="tertiary">{label}</Text>
      <Text variant="body" style={{ flex: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

export function ActionRow({ label, detail, icon = 'chevronRight', onPress, danger = false }: {
  label: string;
  detail?: string;
  icon?: IconName;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <AnimatedPressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} pressedScale={0.985}
      style={{ minHeight: size.control, flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3] }}>
      <View style={{ flex: 1, gap: spacing[1] }}>
        <Text variant="body" tone={danger ? 'danger' : 'primary'}>{label}</Text>
        {detail ? <Text variant="bodySmall" tone="tertiary">{detail}</Text> : null}
      </View>
      <Icon name={icon} size={size.iconSm} color={danger ? colors.semantic.danger : colors.text.tertiary} />
    </AnimatedPressable>
  );
}

export function ToggleRow({ label, detail, value, onChange }: {
  label: string;
  detail: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingVertical: spacing[3] }}>
      <View style={{ flex: 1, gap: spacing[1] }}>
        <Text variant="body">{label}</Text>
        <Text variant="bodySmall" tone="tertiary">{detail}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.surface.selected, true: colors.chrome[500] }} thumbColor={value ? colors.chrome[100] : colors.text.tertiary} />
    </View>
  );
}

export function ConfirmSheet({ visible, eyebrow, title, body, confirmLabel, destructive, onConfirm, onClose }: {
  visible: boolean;
  eyebrow?: string;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.72)' }}>
        <View style={{ backgroundColor: colors.bg.raised, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, borderWidth: size.hairline, borderColor: colors.border.strong, padding: spacing[6], paddingBottom: spacing[8], gap: spacing[5], ...elevation.sheet }}>
          <View style={{ gap: spacing[2] }}>
            {eyebrow ? <Text variant="micro" tone={destructive ? 'danger' : 'chrome'}>{eyebrow}</Text> : null}
            <Text variant="heading2">{title}</Text>
            <Text variant="body" tone="secondary">{body}</Text>
          </View>
          <View style={{ gap: spacing[2] }}>
            <Button label={confirmLabel} variant={destructive ? 'destructive' : 'primary'} onPress={onConfirm} />
            <Button label="Cancel" variant="tertiary" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function StatusNotice({ title, body, tone = 'success' }: {
  title: string;
  body: string;
  tone?: 'success' | 'warning' | 'danger';
}) {
  const borderColor = tone === 'success' ? colors.semantic.success : tone === 'warning' ? colors.semantic.warning : colors.semantic.danger;
  return (
    <View accessibilityRole="alert" style={{ borderWidth: size.hairline, borderColor, borderRadius: radius.md, padding: spacing[4], gap: spacing[1] }}>
      <Text variant="labelLarge" tone={tone}>{title}</Text>
      <Text variant="bodySmall" tone="secondary">{body}</Text>
    </View>
  );
}

export function RuledSection({ children }: { children: React.ReactNode }) {
  return <><Divider /><View style={{ paddingVertical: spacing[3] }}>{children}</View></>;
}
