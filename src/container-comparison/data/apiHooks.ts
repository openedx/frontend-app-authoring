import { useQuery } from '@tanstack/react-query';
import { getCourseContainerChildren } from '../../course-unit/data/api';
import { getCourseKey } from '../../generic/key-utils';

export const containerComparisonQueryKeys = {
  all: ['containerComparison'],
  /**
   * Base key for a course
   */
  course: (courseKey: string) => [...containerComparisonQueryKeys.all, courseKey],
  /**
   * Key for a single container
   */
  container: (usageKey: string) => {
    const courseKey = getCourseKey(usageKey);
    return [...containerComparisonQueryKeys.course(courseKey), usageKey];
  },
};

export const useCourseContainerChildren = (usageKey?: string) => (
  useQuery({
    enabled: !!usageKey,
    queryFn: () => getCourseContainerChildren(usageKey!),
    queryKey: containerComparisonQueryKeys.container(usageKey!),
  })
);
