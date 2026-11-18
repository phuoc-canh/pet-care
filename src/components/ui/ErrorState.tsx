import { memo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useTranslation } from 'react-i18next';

import { EmptyState } from './EmptyState';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

function ErrorStateBase({ message, onRetry, style }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      emoji="😿"
      title={t('errors.title')}
      description={message ?? t('errors.generic')}
      actionLabel={onRetry ? t('common.retry') : undefined}
      onAction={onRetry}
      style={[styles.container, style]}
    />
  );
}

export const ErrorState = memo(ErrorStateBase);

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center' },
});
