import { memo, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText, Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { colors, radius, shadow, spacing } from '@/theme/theme';

export interface DialogConfirmProps {
  visible: boolean;
  title: string;
  message?: string;
  emoji?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Dialog xác nhận dùng chung. Các dialog cụ thể (DialogDeletePet…) chỉ bọc lại với text riêng. */
function DialogConfirmBase({
  visible,
  title,
  message,
  emoji,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: DialogConfirmProps) {
  const { t } = useTranslation();
  // Không dùng layout animation (entering) trong <Modal> vì không chạy trên iOS → dùng shared value.
  const scale = useSharedValue(0.9);
  useEffect(() => {
    if (visible) {
      scale.set(0.9);
      scale.set(withSpring(1, { damping: 16, stiffness: 260 }));
    }
  }, [scale, visible]);
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel={cancelLabel} />
        <Animated.View style={[styles.card, cardStyle]} accessibilityViewIsModal>
          {emoji ? (
            <View style={[styles.emojiWrap, destructive && styles.emojiDanger]}>
              <Text style={styles.emoji} allowFontScaling={false}>
                {emoji}
              </Text>
            </View>
          ) : null}
          <AppText variant="subtitle" center accessibilityRole="header">
            {title}
          </AppText>
          {message ? (
            <AppText variant="body" tone="secondary" center>
              {message}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            <Button
              title={confirmLabel ?? t('common.confirm')}
              variant={destructive ? 'danger' : 'primary'}
              loading={loading}
              onPress={onConfirm}
            />
            <Button title={cancelLabel ?? t('common.cancel')} variant="ghost" onPress={onCancel} disabled={loading} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export const DialogConfirm = memo(DialogConfirmBase);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.xs,
    alignItems: 'stretch',
    ...shadow.card,
  },
  emojiWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emojiDanger: { backgroundColor: colors.dangerSoft },
  emoji: { fontSize: 30, lineHeight: 38 },
  actions: { marginTop: spacing.md, gap: spacing.xxs },
});
