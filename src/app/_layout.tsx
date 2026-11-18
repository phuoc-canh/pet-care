import { QueryClientProvider } from '@tanstack/react-query';
import { type ErrorBoundaryProps, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/ui';
import { strings } from '@/constants/strings';
import { useAppState } from '@/hooks/useAppState';
import { queryClient } from '@/libs/queryClient';
import { useAppStore, useAppStoreHydrated } from '@/store/app.store';
import { colors } from '@/theme/theme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** ErrorBoundary ở root: bắt mọi lỗi render, không bao giờ để trắng màn hình. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorRoot}>
      <ErrorState message={strings.error.boundary} onRetry={() => void retry()} />
    </View>
  );
}

function RootNavigator() {
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: styles.content }}>
      <Stack.Protected guard={onboardingDone}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pet/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="pet/new" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!onboardingDone}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const hydrated = useAppStoreHydrated();
  useAppState();

  useEffect(() => {
    if (hydrated) void SplashScreen.hideAsync().catch(() => undefined);
  }, [hydrated]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          {hydrated ? <RootNavigator /> : <View style={styles.root} />}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { backgroundColor: colors.background },
  errorRoot: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
});
