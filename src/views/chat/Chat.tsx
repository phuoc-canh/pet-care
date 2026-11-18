import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { PetSwitcherSheet } from '@/components/chat/PetSwitcherSheet';
import { StreamingBubble } from '@/components/chat/StreamingBubble';
import { SuggestionChips } from '@/components/chat/SuggestionChips';
import { DialogConfirm } from '@/components/common/DialogConfirm';
import { AppText, EmptyState, PressableScale, Screen, Skeleton } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { useAppState } from '@/hooks/useAppState';
import { useChatStream } from '@/hooks/useChatStream';
import { useSelectedPet } from '@/hooks/useSelectedPet';
import { colors, radius, shadow, spacing } from '@/theme/theme';
import type { ChatMessage } from '@/types/services-type/chat.type';

/** Cuộn lên quá ngưỡng này (px) thì coi là người dùng đang đọc tin cũ → không tự kéo xuống. */
const AWAY_THRESHOLD = 120;
const ANIMATE_WINDOW_MS = 4000;

const keyExtractor = (m: ChatMessage) => m.id;

export default function Chat() {
  const { t } = useTranslation();
  const router = useRouter();
  const { query, pets, pet, selectPet } = useSelectedPet();
  const chat = useChatStream(pet);
  const { messages, isStreaming, streamStore, offlineReason, suggestions, send, stop, retry, clear } = chat;

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [away, setAway] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const [mountedAt] = useState(Date.now);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const awayRef = useRef(false);

  // Rời màn hình chat hoặc app vào background → hủy request đang stream.
  useFocusEffect(useCallback(() => stop, [stop]));
  useAppState(
    useCallback(
      (status: string) => {
        if (status !== 'active') stop();
      },
      [stop],
    ),
  );

  // FlatList inverted: phần tử 0 nằm dưới cùng → đảo mảng một lần (memo), không đảo trong render item.
  const data = useMemo(() => messages.slice().reverse(), [messages]);
  const hasNew = away && messages.length + (isStreaming ? 1 : 0) > seenCount;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const isAway = e.nativeEvent.contentOffset.y > AWAY_THRESHOLD;
      if (isAway === awayRef.current) return; // chỉ setState khi đổi trạng thái, không phải mỗi lần cuộn
      awayRef.current = isAway;
      setAway(isAway);
      if (isAway) setSeenCount(messages.length + (isStreaming ? 1 : 0));
    },
    [isStreaming, messages.length],
  );

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      send(text);
      // Người gửi luôn muốn thấy tin của mình.
      requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));
    },
    [send],
  );

  const renderItem = useCallback<ListRenderItem<ChatMessage>>(
    ({ item }) => (
      <ChatBubble
        message={item}
        animate={Date.parse(item.createdAt) > mountedAt && Date.now() - Date.parse(item.createdAt) < ANIMATE_WINDOW_MS}
        onRetry={item.errorCode ? retry : undefined}
      />
    ),
    [mountedAt, retry],
  );

  const openSwitcher = useCallback(() => setSwitcherOpen(true), []);
  const closeSwitcher = useCallback(() => setSwitcherOpen(false), []);
  const openClear = useCallback(() => setConfirmClear(true), []);
  const closeClear = useCallback(() => setConfirmClear(false), []);
  const doClear = useCallback(() => {
    clear();
    setConfirmClear(false);
  }, [clear]);
  const goAddPet = useCallback(() => router.push('/pet/new'), [router]);

  if (query.isPending) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Skeleton height={56} rounded={radius.button} />
          <Skeleton width="70%" height={64} rounded={22} />
          <Skeleton width="55%" height={44} rounded={22} style={styles.alignEnd} />
        </View>
      </Screen>
    );
  }

  if (!pet) {
    return (
      <Screen style={styles.center}>
        <EmptyState
          emoji="💬"
          title={t('chat.noPetTitle')}
          description={t('chat.noPetBody')}
          actionLabel={t('pet.home.addPet')}
          onAction={goAddPet}
        />
      </Screen>
    );
  }

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <Screen background={colors.surface}>
      <ChatHeader
        pet={pet}
        offline={offlineReason !== null}
        canClear={messages.length > 0}
        onSwitchPet={openSwitcher}
        onClear={openClear}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.body}>
          {isEmpty ? (
            <ScrollView
              contentContainerStyle={styles.emptyContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Animated.View key={pet.id} entering={FadeInDown.duration(300)} style={styles.greeting}>
                <View style={styles.palAvatar}>
                  <Text style={styles.palEmoji} allowFontScaling={false}>
                    🐾
                  </Text>
                </View>
                <AppText variant="title" tone="navy" center>
                  {t('chat.greetingTitle')}
                </AppText>
                <AppText variant="body" tone="secondary" center style={styles.greetingBody}>
                  {t('chat.greetingBody', { name: pet.name })}
                </AppText>
              </Animated.View>
              <AppText variant="caption" tone="secondary" style={styles.suggestTitle}>
                {t('chat.suggestions')}
              </AppText>
              <SuggestionChips key={`s-${pet.id}`} suggestions={suggestions} onPick={handleSend} />
            </ScrollView>
          ) : (
            <FlatList
              ref={listRef}
              data={data}
              inverted
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ListHeaderComponent={isStreaming ? <StreamingBubble store={streamStore} /> : undefined}
              contentContainerStyle={styles.listContent}
              onScroll={onScroll}
              scrollEventThrottle={64}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              maintainVisibleContentPosition={away ? { minIndexForVisible: 0 } : undefined}
              initialNumToRender={12}
              windowSize={9}
              removeClippedSubviews={Platform.OS === 'android'}
            />
          )}

          {away && !isEmpty ? (
            <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(160)} style={styles.newWrap}>
              <PressableScale
                onPress={scrollToBottom}
                accessibilityRole="button"
                accessibilityLabel={t('chat.scrollToBottom')}
                style={[styles.newButton, hasNew && styles.newButtonActive]}
              >
                <Ionicons name="arrow-down" size={16} color={hasNew ? colors.white : colors.primary} />
                {hasNew ? (
                  <AppText variant="caption" tone="inverse" style={styles.newText}>
                    {t('chat.newMessages')}
                  </AppText>
                ) : null}
              </PressableScale>
            </Animated.View>
          ) : null}
        </View>

        <ChatInput
          placeholder={t('chat.placeholder', { name: pet.name })}
          isStreaming={isStreaming}
          onSend={handleSend}
          onStop={stop}
        />
      </KeyboardAvoidingView>

      <PetSwitcherSheet
        visible={switcherOpen}
        pets={pets}
        selectedId={pet.id}
        onSelect={selectPet}
        onClose={closeSwitcher}
      />
      <DialogConfirm
        visible={confirmClear}
        emoji="🧹"
        title={t('chat.clearTitle')}
        message={t('chat.clearBody', { name: pet.name })}
        confirmLabel={t('common.delete')}
        destructive
        onConfirm={doClear}
        onCancel={closeClear}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center' },
  loading: { padding: spacing.lg, gap: spacing.md },
  alignEnd: { alignSelf: 'flex-end' },
  listContent: { paddingVertical: spacing.sm },
  emptyContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  greeting: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  greetingBody: { maxWidth: 300 },
  palAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  palEmoji: { fontSize: 34, lineHeight: 42 },
  suggestTitle: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  newWrap: { position: 'absolute', bottom: spacing.sm, alignSelf: 'center' },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    minHeight: 40,
    minWidth: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadow.float,
  },
  newButtonActive: { backgroundColor: colors.primary },
  newText: { fontWeight: '700' },
});
