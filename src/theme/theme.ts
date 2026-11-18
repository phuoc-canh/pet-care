import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  primary: '#1E6BFF',
  primaryPressed: '#1857D6',
  primarySoft: '#DCE8FB',
  navy: '#1B2554',
  background: '#F7F8FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  /** Chữ phụ trên nền trắng: #9AA0A6 chỉ dùng cho placeholder/disabled vì tương phản thấp. */
  textMuted: '#9AA0A6',
  /** Chữ phụ cần đọc được (tương phản ≥ 4.5:1 trên nền trắng). */
  textSecondary: '#5F6670',
  border: '#ECEEF2',
  success: '#22C55E',
  successSoft: '#DCFCE7',
  danger: '#EF4444',
  dangerPressed: '#C93636',
  dangerSoft: '#FDE2E2',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  overlay: 'rgba(15, 23, 42, 0.45)',
  white: '#FFFFFF',
  transparent: 'transparent',
  heroGradient: ['#D6E9F8', '#FFFFFF'] as const,
  /** Gradient hero kéo dài mượt xuống màu nền màn hình (tránh đường nối). */
  heroGradientToBg: ['#D6E9F8', '#FFFFFF', '#F7F8FA'] as const,
  skeleton: '#E9ECF1',
} as const;

/** Nền pastel cho avatar theo loài. */
export const speciesPastel = {
  dog: '#FFE8CC',
  cat: '#E8E2FF',
  rabbit: '#FFE1EC',
  hamster: '#FFF3C4',
} as const;

export const radius = {
  card: 28,
  button: 16,
  input: 14,
  sm: 10,
  pill: 999,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

type TypographyVariant = 'caption' | 'body' | 'bodyStrong' | 'subtitle' | 'title' | 'heading' | 'display';

export const typography: Record<TypographyVariant, TextStyle> = {
  caption: { fontSize: fontSize.xs, lineHeight: 16, fontWeight: '500' },
  body: { fontSize: fontSize.sm, lineHeight: 20, fontWeight: '400' },
  bodyStrong: { fontSize: fontSize.md, lineHeight: 22, fontWeight: '600' },
  subtitle: { fontSize: fontSize.lg, lineHeight: 24, fontWeight: '600' },
  title: { fontSize: fontSize.xl, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: fontSize.xxl, lineHeight: 34, fontWeight: '800' },
  display: { fontSize: 40, lineHeight: 46, fontWeight: '800' },
};

export const shadow: Record<'card' | 'soft' | 'float', ViewStyle> = {
  card: Platform.select<ViewStyle>({
    ios: { shadowColor: '#1B2554', shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
    default: { elevation: 3, shadowColor: '#1B2554' },
  }),
  soft: Platform.select<ViewStyle>({
    ios: { shadowColor: '#1B2554', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
    default: { elevation: 1, shadowColor: '#1B2554' },
  }),
  float: Platform.select<ViewStyle>({
    ios: { shadowColor: '#1E6BFF', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
    default: { elevation: 6, shadowColor: '#1E6BFF' },
  }),
};

export const layout = {
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  minTouch: 44,
  buttonHeight: 52,
  inputHeight: 52,
  tabBarHeight: 60,
} as const;

export const motion = {
  pressScale: 0.97,
  spring: { damping: 18, stiffness: 260, mass: 0.6 },
  fast: 160,
  normal: 240,
} as const;

export const theme = { colors, radius, spacing, fontSize, typography, shadow, layout, motion, speciesPastel } as const;
export type Theme = typeof theme;
