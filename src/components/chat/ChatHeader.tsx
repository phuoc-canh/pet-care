import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AppText, Avatar, Pill, PressableScale } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { colors, layout, spacing } from '@/theme/theme';
import type { Pet } from '@/types/services-type/pet.type';

export interface ChatHeaderProps {
  pet: Pet;
  offline: boolean;
  onSwitchPet: () => void;
}

function ChatHeaderBase({ pet, offline, onSwitchPet }: ChatHeaderProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <PressableScale
        onPress={onSwitchPet}
        accessibilityRole="button"
        accessibilityLabel={t('chat.switchPetLabel', { name: pet.name })}
        style={styles.petButton}
      >
        <Avatar species={pet.species} size={40} />
        <View style={styles.texts}>
          <AppText variant="caption" tone="secondary">
            {t('chat.askingAbout')}
          </AppText>
          <View style={styles.nameRow}>
            <AppText variant="subtitle" tone="navy" numberOfLines={1} style={styles.name}>
              {pet.name}
            </AppText>
            <Ionicons name="chevron-down" size={18} color={colors.navy} />
          </View>
        </View>
      </PressableScale>

      <View style={styles.right}>
        {offline ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} accessibilityLiveRegion="polite">
            <Pill label={t('chat.offline')} tone="warning" icon="cloud-offline" />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

export const ChatHeader = memo(ChatHeaderBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  petButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: layout.minTouch, flexShrink: 1 },
  texts: { flexShrink: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  name: { flexShrink: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
});
