import { QueryClient } from '@tanstack/react-query';

import { AppError } from '@/libs/http';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dữ liệu hồ sơ/lịch hẹn ít thay đổi → 30s là đủ "tươi", tránh refetch thừa khi chuyển tab.
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (error instanceof AppError && (error.code === 'NOT_FOUND' || error.code === 'UNAUTHORIZED')) return false;
        return failureCount < 1;
      },
      refetchOnReconnect: true,
      // RN không có window focus — focusManager được nối với AppState trong useAppState.
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
