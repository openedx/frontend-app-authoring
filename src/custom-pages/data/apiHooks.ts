import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCustomPages,
  deleteCustomPage,
  addCustomPage,
  updateCustomPage,
  updateCustomPageOrder,
} from './api';

export interface CustomPage {
  id: string;
  name?: string;
  courseStaffOnly?: boolean;
  tabId?: string;
  [key: string]: unknown;
}

export const customPagesQueryKeys = {
  all: ['customPages'] as const,
  list: (courseId: string) => [...customPagesQueryKeys.all, courseId] as const,
};

/**
 * Fetch custom pages for a course.
 */
export const useCustomPages = (courseId: string) =>
  useQuery({
    queryKey: customPagesQueryKeys.list(courseId),
    queryFn: () => getCustomPages(courseId),
  });

/**
 * Delete a custom page by blockId.
 * Invalidates list query on success.
 */
export const useDeleteCustomPage = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) => deleteCustomPage(blockId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customPagesQueryKeys.list(courseId) }),
  });
};

/**
 * Add a new custom page.
 * Invalidates list query on success.
 */
export const useAddCustomPage = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => addCustomPage(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customPagesQueryKeys.list(courseId) }),
  });
};

/**
 * Reorder custom pages.
 * Accepts pages array, maps to tab_locator format, and POSTs reorder.
 * Invalidates list query on settled (including error, to roll back optimistic reorder).
 */
export const useReorderCustomPages = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pages: CustomPage[]) => {
      const tabs = pages.map(page => ({ tab_locator: page.id }));
      return updateCustomPageOrder(courseId, tabs);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: customPagesQueryKeys.list(courseId) }),
  });
};

/**
 * Update custom page visibility (courseStaffOnly).
 * Invalidates list query on success.
 */
export const useUpdateCustomPageVisibility = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blockId, metadata }: { blockId: string; metadata: Record<string, unknown>; }) =>
      updateCustomPage({ blockId, metadata }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customPagesQueryKeys.list(courseId) }),
  });
};

/**
 * Update custom page name — cache-only (no API call).
 * EditorPage save already persists to /xblock/{blockId}; this hook only mirrors
 * returned display_name into the custom-pages list cache.
 */
export const useUpdateCustomPageName = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ blockId, displayName }: { blockId: string; displayName: string; }) => {
      queryClient.setQueryData<CustomPage[]>(customPagesQueryKeys.list(courseId), (old) => {
        if (!old) { return old; }
        return old.map(page => (page.id === blockId ? { ...page, name: displayName } : page));
      });
    },
  });
};
