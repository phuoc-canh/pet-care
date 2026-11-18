import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '@/theme/theme';

import { PressableScale } from './PressableScale';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onPressIn?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

function CardBase({ children, style, onPress, onPressIn, accessibilityLabel, accessibilityHint }: CardProps) {
  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        onPressIn={onPressIn}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={[styles.card, style]}
      >
        {children}
      </PressableScale>
    );
  }
  return (
    <View style={[styles.card, style]} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

export const Card = memo(CardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    ...shadow.card,
  },
});
