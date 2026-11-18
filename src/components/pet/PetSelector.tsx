import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback, useEffect, useRef } from 'react';
import { FlatList, type ListRenderItem, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText, Avatar, PressableScale } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { haptic } from '@/hooks/useHaptic';
import { colors, layout, spacing } from '@/theme/theme';
import type { Pet } from '@/types/services-type/pet.type';

interface ItemProps {
  pet: Pet;
  selected: boolean;
  onSelect: (id: string) => void;
}

const SelectorItem = memo(function SelectorItem({ pet, selected, onSelect }: ItemProps) {
  const { t } = useTranslation();
  const handlePress = useCallback(() => {
    if (selected) return;
    haptic.selection();
    onSelect(pet.id);
  }, [onSelect, pet.id, selected]);

  return (
    <PressableScale
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={t('pet.home.selectorLabel', { name: pet.name })}
      style={styles.item}
    >
      <Avatar species={pet.species} size={52} selected={selected} />
      <AppText variant="caption" tone={selected ? 'primary' : 'secondary'} style={styles.name} numberOfLines={1}>
        {pet.name}
      </AppText>
    </PressableScale>
  );
});

export interface PetSelectorProps {
  pets: Pet[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onAdd?: () => void;
}

const keyExtractor = (p: Pet) => p.id;
const ITEM_WIDTH = 68;
const ITEM_STRIDE = ITEM_WIDTH + spacing.sm;

/** Thanh chọn thú cưng ngang. Dùng ở Home và header Chat. */
function PetSelectorBase({ pets, selectedId, onSelect, onAdd }: PetSelectorProps) {
  const { t } = useTranslation();
  const listRef = useRef<FlatList<Pet>>(null);
  const { width } = useWindowDimensions();
  const selectedIndex = pets.findIndex((p) => p.id === selectedId);

  // Con đang chọn luôn nằm trong tầm nhìn (vd. vừa thêm thú cưng mới ở cuối danh sách).
  useEffect(() => {
    if (selectedIndex < 0) return;
    const center = spacing.lg + selectedIndex * ITEM_STRIDE + ITEM_WIDTH / 2;
    listRef.current?.scrollToOffset({ offset: Math.max(0, center - width / 2), animated: true });
  }, [selectedIndex, width]);

  const renderItem = useCallback<ListRenderItem<Pet>>(
    ({ item }) => <SelectorItem pet={item} selected={item.id === selectedId} onSelect={onSelect} />,
    [onSelect, selectedId],
  );

  const footer = onAdd ? (
    <PressableScale
      onPress={onAdd}
      accessibilityRole="button"
      accessibilityLabel={t('pet.home.addPetLabel')}
      style={styles.item}
    >
      <View style={styles.add}>
        <Ionicons name="add" size={26} color={colors.primary} />
      </View>
      <AppText variant="caption" tone="secondary" numberOfLines={1} style={styles.name}>
        {t('pet.home.addShort')}
      </AppText>
    </PressableScale>
  ) : undefined;

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={pets}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      extraData={selectedId}
      ListFooterComponent={footer}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      accessibilityRole="tablist"
    />
  );
}

export const PetSelector = memo(PetSelectorBase);

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  item: { alignItems: 'center', width: ITEM_WIDTH, minHeight: layout.minTouch, gap: spacing.xxs },
  name: { fontWeight: '700', maxWidth: ITEM_WIDTH },
  add: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
