import { LinearGradient } from 'expo-linear-gradient';
import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, IconButton } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/theme/theme';

export interface PetHeroHeaderProps {
  petName?: string;
  onLanguagePress?: () => void;
  children?: ReactNode;
}

const GRADIENT_STOPS = [0, 0.7, 1] as const;

/** Header gradient: lời chào + tên thú cưng đang chọn (tô màu primary). */
function PetHeroHeaderBase({ petName, onLanguagePress, children }: PetHeroHeaderProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={colors.heroGradientToBg} locations={GRADIENT_STOPS} style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.text}>
        <View style={styles.topRow}>
          <AppText variant="body" tone="secondary" style={styles.greeting}>
            {t('pet.home.greeting')}
          </AppText>
          {onLanguagePress ? (
            <IconButton icon="globe-outline" onPress={onLanguagePress} accessibilityLabel={t('language.change')} />
          ) : null}
        </View>
        <AppText variant="heading" tone="navy" accessibilityRole="header">
          {petName ? (
            <>
              {t('pet.home.howIsBefore')}
              <AppText variant="heading" tone="primary">
                {petName}
              </AppText>
              {t('pet.home.howIsAfter')}
            </>
          ) : (
            t('common.appName')
          )}
        </AppText>
      </View>
      {children}
    </LinearGradient>
  );
}

export const PetHeroHeader = memo(PetHeroHeaderBase);

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.lg, gap: spacing.lg },
  text: { paddingHorizontal: spacing.lg, gap: spacing.xxs },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  greeting: { fontWeight: '600' },
});
