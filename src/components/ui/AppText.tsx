import { memo } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography } from '@/theme/theme';

type Variant = keyof typeof typography;
type Tone = 'default' | 'muted' | 'secondary' | 'primary' | 'navy' | 'danger' | 'inverse' | 'success';

export interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
}

const toneStyle = StyleSheet.create({
  default: { color: colors.text },
  muted: { color: colors.textMuted },
  secondary: { color: colors.textSecondary },
  primary: { color: colors.primary },
  navy: { color: colors.navy },
  danger: { color: colors.danger },
  inverse: { color: colors.white },
  success: { color: colors.success },
});

const variantStyle = StyleSheet.create(typography);

const styles = StyleSheet.create({ center: { textAlign: 'center' } });

function AppTextBase({ variant = 'body', tone = 'default', center, style, ...rest }: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[variantStyle[variant], toneStyle[tone], center && styles.center, style]}
    />
  );
}

export const AppText = memo(AppTextBase);
