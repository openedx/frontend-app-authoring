import { useMutation } from '@tanstack/react-query';

import { acceptLibraryBlockChanges, ignoreLibraryBlockChanges } from './api';

/**
 * Hook that provides a "mutation" that can be used to accept library block changes.
 */
// eslint-disable-next-line import/prefer-default-export
export const useAcceptLibraryBlockChanges = () => {
  return useMutation({
    mutationFn: acceptLibraryBlockChanges,
  });
};

/**
 * Hook that provides a "mutation" that can be used to ignore library block changes.
 */
// eslint-disable-next-line import/prefer-default-export
export const useIgnoreLibraryBlockChanges = () => {
  return useMutation({
    mutationFn: ignoreLibraryBlockChanges,
  });
};

