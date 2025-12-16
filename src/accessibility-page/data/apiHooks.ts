import { useMutation } from '@tanstack/react-query';
import { AccessibilityFormData, postAccessibilityForm } from './api';

/**
 * Mutation to sumbmit accessibility form
 */
export const useSummitAccessibilityForm = (handleSuccess: (e: any) => void) => (
  useMutation({
    mutationFn: (formData: AccessibilityFormData) => postAccessibilityForm(formData),
    onSuccess: handleSuccess,
  })
);
