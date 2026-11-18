import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import { type ColorValue, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { strings } from '@/constants/strings';
import { haptic } from '@/hooks/useHaptic';
import { colors, layout, spacing, typography } from '@/theme/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : inactive} color={typeof color === 'string' ? color : colors.textSecondary} size={size} />;
  };
}

const screenListeners = { tabPress: () => haptic.selection() };

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const barStyle = {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: layout.tabBarHeight + insets.bottom,
    paddingTop: spacing.xxs,
    paddingBottom: insets.bottom + spacing.xxs,
  };
  return (
    <Tabs
      screenListeners={screenListeners}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: barStyle,
        sceneStyle: styles.scene,
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: strings.tabs.pets, tabBarIcon: tabIcon('paw', 'paw-outline'), tabBarAccessibilityLabel: strings.tabs.pets }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: strings.tabs.chat,
          tabBarIcon: tabIcon('chatbubble-ellipses', 'chatbubble-ellipses-outline'),
          tabBarAccessibilityLabel: strings.tabs.chat,
        }}
      />
      <Tabs.Screen
        name="appointment"
        options={{
          title: strings.tabs.appointment,
          tabBarIcon: tabIcon('calendar', 'calendar-outline'),
          tabBarAccessibilityLabel: strings.tabs.appointment,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: typography.caption.fontSize, lineHeight: typography.caption.lineHeight, fontWeight: '600' },
  scene: { backgroundColor: colors.background },
});
