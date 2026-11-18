import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { LanguageSheet } from '@/components/common/LanguageSheet';
import { PetCard, PetCardSkeleton } from '@/components/pet/PetCard';
import { PetHeroHeader } from '@/components/pet/PetHeroHeader';
import { PetSelector } from '@/components/pet/PetSelector';
import { QuickActionCard } from '@/components/pet/QuickActionCard';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { useAppointments } from '@/hooks/services/useAppointments';
import { usePrefetchPet } from '@/hooks/services/usePets';
import { useLanguage } from '@/hooks/useLanguage';
import { useSelectedPet } from '@/hooks/useSelectedPet';
import { colors, spacing } from '@/theme/theme';

import { UpcomingSummary } from './UpcomingSummary';

export default function PetHome() {
  const { t } = useTranslation();
  const router = useRouter();
  const { query, pets, pet, selectPet } = useSelectedPet();
  const prefetchPet = usePrefetchPet();
  const { refetch: refetchAppointments } = useAppointments();
  const { language, setLanguage } = useLanguage();
  const [languageOpen, setLanguageOpen] = useState(false);
  const openLanguage = useCallback(() => setLanguageOpen(true), []);
  const closeLanguage = useCallback(() => setLanguageOpen(false), []);

  const goAdd = useCallback(() => router.push('/pet/new'), [router]);
  const goDetail = useCallback((id: string) => router.push({ pathname: '/pet/[id]', params: { id } }), [router]);
  const goChat = useCallback(() => router.navigate('/chat'), [router]);
  const goAppointment = useCallback(() => router.navigate('/appointment'), [router]);
  const onRefresh = useCallback(() => {
    void query.refetch();
    void refetchAppointments();
  }, [query, refetchAppointments]);

  const isInitialLoading = query.isPending;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !isInitialLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <PetHeroHeader petName={pet?.name} onLanguagePress={openLanguage}>
          {isInitialLoading ? (
            <View style={styles.selectorSkeleton}>
              <Skeleton width={60} height={60} rounded={30} />
              <Skeleton width={60} height={60} rounded={30} />
              <Skeleton width={60} height={60} rounded={30} />
            </View>
          ) : pets.length > 0 ? (
            <PetSelector pets={pets} selectedId={pet?.id} onSelect={selectPet} onAdd={goAdd} />
          ) : null}
        </PetHeroHeader>

        <View style={styles.body}>
          {isInitialLoading ? (
            <PetCardSkeleton />
          ) : query.isError && pets.length === 0 ? (
            <ErrorState message={query.error.message} onRetry={onRefresh} />
          ) : !pet ? (
            <EmptyState
              emoji="🐾"
              title={t('pet.home.noPetTitle')}
              description={t('pet.home.noPetBody')}
              actionLabel={t('pet.home.addPet')}
              onAction={goAdd}
            />
          ) : (
            <Animated.View key={pet.id} entering={FadeInDown.duration(260)} style={styles.cards}>
              <PetCard pet={pet} onPress={goDetail} onPressIn={prefetchPet} />
              <QuickActionCard
                highlight
                tag={t('pet.home.askAiTag')}
                title={t('pet.home.askAiTitle', { name: pet.name })}
                description={t('pet.home.askAiBody')}
                icon="chatbubble-ellipses"
                onPress={goChat}
              />
              <UpcomingSummary petId={pet.id} onPress={goAppointment} />
            </Animated.View>
          )}
        </View>
      </ScrollView>
      <LanguageSheet visible={languageOpen} value={language} onSelect={setLanguage} onClose={closeLanguage} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  body: { paddingHorizontal: spacing.lg, marginTop: -spacing.xs },
  cards: { gap: spacing.md },
  selectorSkeleton: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg },
});
