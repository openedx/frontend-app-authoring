import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUserPermissions } from '@src/authz/data/apiHooks';
import { COURSE_PERMISSIONS } from '@src/authz/constants';
import { useWaffleFlags } from '@src/data/apiHooks';
import type { PermissionValidationQuery } from '@src/authz/types';

import * as api from './api';
import type { CompetencyGroupLogicOperator, CreateCompetencyCriterionPayload, GradeRulePayload } from './types';

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
  competency: (tagId: number | undefined) => [...competencyQueryKeys.all, 'competency', tagId],
  /** @param tagId ID of the competency (tag) */
  competencyCriteriaGroups: (tagId: number | undefined) => [
    ...competencyQueryKeys.competency(tagId),
    'criteriaGroups',
  ],
  /** The studio-wide default rule profile - not scoped to any one competency. */
  defaultRuleProfile: () => [...competencyQueryKeys.all, 'defaultRuleProfile'],
} satisfies Record<
  string,
  Array<string | number | undefined> | ((...args: any[]) => Array<string | number | undefined>)
>;

/**
 * Load a competency's existing criteria groups and criteria (`#681`).
 * @param tagId The id of the selected competency, or `undefined` while
 * none is selected yet - the query is disabled until a real id is available.
 */
export const useCompetencyCriteriaGroups = (tagId: number | undefined) => (
  useQuery({
    queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId),
    queryFn: () => api.getCompetencyCriteriaGroups(tagId as number),
    enabled: tagId !== undefined,
  })
);

/** Load the studio-wide default competency rule profile (`#773`). */
export const useDefaultCompetencyRuleProfile = () => (
  useQuery({
    queryKey: competencyQueryKeys.defaultRuleProfile(),
    queryFn: () => api.getDefaultCompetencyRuleProfile(),
  })
);

/**
 * Build the mutation to create a new criterion under a competency (`#665`).
 * Invalidates that competency's criteria-groups query on success so the new
 * criterion shows up without a manual refetch.
 */
export const useCreateCompetencyCriterion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      { tagId, payload }: { tagId: number; payload: CreateCompetencyCriterionPayload; },
    ) => api.createCompetencyCriterion(tagId, payload),
    onSuccess: (_data, { tagId }) => {
      queryClient.invalidateQueries({ queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId) });
    },
  });
};

/**
 * Build the mutation to update a bottom-tier group's any/all combining
 * logic (`#760`). Invalidates that competency's criteria-groups query on
 * success so the new operator shows up without a manual refetch.
 */
export const useUpdateCompetencyCriteriaGroupOperator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      { tagId, groupId, logicOperator }: {
        tagId: number;
        groupId: number;
        logicOperator: CompetencyGroupLogicOperator;
      },
    ) => api.updateCompetencyCriteriaGroupOperator(tagId, groupId, logicOperator),
    onSuccess: (_data, { tagId }) => {
      queryClient.invalidateQueries({ queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId) });
    },
  });
};

/**
 * Build the mutation to batch-update a rule box's score threshold (`#759`).
 * Invalidates that competency's criteria-groups query on success. `tagId`
 * is only used for that invalidation - the endpoint's own URL isn't nested
 * under a competency.
 */
export const useUpdateCompetencyCriteriaRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      { groupId, criterionIds, ruleType, rulePayload }: {
        tagId: number;
        groupId: number;
        criterionIds: number[];
        ruleType: string;
        rulePayload: GradeRulePayload;
      },
    ) => api.updateCompetencyCriteriaRule(groupId, criterionIds, ruleType, rulePayload),
    onSuccess: (_data, { tagId }) => {
      queryClient.invalidateQueries({ queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId) });
    },
  });
};

export interface UseCourseTaggingPermissionsReturn {
  isLoading: boolean;
  isAuthzEnabled: boolean;
  permissionsByCourseId: Record<string, boolean>;
}

/**
 * Whether the signed-in author can manage this competency's associations for
 * each of the given courses, via the studio-wide `courses.manage_tags`
 * authz action (`COURSE_PERMISSIONS.MANAGE_TAGS`).
 *
 * Reproduces `useCourseUserPermissions`'s (`src/authz/hooks.ts`) own
 * fallback rules for a *list* of courses rather than one course's fixed set
 * of named permissions: every course resolves to `true` when the
 * `enableAuthzCourseAuthoring` waffle flag is off (its default, so the
 * feature isn't permanently read-only wherever authz isn't enabled), and to
 * `false` while either that flag or the permissions call is still loading,
 * so a control never flashes enabled before disabling.
 *
 * A course id's last-known answer survives a later call with a bigger
 * `courseIds` list (e.g. the content panel expanding a second course):
 * `useUserPermissions`'s cache key embeds the whole query object, so a
 * bigger course set is a brand new query, momentarily `isLoading` again -
 * without this, every previously-resolved course would flash back to
 * `false` too. Only a course with no answer at all yet defaults to `false`
 * while loading.
 */
export const useCourseTaggingPermissions = (courseIds: string[]): UseCourseTaggingPermissionsReturn => {
  // The studio-wide endpoint returns the same flag regardless of course, so
  // no course id is passed here (the parameter is optional).
  const waffleFlags = useWaffleFlags();
  const isWaffleFlagsLoading = waffleFlags?.isLoading ?? true;
  const isAuthzEnabled = waffleFlags?.enableAuthzCourseAuthoring ?? false;

  // Memoized on a sorted/joined id string, not the `courseIds` array
  // reference, so this query object - and so `useUserPermissions`'s own
  // cache key, which embeds the whole object - stays stable across renders
  // that pass an equivalent but differently-ordered or new-reference array.
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

  // Mirrors `useCourseUserPermissions`'s own `isAuthzEnabled && !!courseId`
  // gate, generalized to "there's at least one course id to check."
  const shouldValidatePermissions = isAuthzEnabled && courseIds.length > 0;
  const { isLoading: isLoadingUserPermissions, data: userPermissions } = useUserPermissions(
    query,
    shouldValidatePermissions,
  );

  const isLoading = isWaffleFlagsLoading || (isAuthzEnabled && isLoadingUserPermissions);

  // Accumulates every course id's last-known answer as permissions calls
  // resolve, so a course already resolved once keeps that answer while a
  // later, bigger query is still in flight (see the docstring above).
  const [resolvedAnswers, setResolvedAnswers] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!isLoadingUserPermissions && userPermissions) {
      setResolvedAnswers((prev) => ({ ...prev, ...userPermissions }));
    }
  }, [isLoadingUserPermissions, userPermissions]);

  const permissionsByCourseId = useMemo(() => {
    const result: Record<string, boolean> = {};
    courseIds.forEach((courseId) => {
      result[courseId] = isAuthzEnabled ? (resolvedAnswers[courseId] ?? false) : true;
    });
    return result;
  }, [courseIds, isAuthzEnabled, resolvedAnswers]);

  return { isLoading, isAuthzEnabled, permissionsByCourseId };
};
