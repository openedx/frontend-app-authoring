import { useMutation } from '@tanstack/react-query';
import { DefaultError } from '@tanstack/query-core';
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
>(...args: Parameters<typeof useMutation<TData, TError, TVariables, TOnMutateResult>>) => {
  const { showToast, closeToast } = useToastContext();
  const originalOptions = args[0] || {};
  return useMutation({
    ...originalOptions,
    onMutate: async (...onMutateArgs) => {
      // Show processing notification
      showToast(NOTIFICATION_MESSAGES.saving, undefined, 15000);

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
