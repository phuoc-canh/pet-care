import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '@/theme/theme';

import { AppText } from './AppText';

type Tone = 'white' | 'soft' | 'warning' | 'success' | 'danger';

export interface PillProps {
  label: string;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

const TONE_TEXT = {
  white: 'primary',
  soft: 'primary',
  warning: 'default',
  success: 'success',
  danger: 'danger',
} as const;

const ICON_COLOR: Record<Tone, string> = {
  white: colors.primary,
  soft: colors.primary,
  warning: colors.warning,
  success: colors.success,
  danger: colors.danger,
};

/** Pill tag: mặc định nền trắng chữ primary, đặt trên tiêu đề card. */
function PillBase({ label, tone = 'white', icon, style }: PillProps) {
  return (
    <View style={[styles.base, toneStyles[tone], style]}>
      {icon ? <Ionicons name={icon} size={12} color={ICON_COLOR[tone]} /> : null}
      <AppText variant="caption" tone={TONE_TEXT[tone]} style={styles.text} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

export const Pill = memo(PillBase);

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radius.pill,
  },
  text: { fontWeight: '700' },
});

const toneStyles = StyleSheet.create({
  white: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadow.soft },
  soft: { backgroundColor: colors.primarySoft },
  warning: { backgroundColor: colors.warningSoft },
  success: { backgroundColor: colors.successSoft },
  danger: { backgroundColor: colors.dangerSoft },
});
