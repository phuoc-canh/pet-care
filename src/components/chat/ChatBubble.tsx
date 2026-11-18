import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText, PressableScale } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { colors, layout, radius, shadow, spacing } from '@/theme/theme';
import type { ChatMessage } from '@/types/services-type/chat.type';
import type { AppErrorCode } from '@/types/services-type/common.type';

import { RichText } from './RichText';

type NoticeKey = 'NETWORK' | 'TIMEOUT' | 'NO_CREDIT' | 'RATE_LIMITED' | 'SERVER' | 'MISSING_CONFIG' | 'UNAUTHORIZED' | 'DEFAULT' | 'PARTIAL';

function noticeKey(code: AppErrorCode, offline: boolean): NoticeKey {
  if (!offline) return 'PARTIAL';
  switch (code) {
    case 'NETWORK':
    case 'TIMEOUT':
    case 'NO_CREDIT':
    case 'RATE_LIMITED':
    case 'SERVER':
    case 'MISSING_CONFIG':
    case 'UNAUTHORIZED':
      return code;
    default:
      return 'DEFAULT';
  }
}

export interface ChatBubbleProps {
  message: ChatMessage;
  /** Chỉ animate tin vừa tạo — tránh animate lại khi FlatList tái sử dụng/cuộn. */
  animate: boolean;
  onRetry?: (id: string) => void;
}

function ChatBubbleBase({ message, animate, onRetry }: ChatBubbleProps) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const handleRetry = useCallback(() => onRetry?.(message.id), [message.id, onRetry]);
  const showNotice = !isUser && message.errorCode && message.errorCode !== 'MISSING_CONFIG';

  return (
    <Animated.View
      entering={animate ? FadeInDown.duration(260).springify().damping(20) : undefined}
      style={[styles.row, isUser ? styles.rowUser : styles.rowAi]}
    >
      <View
        style={[styles.bubble, isUser ? styles.user : styles.ai]}
        accessible
        accessibilityLabel={`${isUser ? t('chat.you') : t('chat.pal')}: ${message.content}`}
      >
        {isUser ? (
          <AppText variant="body" tone="inverse" style={styles.userText} selectable>
            {message.content}
          </AppText>
        ) : (
          <RichText content={message.content} />
        )}
      </View>

      {showNotice ? (
        <View style={styles.notice}>
          <Ionicons name="cloud-offline-outline" size={14} color={colors.textSecondary} />
          <AppText variant="caption" tone="secondary" style={styles.noticeText}>
            {t(`chat.notice.${noticeKey(message.errorCode ?? 'UNKNOWN', Boolean(message.offline))}`)}
          </AppText>
          {onRetry ? (
            <PressableScale
              onPress={handleRetry}
              hitSlop={layout.hitSlop}
              accessibilityRole="button"
              accessibilityLabel={t('chat.retry')}
              style={styles.retry}
            >
              <Ionicons name="refresh" size={14} color={colors.primary} />
              <AppText variant="caption" tone="primary" style={styles.retryText}>
                {t('chat.retry')}
              </AppText>
            </PressableScale>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

export const ChatBubble = memo(ChatBubbleBase);

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, paddingVertical: spacing.xxs, maxWidth: '100%' },
  rowUser: { alignItems: 'flex-end' },
  rowAi: { alignItems: 'flex-start' },
  bubble: { maxWidth: '86%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 22 },
  user: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  ai: { backgroundColor: colors.surface, borderBottomLeftRadius: 6, ...shadow.soft },
  userText: { fontSize: 15, lineHeight: 22 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
    marginLeft: spacing.xxs,
    maxWidth: '90%',
  },
  noticeText: { flexShrink: 1 },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
    minHeight: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  retryText: { fontWeight: '700' },
});
