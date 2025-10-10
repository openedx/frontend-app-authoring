import { useMutation, useQuery } from '@tanstack/react-query';
import { createCourseXblock } from '@src/course-unit/data/api';
import { getCourseItem } from './api';

export const courseOutlineQueryKeys = {
  all: ['courseOutline'],
  /**
   * Base key for data specific to a course in outline
   */
  contentLibrary: (courseId?: string) => [...courseOutlineQueryKeys.all, courseId],
  courseItemId: (itemId?: string) => [...courseOutlineQueryKeys.all, itemId],

};

/**
 * Hook to create an XBLOCK in a course .
 * The `locator` is the ID of the parent block where this new XBLOCK should be created.
 * Can also be used to import block from library by passing `libraryContentKey` in request body
 */
export const useCreateCourseBlock = (
  callback?: ((locator?: string, parentLocator?: string) => void),
) => useMutation({
  mutationFn: createCourseXblock,
  onSettled: async (data) => {
    callback?.(data?.locator, data.parent_locator);
  },
});

export const useCourseItemData = (itemId?: string, enabled: boolean = true) => (
  useQuery({
    queryKey: courseOutlineQueryKeys.courseItemId(itemId),
    queryFn: () => getCourseItem(itemId!),
    enabled: enabled && itemId !== undefined,
  })
);
