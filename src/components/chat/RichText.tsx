import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/ui';
import { spacing } from '@/theme/theme';

/**
 * Markdown tối giản cho câu trả lời AI: **in đậm**, gạch đầu dòng "- " / "* " / "• ", số "1. ".
 * Không dùng thư viện markdown để giữ bundle nhỏ và render nhanh khi đang stream.
 */

type Tone = 'default' | 'inverse';

interface Line {
  kind: 'bullet' | 'number' | 'text' | 'gap';
  marker?: string;
  text: string;
}

function parseLines(content: string): Line[] {
  return content.split('\n').map((raw) => {
    const line = raw.trimEnd();
    if (!line.trim()) return { kind: 'gap', text: '' };
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    if (bullet) return { kind: 'bullet', text: bullet[1] ?? '' };
    const num = /^\s*(\d+)[.)]\s+(.*)$/.exec(line);
    if (num) return { kind: 'number', marker: `${num[1]}.`, text: num[2] ?? '' };
    return { kind: 'text', text: line.replace(/^#+\s*/, '') };
  });
}

function Inline({ text, tone }: { text: string; tone: Tone }) {
  // Tách theo **...**; phần lẻ là chữ đậm. Dấu ** chưa đóng (đang stream) hiển thị như chữ thường.
  const parts = text.split('**');
  const closed = parts.length % 2 === 1;
  return (
    <>
      {parts.map((part, i) => {
        const bold = i % 2 === 1 && (closed || i < parts.length - 1);
        return (
          <Text key={i} style={bold ? (tone === 'inverse' ? styles.boldInverse : styles.bold) : undefined}>
            {!bold && i % 2 === 1 ? `**${part}` : part}
          </Text>
        );
      })}
    </>
  );
}

function RichTextBase({ content, tone = 'default' }: { content: string; tone?: Tone }) {
  const lines = useMemo(() => parseLines(content), [content]);
  return (
    <View style={styles.container}>
      {lines.map((line, i) => {
        if (line.kind === 'gap') return i > 0 && i < lines.length - 1 ? <View key={i} style={styles.gap} /> : null;
        if (line.kind === 'text') {
          return (
            <AppText key={i} variant="body" tone={tone} style={styles.text} selectable>
              <Inline text={line.text} tone={tone} />
            </AppText>
          );
        }
        return (
          <View key={i} style={styles.listRow}>
            <AppText variant="body" tone={tone} style={[styles.text, styles.marker]}>
              {line.kind === 'bullet' ? '•' : line.marker}
            </AppText>
            <AppText variant="body" tone={tone} style={[styles.text, styles.listText]} selectable>
              <Inline text={line.text} tone={tone} />
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

export const RichText = memo(RichTextBase);

const styles = StyleSheet.create({
  container: { gap: 2 },
  text: { fontSize: 15, lineHeight: 22 },
  bold: { fontWeight: '700' },
  boldInverse: { fontWeight: '700' },
  gap: { height: spacing.xs },
  listRow: { flexDirection: 'row', gap: spacing.xs, paddingRight: spacing.xs },
  marker: { minWidth: 14 },
  listText: { flex: 1 },
});
