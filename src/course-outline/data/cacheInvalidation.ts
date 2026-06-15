import { QueryClient } from '@tanstack/react-query';
import { courseOutlineQueryKeys } from './queryKeys';
import { ParentIds } from '@src/generic/types';

/**
 * Invalidate parent Subsection and Section data.
 *
 * This function ensures that cached data for parent subsection and section is invalidated
 * when child items are created, updated, or deleted.
 *
 * Priority:
 * 1. If sectionId exists, invalidate section data which also updates all children block data
 * 2. Else If subsectionId exists, invalidate subsection data
 *
 * Callers are responsible for catching errors (they already do via .catch).
 */
export const invalidateParentQueries = async (queryClient: QueryClient, variables: ParentIds) => {
  if (variables.sectionId) {
    await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.sectionId) });
  } else if (variables.subsectionId) {
    // istanbul ignore next: subsection-only branch, hard to isolate in tests
    await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.subsectionId) });
  }
};

/** Fire-and-forget invalidateParentQueries — errors are best-effort. */
const safeInvalidateParentQueries = (queryClient: QueryClient, variables: ParentIds) => {
  invalidateParentQueries(queryClient, variables).catch(() => {});
};

/**
 * Shared cache invalidation — called by most mutation hooks.
 * Invalidates parent queries + course details in one step.
 */
export const invalidateOutlineAndParents = (
  queryClient: QueryClient,
  variables: ParentIds,
  courseKey: string,
) => {
  safeInvalidateParentQueries(queryClient, variables);
  queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(courseKey) });
};
