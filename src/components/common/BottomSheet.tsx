import { memo, type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { colors, radius, spacing } from '@/theme/theme';

export interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Bottom sheet dùng chung.
 * Lưu ý iOS: layout animation (`entering`) của Reanimated KHÔNG chạy bên trong <Modal> —
 * nội dung kẹt ở trạng thái ẩn và chạm vào chỉ trúng nền vô hình. Vì vậy nền mờ dùng
 * fade native của Modal, còn sheet trượt lên bằng shared value + withSpring (chạy ổn trong Modal).
 */
function BottomSheetBase({ visible, title, onClose, children }: BottomSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const offset = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      offset.set(height);
      offset.set(withSpring(0, { damping: 22, stiffness: 220, mass: 0.8 }));
    }
  }, [height, offset, visible]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.get() }] }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.close')} />
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }, sheetStyle]}>
          <View style={styles.grabber} />
          <AppText variant="subtitle" accessibilityRole="header" style={styles.title}>
            {title}
          </AppText>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

export const BottomSheet = memo(BottomSheetBase);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '80%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: { marginBottom: spacing.md },
});
