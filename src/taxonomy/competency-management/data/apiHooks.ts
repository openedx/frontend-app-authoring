import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useUserPermissions } from '@src/authz/data/apiHooks';
import { COURSE_PERMISSIONS } from '@src/authz/constants';
import { useWaffleFlags } from '@src/data/apiHooks';
import type { PermissionValidationQuery } from '@src/authz/types';

import * as api from './api';
import type { CreateCompetencyCriterionPayload, CreateCompetencyCriterionResponse } from './types';

/**
 * Query key factory for competency-management data, following the same
 * `all -> one entity -> its sub-resources` shape as `taxonomyQueryKeys`
 * (`src/taxonomy/data/apiHooks.ts`), so invalidating `competency(tagId)`
 * would clear every query scoped to one competency at once.
 */
export const competencyQueryKeys = {
  all: ['competencyManagement'],
  /** Base key for data specific to one competency (tag). No data is stored directly in this key.
   * @param tagId ID of the competency (tag)
   */
  competency: (tagId: number) => [...competencyQueryKeys.all, 'competency', tagId],
  competencyCriteriaGroups: (tagId: number) => [
    ...competencyQueryKeys.competency(tagId),
    'criteriaGroups',
  ],
  /** The studio-wide default rule profile. */
  defaultRuleProfile: () => [...competencyQueryKeys.all, 'defaultRuleProfile'],
} satisfies Record<
  string,
  Array<string | number | undefined> | ((...args: any[]) => Array<string | number | undefined>)
>;

export const useCompetencyCriteriaGroups = (tagId: number) => (
  useQuery({
    queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId),
    queryFn: () => api.getCompetencyCriteriaGroups(tagId),
  })
);

export const useDefaultCompetencyRuleProfile = () => (
  useQuery({
    queryKey: competencyQueryKeys.defaultRuleProfile(),
    queryFn: () => api.getDefaultCompetencyRuleProfile(),
  })
);

/**
 * Build the mutation to create a new criterion under a competency.
 * Invalidates that competency's criteria-groups query on success so the new
 * criterion shows up without a manual refetch.
 */
export const useCreateCompetencyCriterion = () => {
  const queryClient = useQueryClient();
  return useMutation<
    CreateCompetencyCriterionResponse,
    AxiosError<Record<string, string[]>>,
    { tagId: number; payload: CreateCompetencyCriterionPayload; }
  >({
    mutationFn: (
      { tagId, payload }: { tagId: number; payload: CreateCompetencyCriterionPayload; },
    ) => api.createCompetencyCriterion(tagId, payload),
    onSuccess: (_data, { tagId }) => {
      // Returned so the mutation stays pending until the refetch completes.
      return queryClient.invalidateQueries({ queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId) });
    },
  });
};

export interface UseCourseTaggingPermissionsReturn {
  isLoading: boolean;
  isError: boolean;
  isAuthzEnabled: boolean;
  permissionsByCourseId: Record<string, boolean>;
}

/**
 * Whether the signed-in author can manage this competency's associations for
 * each of the given courses, via the `courses.manage_tags` authz action
 * (`COURSE_PERMISSIONS.MANAGE_TAGS`).
 *
 * It has to serve both the pre-authz path and the authz path: every course
 * resolves to `true` when `enableAuthzCourseAuthoring` is off, and to `false`
 * while that flag or the permissions call is loading.
 *
 * It also works around `useUserPermissions` keying its cache on the whole
 * query object: adding a course (e.g. expanding a second one) makes a new,
 * momentarily loading query, which would flip every already-resolved course
 * back to `false`. A course id's last-known answer is kept instead.
 */
export const useCourseTaggingPermissions = (courseIds: string[]): UseCourseTaggingPermissionsReturn => {
  // `AUTHZ_COURSE_AUTHORING_FLAG` is a `CourseWaffleFlag`, read per course on the platform. This reads
  // the studio-wide value, which can disagree with a course-scoped override. With the flag off the client
  // reports every course editable and the backend refuses unauthorized creates.
  const waffleFlags = useWaffleFlags();
  const isWaffleFlagsLoading = waffleFlags?.isLoading ?? true;
  const isAuthzEnabled = waffleFlags?.enableAuthzCourseAuthoring ?? false;

  // Memoized on a sorted id string, not the array reference, so the query object (and the cache key
  // that embeds it) stays stable across equivalent `courseIds` arrays.
  const sortedCourseIdsKey = [...courseIds].sort().join(',');
  const query = useMemo<PermissionValidationQuery>(() => {
    if (!sortedCourseIdsKey) {
      return {};
    }
    return sortedCourseIdsKey.split(',').reduce<PermissionValidationQuery>((acc, courseId) => {
      acc[courseId] = { action: COURSE_PERMISSIONS.MANAGE_TAGS, scope: courseId };
      return acc;
    }, {});
  }, [sortedCourseIdsKey]);

  const shouldValidatePermissions = isAuthzEnabled && courseIds.length > 0;
  const {
    isLoading: isLoadingUserPermissions,
    isError: isUserPermissionsError,
    data: userPermissions,
  } = useUserPermissions(
    query,
    shouldValidatePermissions,
  );

  const isLoading = isWaffleFlagsLoading || (isAuthzEnabled && isLoadingUserPermissions);
  const isError = isAuthzEnabled && isUserPermissionsError;

  const [resolvedAnswers, setResolvedAnswers] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!isLoadingUserPermissions && userPermissions) {
      setResolvedAnswers((prev) => ({ ...prev, ...userPermissions }));
    }
  }, [isLoadingUserPermissions, userPermissions]);

  const permissionsByCourseId = useMemo(() => {
    const result: Record<string, boolean> = {};
    courseIds.forEach((courseId) => {
      if (isWaffleFlagsLoading) {
        result[courseId] = false;
      } else {
        result[courseId] = isAuthzEnabled ? (resolvedAnswers[courseId] ?? false) : true;
      }
    });
    return result;
  }, [courseIds, isWaffleFlagsLoading, isAuthzEnabled, resolvedAnswers]);

  return {
    isLoading,
    isError,
    isAuthzEnabled,
    permissionsByCourseId,
  };
};
