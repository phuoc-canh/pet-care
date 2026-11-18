import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { PressableScale } from '@/components/ui';
import { strings } from '@/constants/strings';
import { colors, layout, radius, spacing } from '@/theme/theme';

const LINE_HEIGHT = 20;
const MAX_LINES = 4;
const V_PADDING = 10;
const MAX_INPUT_HEIGHT = LINE_HEIGHT * MAX_LINES + V_PADDING * 2;

export interface ChatInputProps {
  placeholder: string;
  isStreaming: boolean;
  disabled?: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

/**
 * Ô nhập tự giãn tối đa 4 dòng. State text nằm cục bộ ở đây → gõ phím không làm
 * re-render danh sách chat. Khi đang stream, nút gửi biến thành nút "Dừng".
 */
function ChatInputBase({ placeholder, isStreaming, disabled = false, onSend, onStop }: ChatInputProps) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 && !disabled && !isStreaming;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(text);
    setText('');
  }, [canSend, onSend, text]);

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
          editable={!disabled}
          style={styles.input}
          accessibilityLabel={placeholder}
          textAlignVertical="center"
          submitBehavior="newline"
        />
      </View>
      {isStreaming ? (
        <Animated.View entering={ZoomIn.duration(160)}>
          <PressableScale
            onPress={onStop}
            accessibilityRole="button"
            accessibilityLabel={strings.chat.stop}
            hitSlop={layout.hitSlop}
            style={[styles.button, styles.stop]}
          >
            <Ionicons name="stop" size={18} color={colors.white} />
          </PressableScale>
        </Animated.View>
      ) : (
        <PressableScale
          onPress={handleSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={strings.chat.send}
          accessibilityState={{ disabled: !canSend }}
          hitSlop={layout.hitSlop}
          style={[styles.button, canSend ? styles.send : styles.sendDisabled]}
        >
          <Ionicons name="arrow-up" size={22} color={colors.white} />
        </PressableScale>
      )}
    </View>
  );
}

export const ChatInput = memo(ChatInputBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  field: {
    flex: 1,
    minHeight: layout.minTouch + 4,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.input + 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: {
    maxHeight: MAX_INPUT_HEIGHT,
    fontSize: 15,
    lineHeight: LINE_HEIGHT,
    color: colors.text,
    paddingTop: Platform.OS === 'ios' ? V_PADDING : V_PADDING - 2,
    paddingBottom: Platform.OS === 'ios' ? V_PADDING : V_PADDING - 2,
  },
  button: {
    width: layout.minTouch + 4,
    height: layout.minTouch + 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  send: { backgroundColor: colors.primary },
  sendDisabled: { backgroundColor: '#B9CCF2' },
  stop: { backgroundColor: colors.navy },
});
