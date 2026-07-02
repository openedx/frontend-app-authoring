import { getCourseKey } from '@src/generic/key-utils';

/**
 * Single source of truth for all course-outline React Query keys.
 * Use `courseOutlineQueryKeys.index(courseId)` for the outline-tree index key,
 * and `courseOutlineQueryKeys.mutations.savingOperation(courseId, op)` / .saving / .reindex
 * for mutation-tracking keys. All other query data keys are
 * directly on the top-level object.
 */
export const courseOutlineQueryKeys = {
  all: ['courseOutline'] as const,

  course: (courseId?: string) => [...courseOutlineQueryKeys.all, courseId] as const,

  courseItemId: (itemId?: string) =>
    [
      ...courseOutlineQueryKeys.course(itemId ? getCourseKey(itemId) : undefined),
      itemId,
    ] as const,

  scrollToCourseItemId: (courseId?: string) =>
    [
      ...courseOutlineQueryKeys.course(courseId),
      'scroll',
    ] as const,

  pasteFileNotices: (courseId?: string) =>
    [
      ...courseOutlineQueryKeys.course(courseId),
      'pasteFileNotices',
    ] as const,

  courseDetails: (courseId?: string) =>
    [
      ...courseOutlineQueryKeys.course(courseId),
      'details',
    ] as const,

  courseBestPractices: (courseId?: string) =>
    [
      ...courseOutlineQueryKeys.course(courseId),
      'bestPractices',
    ] as const,

  courseLaunch: (courseId?: string) =>
    [
      ...courseOutlineQueryKeys.course(courseId),
      'launch',
    ] as const,

  legacyLibReadyToMigrateBlocks: (courseId: string) =>
    [
      ...courseOutlineQueryKeys.course(courseId),
      'legacyLibReadyToMigrateBlocks',
    ] as const,

  legacyLibReadyToMigrateBlocksStatus: (courseId: string, taskId?: string) =>
    [
      ...courseOutlineQueryKeys.legacyLibReadyToMigrateBlocks(courseId),
      'status',
      { taskId },
    ] as const,

  index: (courseId?: string) => ['courseOutline', courseId, 'index'] as const,

  mutations: {
    all: ['courseOutline', 'mutations'] as const,

    saving: (courseId?: string) => [...courseOutlineQueryKeys.mutations.all, courseId, 'saving'] as const,

    savingOperation: (courseId: string | undefined, operation: string) =>
      [...courseOutlineQueryKeys.mutations.saving(courseId), operation] as const,

    reindex: (courseId?: string) => [...courseOutlineQueryKeys.mutations.all, courseId, 'reindex'] as const,
  } as const,
};
