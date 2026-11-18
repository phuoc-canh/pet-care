import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DialogDeletePet } from '@/components/pet/DialogDeletePet';
import { PetCardSkeleton } from '@/components/pet/PetCard';
import { AppText, Avatar, Button, Card, ErrorState, IconButton, Pill } from '@/components/ui';
import { SPECIES_EMOJI } from '@/constants/pet';
import { useTranslation } from 'react-i18next';
import { useDeletePet, usePet } from '@/hooks/services/usePets';
import { haptic } from '@/hooks/useHaptic';
import { useAppStore } from '@/store/app.store';
import { useChatStore } from '@/store/chat.store';
import { colors, spacing } from '@/theme/theme';
import { formatAge, formatWeight } from '@/utils/format';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="body" tone="secondary">
        {label}
      </AppText>
      <AppText variant="bodyStrong" tone="navy">
        {value}
      </AppText>
    </View>
  );
}

export default function PetDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: pet, isPending, isError, error, refetch } = usePet(id);
  const deletePet = useDeletePet();
  const selectPet = useAppStore((s) => s.selectPet);
  const clearChat = useChatStore((s) => s.clear);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const goBack = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/')), [router]);
  const goEdit = useCallback(() => router.push({ pathname: '/pet/new', params: { id } }), [router, id]);
  const goChat = useCallback(() => {
    if (!id) return;
    selectPet(id);
    router.navigate('/chat');
  }, [id, router, selectPet]);

  const openConfirm = useCallback(() => {
    haptic.warning();
    setConfirmVisible(true);
  }, []);
  const closeConfirm = useCallback(() => setConfirmVisible(false), []);

  const confirmDelete = useCallback(() => {
    if (!id) return;
    // Optimistic: danh sách cập nhật ngay, đóng màn luôn; nếu lỗi hook tự rollback.
    deletePet.mutateAsync(id).then(() => {
      haptic.success();
      clearChat(id);
    }, haptic.error);
    setConfirmVisible(false);
    goBack();
  }, [clearChat, deletePet, goBack, id]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <IconButton icon="chevron-back" onPress={goBack} accessibilityLabel={t('common.back')} />
        <AppText variant="subtitle" accessibilityRole="header">
          {t('pet.detail.title')}
        </AppText>
        <IconButton icon="create-outline" onPress={goEdit} accessibilityLabel={t('pet.detail.edit')} disabled={!pet} />
      </View>

      {isPending ? (
        <View style={styles.content}>
          <PetCardSkeleton />
        </View>
      ) : isError || !pet ? (
        <ErrorState message={error?.message} onRetry={() => void refetch()} />
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Animated.View entering={FadeInDown.duration(260)} style={styles.hero}>
            <Avatar species={pet.species} size={112} />
            <AppText variant="heading" tone="navy">
              {pet.name}
            </AppText>
            <Pill label={`${SPECIES_EMOJI[pet.species]} ${t(`pet.species.${pet.species}`)}`} tone="soft" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60).duration(260)}>
            <Card>
              <Pill label={t('pet.detail.info')} icon="information-circle" />
              <View style={styles.infoList}>
                <InfoRow label={t('pet.home.breed')} value={pet.breed} />
                <View style={styles.sep} />
                <InfoRow label={t('pet.home.age')} value={formatAge(pet.ageYears)} />
                <View style={styles.sep} />
                <InfoRow label={t('pet.home.weight')} value={formatWeight(pet.weightKg)} />
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(260)}>
            <Card>
              <Pill label={t('pet.home.personality')} icon="sparkles" />
              <View style={styles.tags}>
                {pet.personalities.map((p) => (
                  <Pill key={p} label={t(`pet.personality.${p}`)} tone="soft" />
                ))}
              </View>
            </Card>
          </Animated.View>

          <View style={styles.actions}>
            <Button title={t('pet.detail.askAi', { name: pet.name })} icon="chatbubble-ellipses" onPress={goChat} />
            <Button title={t('pet.detail.edit')} variant="secondary" icon="create-outline" onPress={goEdit} />
            <Button title={t('pet.detail.delete')} variant="ghost" icon="trash-outline" onPress={openConfirm} />
          </View>
        </ScrollView>
      )}

      <DialogDeletePet
        visible={confirmVisible}
        petName={pet?.name ?? ''}
        loading={deletePet.isPending}
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  content: { padding: spacing.lg, gap: spacing.md },
  hero: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  infoList: { marginTop: spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  sep: { height: 1, backgroundColor: colors.border },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
});
