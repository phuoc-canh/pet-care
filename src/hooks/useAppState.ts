import { focusManager } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';

/**
 * Nối AppState với focusManager của TanStack Query:
 * quay lại app (background → active) thì các query đã stale được refetch nhẹ.
 * Có thể truyền callback riêng (vd. màn chat hủy stream khi app vào background).
 */
export function useAppState(onChange?: (status: AppStateStatus) => void) {
  const callbackRef = useRef(onChange);
  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
      callbackRef.current?.(status);
    });
    return () => sub.remove();
  }, []);
}
