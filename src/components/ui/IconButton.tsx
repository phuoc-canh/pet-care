import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback, useRef } from 'react';
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
 * Nút icon tròn 44×44.
 *
 * Kích hoạt ở onPressIn (ngón tay vừa chạm), không đợi onPress (nhấc tay):
 * các nút này hay nằm sát mép trên màn hình — trên iPhone tai thỏ, iOS trì hoãn/HỦY chạm ở vùng
 * này vì nghi là cử chỉ hệ thống (vuốt mở Control Center / Notification Center), khiến onPress
 * lúc được lúc không. touchesBegan vẫn tới nên onPressIn luôn chạy. Có chặn bấm lặp 400ms.
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
  const lastRef = useRef(0);
  const handlePressIn = useCallback(() => {
    const now = Date.now();
    if (now - lastRef.current < 400) return;
    lastRef.current = now;
    haptic.light();
    onPress();
  }, [onPress]);

  const color = variant === 'primary' ? colors.white : colors.navy;

  return (
    <Pressable
      onPressIn={handlePressIn}
      // VoiceOver/TalkBack kích hoạt qua action "activate" (không phát onPressIn).
      accessibilityActions={ACCESSIBILITY_ACTIONS}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'activate' && !disabled) onPress();
      }}
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

const ACCESSIBILITY_ACTIONS = [{ name: 'activate' as const }];

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
