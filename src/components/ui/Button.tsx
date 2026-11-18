import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { haptic } from '@/hooks/useHaptic';
import { colors, layout, radius, spacing, typography } from '@/theme/theme';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

function ButtonBase({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const inactive = disabled || loading;
  const v = variantStyles[variant];

  const handlePress = useCallback(() => {
    if (inactive) return;
    haptic.light();
    onPress?.();
  }, [inactive, onPress]);

  const textTone = variant === 'primary' || variant === 'danger' ? 'inverse' : variant === 'secondary' ? 'primary' : 'primary';
  const iconColor = variant === 'primary' || variant === 'danger' ? colors.white : colors.primary;

  return (
    <PressableScale
      onPress={handlePress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[styles.base, v, fullWidth && styles.fullWidth, inactive && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={20} color={iconColor} /> : null}
          <AppText variant="bodyStrong" tone={textTone} style={styles.label} numberOfLines={1}>
            {title}
          </AppText>
        </View>
      )}
    </PressableScale>
  );
}

export const Button = memo(ButtonBase);

const styles = StyleSheet.create({
  base: {
    height: layout.buttonHeight,
    minWidth: layout.minTouch,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  label: { fontWeight: typography.bodyStrong.fontWeight },
  disabled: { opacity: 0.45 },
});

/** Viền dưới đậm hơn tạo cảm giác nút 3D. */
const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryPressed,
  },
  danger: {
    backgroundColor: colors.danger,
    borderBottomWidth: 4,
    borderBottomColor: colors.dangerPressed,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderBottomWidth: 4,
    borderBottomColor: '#C3D6F5',
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
});
