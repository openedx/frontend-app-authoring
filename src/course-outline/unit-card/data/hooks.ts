import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform';
import {
  createCourseXblock,
  deleteUnitItem,
  duplicateUnitItem,
} from '@src/course-unit/data/api';
import { getUnitHandler, getComponentTemplates } from './api';

const unitHandlerQueryKey = (unitId: string) => ['unitHandler', unitId] as const;

export const useUnitHandler = (unitId: string, enabled: boolean = false) => useQuery({
  queryKey: unitHandlerQueryKey(unitId),
  queryFn: () => getUnitHandler(unitId),
  enabled: enabled && !!unitId,
});

// Hook to fetch component templates via the existing container_handler endpoint.
// Templates are course-level (identical for every unit in a course), so we key
// by courseId and use a long staleTime to avoid re-fetching on every unit expand.
export const useComponentTemplates = (
  unitId: string,
  courseId: string,
  enabled: boolean = false,
) => useQuery({
  queryKey: ['componentTemplates', courseId],
  queryFn: () => getComponentTemplates(unitId),
  enabled: enabled && !!unitId && !!courseId,
  staleTime: 5 * 60 * 1000, // 5 minutes — templates rarely change within a session
});

// Hook to create a new xblock component inside a unit, reusing the course-unit API
export const useCreateXBlockInUnit = (unitId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    // Wrap createCourseXblock to normalize the response with camelCase keys
    mutationFn: async (params: {
      parentLocator: string;
      type: string;
      category?: string;
      boilerplate?: string;
    }) => {
      const data = await createCourseXblock({
        type: params.type,
        category: params.category,
        parentLocator: params.parentLocator,
        boilerplate: params.boilerplate,
      });
      // Normalize snake_case response (locator, course_key) to camelCase
      return camelCaseObject(data) as { locator: string; courseKey: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitHandlerQueryKey(unitId) });
    },
  });
};

const useUnitComponentMutation = <T>(
  unitId: string,
  mutationFn: (blockId: string) => Promise<T>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitHandlerQueryKey(unitId) });
    },
  });
};

export const useDeleteUnitComponent = (unitId: string) => (
  useUnitComponentMutation(unitId, deleteUnitItem)
);

export const useDuplicateUnitComponent = (unitId: string) => (
  useUnitComponentMutation(unitId, (blockId) => duplicateUnitItem(unitId, blockId))
);
