import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Avatar, PressableScale } from '@/components/ui';
import { SPECIES_MAP } from '@/constants/pet';
import { strings } from '@/constants/strings';
import { haptic } from '@/hooks/useHaptic';
import { colors, layout, radius, spacing } from '@/theme/theme';
import type { Pet } from '@/types/services-type/pet.type';

interface RowProps {
  pet: Pet;
  selected: boolean;
  onPick: (id: string) => void;
}

const Row = memo(function Row({ pet, selected, onPick }: RowProps) {
  const handlePress = useCallback(() => onPick(pet.id), [onPick, pet.id]);
  return (
    <PressableScale
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={pet.name}
      style={[styles.row, selected && styles.rowSelected]}
    >
      <Avatar species={pet.species} size={44} />
      <View style={styles.rowText}>
        <AppText variant="bodyStrong">{pet.name}</AppText>
        <AppText variant="caption" tone="secondary">
          {SPECIES_MAP[pet.species].label} · {pet.breed}
        </AppText>
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} /> : null}
    </PressableScale>
  );
});

export interface PetSwitcherSheetProps {
  visible: boolean;
  pets: Pet[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** Bottom sheet chọn thú cưng ngay tại header chat. */
function PetSwitcherSheetBase({ visible, pets, selectedId, onSelect, onClose }: PetSwitcherSheetProps) {
  const insets = useSafeAreaInsets();
  const pick = useCallback(
    (id: string) => {
      if (id !== selectedId) haptic.selection();
      onSelect(id);
      onClose();
    },
    [onClose, onSelect, selectedId],
  );

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(180)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={strings.common.close} />
        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
        >
          <View style={styles.grabber} />
          <AppText variant="subtitle" accessibilityRole="header" style={styles.title}>
            {strings.chat.pickPetTitle}
          </AppText>
          <View style={styles.list}>
            {pets.map((p) => (
              <Row key={p.id} pet={p} selected={p.id === selectedId} onPick={pick} />
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export const PetSwitcherSheet = memo(PetSwitcherSheetBase);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '75%',
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
  list: { gap: spacing.xs },
  row: {
    minHeight: layout.minTouch + 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  rowSelected: { borderColor: colors.primary },
  rowText: { flex: 1, gap: 2 },
});
