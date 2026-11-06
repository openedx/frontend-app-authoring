import { useMutation, DefaultError } from '@tanstack/react-query';
import { useToastContext } from '@src/generic/toast-context';
import { NOTIFICATION_MESSAGES } from '@src/constants';

/**
 * Wraps useMutation to add a processing notification when the mutation is initiated and removes it
 * when the mutation is settled.
 */
export const useMutationWithProcessingNotification = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options?: Parameters<typeof useMutation<TData, TError, TVariables, TOnMutateResult>>[0],
  { notificationMessage = NOTIFICATION_MESSAGES.saving }: { notificationMessage?: string; } = {},
) => {
  const { showToast, closeToast } = useToastContext();
  const originalOptions = options || {};
  return useMutation({
    ...originalOptions,
    onMutate: async (...onMutateArgs) => {
      // Show processing notification
      showToast(notificationMessage, undefined, 15000);

      // Call original onMutate if it exists
      return originalOptions.onMutate?.(...onMutateArgs);
    },
    onSettled: async (...onSettledArgs) => {
      // Call original onSettled if it exists
      await originalOptions.onSettled?.(...onSettledArgs);

      // Always hide processing notification
      closeToast();
    },
  });
};
