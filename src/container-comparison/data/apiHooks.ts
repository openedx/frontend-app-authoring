import { useQuery } from '@tanstack/react-query';
import { getCourseContainerChildren } from '@src/course-unit/data/api';
import { getCourseKey } from '@src/generic/key-utils';

export const containerComparisonQueryKeys = {
  all: ['containerComparison'],
  /**
   * Base key for a course
   */
  course: (courseKey: string) => [...containerComparisonQueryKeys.all, courseKey],
  /**
   * Key for a single container
   */
  container: (getUpstreamInfo: boolean, usageKey?: string) => {
    if (usageKey === undefined) {
      return [undefined, undefined, getUpstreamInfo.toString()];
    }
    const courseKey = getCourseKey(usageKey);
    return [...containerComparisonQueryKeys.course(courseKey), usageKey, getUpstreamInfo.toString()];
  },
};

export const useCourseContainerChildren = (usageKey?: string, getUpstreamInfo?: boolean) => (
  useQuery({
    enabled: !!usageKey,
    queryFn: () => getCourseContainerChildren(usageKey!, getUpstreamInfo),
    // If we first get data with a valid `usageKey` and then the `usageKey` changes to undefined, an error occurs.
    queryKey: containerComparisonQueryKeys.container(getUpstreamInfo || false, usageKey),
  })
);
