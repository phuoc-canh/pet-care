import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, Pill } from '@/components/ui';
import { colors, radius, spacing } from '@/theme/theme';

export interface QuickActionCardProps {
  tag: string;
  title: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  highlight?: boolean;
  children?: ReactNode;
}

/** Card lối tắt ("Hỏi AI về {tên}", "Lịch hẹn sắp tới"). */
function QuickActionCardBase({ tag, title, description, icon, onPress, highlight = false, children }: QuickActionCardProps) {
  return (
    <Card onPress={onPress} accessibilityLabel={title} style={highlight ? styles.highlight : undefined}>
      <View style={styles.row}>
        <View style={styles.text}>
          <Pill label={tag} tone={highlight ? 'white' : 'soft'} />
          <AppText variant="subtitle" tone={highlight ? 'inverse' : 'default'} style={styles.title}>
            {title}
          </AppText>
          {description ? (
            <AppText variant="body" tone={highlight ? 'inverse' : 'secondary'} style={highlight ? styles.descHighlight : undefined}>
              {description}
            </AppText>
          ) : null}
        </View>
        <View style={[styles.iconWrap, highlight && styles.iconWrapHighlight]}>
          <Ionicons name={icon} size={24} color={highlight ? colors.primary : colors.primary} />
        </View>
      </View>
      {children}
    </Card>
  );
}

export const QuickActionCard = memo(QuickActionCardBase);

const styles = StyleSheet.create({
  highlight: { backgroundColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: spacing.xs },
  title: { marginTop: spacing.xxs },
  descHighlight: { opacity: 0.9 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.button,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapHighlight: { backgroundColor: colors.surface },
});
