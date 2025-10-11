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
  container: (usageKey: string, getUpstreamInfo: boolean) => {
    const courseKey = getCourseKey(usageKey);
    return [...containerComparisonQueryKeys.course(courseKey), usageKey, getUpstreamInfo.toString()];
  },
};

export const useCourseContainerChildren = (usageKey?: string, getUpstreamInfo?: boolean) => (
  useQuery({
    enabled: !!usageKey,
    queryFn: () => getCourseContainerChildren(usageKey!, getUpstreamInfo),
    queryKey: containerComparisonQueryKeys.container(usageKey!, getUpstreamInfo || false),
  })
);
