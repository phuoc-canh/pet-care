import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { haptic } from '@/hooks/useHaptic';
import { colors, layout, motion, radius, shadow } from '@/theme/theme';

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

/**
 * Nút icon tròn. Cố ý dùng Pressable "trần" với style + kích thước đặt TRỰC TIẾP lên Pressable
 * (không bọc Animated.View, không hitSlop): trên iOS kiến trúc mới, Pressable không có style
 * bọc ngoài view có kích thước có thể bị flatten khiến vùng chạm không nhận. Kích thước 44×44
 * đã đạt chuẩn vùng chạm nên không cần hitSlop.
 */
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

  const color = variant === 'primary' ? colors.white : colors.navy;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      collapsable={false}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        { width: Math.max(size, layout.minTouch), height: Math.max(size, layout.minTouch) },
        variantStyles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={color} />
    </Pressable>
  );
}

export const IconButton = memo(IconButtonBase);

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7, transform: [{ scale: motion.pressScale }] },
  disabled: { opacity: 0.4 },
});

const variantStyles = StyleSheet.create({
  surface: { backgroundColor: colors.surface, ...shadow.soft },
  primary: { backgroundColor: colors.primary },
  plain: { backgroundColor: colors.transparent },
});
