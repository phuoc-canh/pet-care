import { type ComponentRef, memo, type Ref, useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, layout, radius, spacing, typography } from '@/theme/theme';

import { AppText } from './AppText';

export interface TextFieldProps extends Omit<TextInputProps, 'ref'> {
  label: string;
  error?: string;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

function TextFieldBase({ label, error, onFocus, onBlur, style, ref, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <AppText variant="caption" tone="secondary" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        accessibilityHint={error}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, focused && styles.focused, error ? styles.invalid : null, style]}
        {...rest}
      />
      {error ? (
        <Animated.View entering={FadeIn.duration(160)}>
          <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
            {error}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

export const TextField = memo(TextFieldBase);

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    minHeight: layout.inputHeight,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.bodyStrong.fontSize,
  },
  focused: { borderColor: colors.primary },
  invalid: { borderColor: colors.danger },
});
