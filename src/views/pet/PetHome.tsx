import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PetCard, PetCardSkeleton } from '@/components/pet/PetCard';
import { PetHeroHeader } from '@/components/pet/PetHeroHeader';
import { PetSelector } from '@/components/pet/PetSelector';
import { QuickActionCard } from '@/components/pet/QuickActionCard';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { strings } from '@/constants/strings';
import { usePrefetchPet } from '@/hooks/services/usePets';
import { useSelectedPet } from '@/hooks/useSelectedPet';
import { colors, spacing } from '@/theme/theme';

import { UpcomingSummary } from './UpcomingSummary';

export default function PetHome() {
  const router = useRouter();
  const { query, pets, pet, selectPet } = useSelectedPet();
  const prefetchPet = usePrefetchPet();

  const goAdd = useCallback(() => router.push('/pet/new'), [router]);
  const goDetail = useCallback((id: string) => router.push({ pathname: '/pet/[id]', params: { id } }), [router]);
  const goChat = useCallback(() => router.navigate('/chat'), [router]);
  const goAppointment = useCallback(() => router.navigate('/appointment'), [router]);
  const onRefresh = useCallback(() => void query.refetch(), [query]);

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
        <PetHeroHeader petName={pet?.name}>
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
              title={strings.petHome.noPetTitle}
              description={strings.petHome.noPetBody}
              actionLabel={strings.petHome.addPet}
              onAction={goAdd}
            />
          ) : (
            <Animated.View key={pet.id} entering={FadeInDown.duration(260)} style={styles.cards}>
              <PetCard pet={pet} onPress={goDetail} onPressIn={prefetchPet} />
              <QuickActionCard
                highlight
                tag={strings.petHome.askAiTag}
                title={strings.petHome.askAiTitle(pet.name)}
                description={strings.petHome.askAiBody}
                icon="chatbubble-ellipses"
                onPress={goChat}
              />
              <UpcomingSummary petId={pet.id} onPress={goAppointment} />
            </Animated.View>
          )}
        </View>
      </ScrollView>
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
