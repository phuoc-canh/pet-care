import { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing } from '@/theme/theme';

import { AppText } from './AppText';
import { Button } from './Button';

export interface EmptyStateProps {
  emoji: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

function EmptyStateBase({ emoji, title, description, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <Animated.View entering={FadeInDown.duration(320)} style={[styles.container, style]}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji} allowFontScaling={false}>
          {emoji}
        </Text>
      </View>
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" tone="secondary" center style={styles.description}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.action} fullWidth={false} />
      ) : null}
    </Animated.View>
  );
}

export const EmptyState = memo(EmptyStateBase);

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, gap: spacing.xs },
  emojiWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emoji: { fontSize: 42, lineHeight: 52 },
  description: { maxWidth: 300 },
  action: { marginTop: spacing.md, minWidth: 180 },
});
