import { memo, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';

import type { TextStore } from '@/hooks/useChatStream';
import { colors, shadow, spacing } from '@/theme/theme';

import { RichText } from './RichText';
import { TypingIndicator } from './TypingIndicator';

/**
 * Bubble của câu trả lời đang stream. Là component DUY NHẤT subscribe text store,
 * nên mỗi frame chỉ nó re-render — danh sách tin cũ và input không bị ảnh hưởng.
 */
function StreamingBubbleBase({ store }: { store: TextStore }) {
  const text = useSyncExternalStore(store.subscribe, store.get, store.get);
  if (!text) return <TypingIndicator />;
  return (
    <View style={styles.row}>
      <View style={styles.bubble} accessibilityLiveRegion="polite">
        <RichText content={text} />
      </View>
    </View>
  );
}

export const StreamingBubble = memo(StreamingBubbleBase);

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, paddingVertical: spacing.xxs, alignItems: 'flex-start' },
  bubble: {
    maxWidth: '86%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
});
