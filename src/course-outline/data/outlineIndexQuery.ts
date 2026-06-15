import { skipToken, useQuery } from '@tanstack/react-query';

import { getCourseOutlineIndex } from './api';
import type { CourseOutline } from './types';
import { courseOutlineQueryKeys } from './queryKeys';

type UseCourseOutlineIndexOptions = {
  enabled?: boolean;
  initialData?: CourseOutline;
  refetchOnMount?: boolean;
};

export const useCourseOutlineIndex = (
  courseId?: string,
  {
    enabled = true,
    initialData,
    refetchOnMount = true,
  }: UseCourseOutlineIndexOptions = {},
) =>
  useQuery<CourseOutline>({
    queryKey: courseOutlineQueryKeys.index(courseId),
    queryFn: enabled && courseId ? () => getCourseOutlineIndex(courseId) : skipToken,
    initialData,
    refetchOnMount,
    retry: false,
  });

export const getCourseOutlineStatusBarData = (outlineIndex: CourseOutline) => {
  const {
    courseReleaseDate,
    courseStructure: {
      end,
      hasChanges,
      highlightsEnabledForMessaging,
      videoSharingEnabled,
      videoSharingOptions,
    },
  } = outlineIndex;

  return {
    courseReleaseDate,
    highlightsEnabledForMessaging,
    videoSharingOptions,
    videoSharingEnabled,
    endDate: end,
    hasChanges,
  };
};
