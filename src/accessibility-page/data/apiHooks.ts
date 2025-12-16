import { useMutation } from '@tanstack/react-query';
import { AccessibilityFormData, postAccessibilityForm } from './api';

/**
 * Mutation to submit accessibility form
 */
export const useSubmitAccessibilityForm = (handleSuccess: (e: any) => void) => (
  useMutation({
    mutationFn: (formData: AccessibilityFormData) => postAccessibilityForm(formData),
    onSuccess: handleSuccess,
  })
);
