/**
 * React Query mutation-key factory for course-outline mutations.
 * Shared between apiHooks and outlineStatusHooks to break the
 * import cycle (apiHooks ← outlineStatusHooks ← apiHooks).
 */
export const courseOutlineMutationKeys = {
  all: ['courseOutline', 'mutations'],
  saving: (courseId?: string) => [...courseOutlineMutationKeys.all, courseId, 'saving'],
  savingOperation: (
    courseId: string | undefined,
    operation: string,
  ) => [...courseOutlineMutationKeys.saving(courseId), operation],
  reindex: (courseId?: string) => [...courseOutlineMutationKeys.all, courseId, 'reindex'],
};
