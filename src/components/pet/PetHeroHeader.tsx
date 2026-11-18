import { LinearGradient } from 'expo-linear-gradient';
import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { strings } from '@/constants/strings';
import { colors, spacing } from '@/theme/theme';

export interface PetHeroHeaderProps {
  petName?: string;
  children?: ReactNode;
}

const GRADIENT_STOPS = [0, 0.7, 1] as const;

/** Header gradient: lời chào + tên thú cưng đang chọn (tô màu primary). */
function PetHeroHeaderBase({ petName, children }: PetHeroHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={colors.heroGradientToBg} locations={GRADIENT_STOPS} style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.text}>
        <AppText variant="body" tone="secondary" style={styles.greeting}>
          {strings.petHome.greeting}
        </AppText>
        <AppText variant="heading" tone="navy" accessibilityRole="header">
          {petName ? (
            <>
              {strings.petHome.howIs}
              <AppText variant="heading" tone="primary">
                {petName}
              </AppText>
              {strings.petHome.howIsSuffix}
            </>
          ) : (
            strings.appName
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
  greeting: { fontWeight: '600' },
});
