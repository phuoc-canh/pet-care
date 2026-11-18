import { memo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { AppText, Button } from '@/components/ui';
import { strings } from '@/constants/strings';
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
  confirmLabel = strings.common.confirm,
  cancelLabel = strings.common.cancel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: DialogConfirmProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <Animated.View entering={FadeIn.duration(180)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel={cancelLabel} />
        <Animated.View entering={ZoomIn.springify().damping(18)} style={styles.card} accessibilityViewIsModal>
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
              title={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              loading={loading}
              onPress={onConfirm}
            />
            <Button title={cancelLabel} variant="ghost" onPress={onCancel} disabled={loading} />
          </View>
        </Animated.View>
      </Animated.View>
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
