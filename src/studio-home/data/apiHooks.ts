import { useQuery } from '@tanstack/react-query';
import { getStudioHomeLibraries, getStudioHomeCoursesV2, type StudioHomeCoursesV2Response } from './api';

export interface StudioHomeCoursesV2Params {
  page?: number;
  pageSize?: number;
  search?: string;
  order?: string;
  startDateOnOrAfter?: string;
  startDateOnOrBefore?: string;
}

export const studioHomeQueryKeys = {
  all: ['studioHome'],
  /**
   * Base key for list of v1/legacy libraries
   */
  librariesV1: () => [...studioHomeQueryKeys.all, 'librariesV1'],
  /**
   * Key for a page of v2 courses, filtered/paginated/sorted by params
   */
  coursesV2: (params: StudioHomeCoursesV2Params) => [...studioHomeQueryKeys.all, 'coursesV2', params],
};

export const useLibrariesV1Data = (enabled: boolean = true) => (
  useQuery({
    queryKey: studioHomeQueryKeys.librariesV1(),
    queryFn: getStudioHomeLibraries,
    enabled,
  })
);

/**
 * Fetch a page of courses from the v2 (paginated/filterable) courses API.
 */
export const useStudioHomeCoursesV2 = (
  params: StudioHomeCoursesV2Params,
  options?: { enabled?: boolean; },
) => (
  useQuery({
    queryKey: studioHomeQueryKeys.coursesV2(params),
    queryFn: () => getStudioHomeCoursesV2('', params) as Promise<StudioHomeCoursesV2Response>,
    enabled: options?.enabled ?? true,
  })
);
