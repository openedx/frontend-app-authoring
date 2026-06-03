import { useQuery, useMutation } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform';
import {
  createCourseXblock,
  deleteUnitItem,
  duplicateUnitItem,
  editUnitDisplayName,
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

export const useCreateXBlockInUnit = () => useMutation({
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
    return camelCaseObject(data) as { locator: string; courseKey: string };
  },
});

const useUnitComponentMutation = <T>(
  mutationFn: (blockId: string) => Promise<T>,
) => useMutation({ mutationFn });

export const useDeleteUnitComponent = () => (
  useUnitComponentMutation(deleteUnitItem)
);

export const useDuplicateUnitComponent = (unitId: string) => (
  useUnitComponentMutation((blockId) => duplicateUnitItem(unitId, blockId))
);

export const useRenameUnitComponent = () => useMutation({
  mutationFn: ({ blockId, displayName }: { blockId: string; displayName: string }) => (
    editUnitDisplayName(blockId, displayName)
  ),
});
