import { useNotificationStore } from '@/stores/notification-store';
import type { UseMutationResult } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

interface NotificationConfig {
  loadingMessage?: string;
  successTitle?: string;
  successMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  showSuccess?: boolean;
  showError?: boolean;
  showLoading?: boolean;
}

const defaultConfig: Required<NotificationConfig> = {
  loadingMessage: 'Processing...',
  successTitle: 'Success',
  successMessage: 'Operation completed successfully',
  errorTitle: 'Error',
  errorMessage: 'Operation failed',
  showSuccess: true,
  showError: true,
  showLoading: true,
};

export const useNotificationMutation = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
>(
  mutation: UseMutationResult<TData, TError, TVariables>,
  config: NotificationConfig = {},
) => {
  const finalConfig = { ...defaultConfig, ...config };
  const { addNotification, addLoadingState, removeLoadingState } =
    useNotificationStore();
  const loadingIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (mutation.isPending && finalConfig.showLoading) {
      // Add loading state
      if (!loadingIdRef.current) {
        loadingIdRef.current = addLoadingState({
          message: finalConfig.loadingMessage,
        });
      }
    } else {
      // Remove loading state
      if (loadingIdRef.current) {
        removeLoadingState(loadingIdRef.current);
        loadingIdRef.current = null;
      }
    }
  }, [
    mutation.isPending,
    finalConfig.showLoading,
    finalConfig.loadingMessage,
    addLoadingState,
    removeLoadingState,
  ]);

  useEffect(() => {
    if (mutation.isSuccess && finalConfig.showSuccess) {
      addNotification({
        type: 'success',
        title: finalConfig.successTitle,
        message: finalConfig.successMessage,
      });
    }
  }, [
    mutation.isSuccess,
    finalConfig.showSuccess,
    finalConfig.successTitle,
    finalConfig.successMessage,
    addNotification,
  ]);

  useEffect(() => {
    if (mutation.isError && finalConfig.showError) {
      const errorMessage =
        mutation.error instanceof Error
          ? mutation.error.message
          : finalConfig.errorMessage;

      addNotification({
        type: 'error',
        title: finalConfig.errorTitle,
        message: errorMessage,
        duration: 0, // Persistent for errors
      });
    }
  }, [
    mutation.isError,
    mutation.error,
    finalConfig.showError,
    finalConfig.errorTitle,
    finalConfig.errorMessage,
    addNotification,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingIdRef.current) {
        removeLoadingState(loadingIdRef.current);
      }
    };
  }, [removeLoadingState]);

  return mutation;
};

// Convenience hook for multiple mutations
export const useNotificationMutations = <
  T extends Record<string, UseMutationResult<unknown, unknown, unknown>>,
>(
  mutations: T,
  configs: { [K in keyof T]?: NotificationConfig } = {},
): T => {
  const mutationEntries = Object.entries(mutations) as Array<
    [keyof T, UseMutationResult<unknown, unknown, unknown>]
  >;

  const enhancedMutations = {} as T;

  for (const [key, mutation] of mutationEntries) {
    const config = configs[key] || {};
    enhancedMutations[key] = useNotificationMutation(
      mutation,
      config,
    ) as T[keyof T];
  }

  return enhancedMutations;
};
