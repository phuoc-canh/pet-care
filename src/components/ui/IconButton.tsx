import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { haptic } from '@/hooks/useHaptic';
import { colors, layout, radius, shadow } from '@/theme/theme';

import { PressableScale } from './PressableScale';

export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  /** Bắt buộc: nút chỉ có icon phải có nhãn cho screen reader. */
  accessibilityLabel: string;
  variant?: 'surface' | 'primary' | 'plain';
  disabled?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

function IconButtonBase({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  disabled = false,
  size = layout.minTouch,
  style,
}: IconButtonProps) {
  const handlePress = useCallback(() => {
    haptic.light();
    onPress();
  }, [onPress]);

  const color = variant === 'primary' ? colors.white : variant === 'plain' ? colors.navy : colors.navy;

  return (
    <PressableScale
      onPress={handlePress}
      disabled={disabled}
      hitSlop={layout.hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        { width: size, height: size },
        variantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={color} />
    </PressableScale>
  );
}

export const IconButton = memo(IconButtonBase);

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
});

const variantStyles = StyleSheet.create({
  surface: { backgroundColor: colors.surface, ...shadow.soft },
  primary: { backgroundColor: colors.primary },
  plain: { backgroundColor: colors.transparent },
});
