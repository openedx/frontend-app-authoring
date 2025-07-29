import { useMutation } from '@tanstack/react-query';
import { createCourseXblock } from '@src/course-unit/data/api';

export const courseOutlineQueryKeys = {
  all: ['courseOutline'],
  /**
   * Base key for data specific to a course in outline
   */
  contentLibrary: (courseId?: string) => [...courseOutlineQueryKeys.all, courseId],
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
    callback?.(data.locator, data.parent_locator);
  },
});
