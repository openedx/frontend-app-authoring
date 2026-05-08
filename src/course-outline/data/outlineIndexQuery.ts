import { RequestStatus } from '@src/data/constants';
import { skipToken, useQuery } from '@tanstack/react-query';

import { getCourseOutlineIndex } from './api';
import type { CourseOutline } from './types';
import { getErrorDetails } from '../utils/getErrorDetails';

export const courseOutlineIndexQueryKey = (courseId?: string) => ['courseOutline', courseId, 'index'];

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
) => useQuery<CourseOutline>({
  queryKey: courseOutlineIndexQueryKey(courseId),
  queryFn: enabled && courseId ? () => getCourseOutlineIndex(courseId) : skipToken,
  initialData,
  refetchOnMount,
  retry: false,
});

type CourseOutlineIndexRequestStateArgs = {
  isPending: boolean;
  isSuccess: boolean;
  error: unknown;
};

export const getCourseOutlineIndexRequestState = ({
  isPending,
  isSuccess,
  error,
}: CourseOutlineIndexRequestStateArgs) => {
  const requestError = error as any;

  if (isPending) {
    return {
      status: RequestStatus.IN_PROGRESS,
      errors: null,
    };
  }

  if (requestError?.response?.status === 403) {
    return {
      status: RequestStatus.DENIED,
      errors: null,
    };
  }

  if (requestError) {
    return {
      status: RequestStatus.FAILED,
      errors: getErrorDetails(requestError, false),
    };
  }

  if (isSuccess) {
    return {
      status: RequestStatus.SUCCESSFUL,
      errors: null,
    };
  }

  return {
    status: RequestStatus.IN_PROGRESS,
    errors: null,
  };
};

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
