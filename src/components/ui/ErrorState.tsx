import { memo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { strings } from '@/constants/strings';

import { EmptyState } from './EmptyState';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

function ErrorStateBase({ message, onRetry, style }: ErrorStateProps) {
  return (
    <EmptyState
      emoji="😿"
      title={strings.error.title}
      description={message ?? strings.error.generic}
      actionLabel={onRetry ? strings.common.retry : undefined}
      onAction={onRetry}
      style={[styles.container, style]}
    />
  );
}

export const ErrorState = memo(ErrorStateBase);

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center' },
});
