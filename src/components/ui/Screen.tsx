import { memo, type ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/theme';

export interface ScreenProps {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  background?: string;
}

/** Khung màn hình: safe area đúng trên iPhone tai thỏ & Android, nền theo theme. */
function ScreenBase({ children, edges = ['top'], style, background = colors.background }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: background }, style]}>
      {children}
    </SafeAreaView>
  );
}

export const Screen = memo(ScreenBase);

const styles = StyleSheet.create({
  root: { flex: 1 },
});
