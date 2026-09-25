import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useQueries } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { getCourseOutlineIndex } from '@src/course-outline/data';
// Bypasses the public barrel deliberately: this is the same query key
// `useCourseOutlineIndex` uses, so the `useQueries` calls below share its
// cache instead of refetching per course.
import { courseOutlineQueryKeys } from '@src/course-outline/data/queryKeys';
import { useToastContext } from '@src/generic/toast-context';

import {
  useCompetencyCriteriaGroups,
  useCourseTaggingPermissions,
  useCreateCompetencyCriterion,
  useDefaultCompetencyRuleProfile,
  useUpdateCompetencyCriteriaGroupOperator,
  useUpdateCompetencyCriteriaRule,
} from './data/apiHooks';
import type {
  CompetencyCriteriaGroupsResponse,
  CompetencyGroupLogicOperator,
  CompetencyRuleProfile,
  CourseCompetencyCriteriaGroup,
  CreateCompetencyCriterionPayload,
  GradeRulePayload,
} from './data/types';
import messages from './messages';
import type { CompetencyCriteriaGroupsIndex } from './utils';
import {
  associatedObjectIds,
  bottomTierGroupsForCourse,
  buildCompetencyCriteriaGroupsIndex,
  effectiveRuleOf,
  lastRealRuleKeyIn,
  ruleBoxesForGroup,
  ruleKeyOf,
  visibleCourseGroups,
} from './utils';

/** A rule box only means anything inside its own group, so `groupId` and
 * `ruleKey` are always written together (see `focusGroup`/`focusRuleBox`).
 * `ruleKey` is `null` when the focused group has no rule box yet.
 */
export interface CriteriaFocus {
  groupId: number;
  ruleKey: string | null;
}

export interface CompetencyAssociationsContextValue {
  /** Both start unset (`null`); see `CriteriaFocus` above for why the pair
   * is always written together.
   */
  focus: CriteriaFocus | null;
  /** Focuses a group and its last real rule box (`lastRealRuleKeyIn`). A
   * no-op when `groupId` is already focused, so re-clicking the group
   * heading doesn't discard a rule box the author had selected inside it.
   */
  focusGroup: (groupId: number) => void;
  /** Focuses one specific rule box, and the group it belongs to, together. */
  focusRuleBox: (groupId: number, ruleKey: string) => void;
  /** Notify the provider that a course was expanded in the content panel.
   * Call only from that panel's own per-course chevron on expand, never on
   * collapse or from a page-level "Expand All": this feeds `canEditCourse`
   * for a group-less course, and has no effect on initial focus.
   */
  notifyCourseExpanded: (courseId: string) => void;
  /** Associates a piece of course content (a gradable subsection) with the
   * active competency.
   */
  associateSubsection: (objectId: string, courseId: string) => void;
  /** Updates a bottom-tier group's any/all combining logic (`#760`). A
   * rejected save is a no-op besides a failure toast: `group.logicOperator`
   * is only ever written by the next successful `groupsQuery` refetch.
   */
  updateGroupOperator: (groupId: number, logicOperator: CompetencyGroupLogicOperator) => void;
  /** Updates a rule box's score threshold, across every criterion listed in
   * `criterionIds` (`#759`). The rule type is pinned to the box's current
   * effective rule, resolved here rather than accepted from the caller,
   * since only the numeric value is user-editable. On success, repairs
   * focus using the mutation's own response rather than the request, since
   * a "reset to default" edit can be echoed back differently than it was
   * sent. Returns a `Promise` (not `void`) so `ScoreThresholdField` can
   * revert its own local input on rejection, without owning the mutation.
   */
  updateRuleScore: (groupId: number, criterionIds: number[], rulePayload: GradeRulePayload) => Promise<void>;
  /**
   * Whether the signed-in author can create/manage associations for the
   * given course, via `useCourseTaggingPermissions`'s `courses.manage_tags`
   * check.
   */
  canEditCourse: (courseId: string) => boolean;
  groupsQuery: UseQueryResult<CompetencyCriteriaGroupsResponse>;
  profileQuery: UseQueryResult<CompetencyRuleProfile>;
  /** Built from `groupsQuery.data`; `undefined` until that query resolves. */
  index: CompetencyCriteriaGroupsIndex | undefined;
  systemDefaultProfile: CompetencyRuleProfile | undefined;
  /** Every already-associated criterion's `objectId`, across the whole
   * tree: the create mutation's duplicate guard and the content panel's
   * "already associated" marking both read this.
   */
  associatedObjectIds: Set<string>;
  /** `utils.ts`'s `visibleCourseGroups`, filtered by this provider's own
   * per-course outline-fetch results.
   */
  accessibleCourseGroups: CourseCompetencyCriteriaGroup[];
  /** The active competency's short external id (e.g. "CCRS-1.3"), shown on
   * an already-associated subsection's badge. `null` when the competency
   * has none.
   */
  competencyExternalId: string | null;
}

// Exported so component tests can render a hand-built value via
// `<CompetencyAssociationsContext.Provider>` without mocking every HTTP
// request the real provider would issue - see e.g. `criteria-groups/RuleBox.test.tsx`.
export const CompetencyAssociationsContext = createContext<CompetencyAssociationsContextValue | undefined>(undefined);

/** Reads the current competency-associations context. Throws outside a
 * `<CompetencyAssociationsProvider>` ancestor rather than a no-op default,
 * so a missing provider surfaces instead of failing silently.
 */
export function useCompetencyAssociations(): CompetencyAssociationsContextValue {
  const ctx = useContext(CompetencyAssociationsContext);
  if (ctx === undefined) {
    throw new Error(
      'useCompetencyAssociations() was used in a component without a <CompetencyAssociationsProvider> ancestor.',
    );
  }
  return ctx;
}

export interface CompetencyAssociationsProviderProps {
  tagId: number;
  /** The active competency's short external id, for the already-associated
   * badge in the content panel below. `null` when the competency has none.
   */
  competencyExternalId: string | null;
  children: ReactNode;
}

/** Provides per-competency criteria-association state to the right-hand
 * course panel.
 *
 * Never remounted (no `key={tagId}`), so it doesn't reset
 * `CourseSearchBrowse`'s own state on competency change; instead it resets
 * its own state by comparing the incoming `tagId` against the previous
 * render's value, React's documented alternative to a remounting `key`.
 */
export const CompetencyAssociationsProvider = ({
  tagId,
  competencyExternalId,
  children,
}: CompetencyAssociationsProviderProps) => {
  const intl = useIntl();
  const { showToast } = useToastContext();

  const [prevTagId, setPrevTagId] = useState(tagId);
  const [focus, setFocus] = useState<CriteriaFocus | null>(null);
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(new Set());
  const hasRunInitialFocusRef = useRef(false);
  if (tagId !== prevTagId) {
    setPrevTagId(tagId);
    setFocus(null);
    setExpandedCourseIds(new Set());
    hasRunInitialFocusRef.current = false;
  }

  const groupsQuery = useCompetencyCriteriaGroups(tagId);
  const profileQuery = useDefaultCompetencyRuleProfile();
  const createCriterion = useCreateCompetencyCriterion();
  const updateGroupOperatorMutation = useUpdateCompetencyCriteriaGroupOperator();
  const updateRuleScoreMutation = useUpdateCompetencyCriteriaRule();

  const index = useMemo(
    () => (groupsQuery.data ? buildCompetencyCriteriaGroupsIndex(groupsQuery.data) : undefined),
    [groupsQuery.data],
  );
  const systemDefaultProfile = profileQuery.data;
  const associatedIds = useMemo(
    () => (groupsQuery.data ? associatedObjectIds(groupsQuery.data) : new Set<string>()),
    [groupsQuery.data],
  );

  const notifyCourseExpanded = useCallback((courseId: string) => {
    setExpandedCourseIds((prev) => (prev.has(courseId) ? prev : new Set(prev).add(courseId)));
  }, []);

  // Every course-level group's course key, unfiltered - each must be
  // fetched to determine accessibility (see `accessibleCourseIds` below).
  // Also feeds the initial-focus gate and, unioned with `expandedCourseIds`,
  // `canEditCourse`'s permission check.
  const courseIdsWithGroups = useMemo(
    () => (index ? index.courseGroups.map((courseGroup) => courseGroup.courseKey) : []),
    [index],
  );

  const outlineQueries = useQueries({
    queries: courseIdsWithGroups.map((courseId) => ({
      queryKey: courseOutlineQueryKeys.index(courseId),
      queryFn: () => getCourseOutlineIndex(courseId),
      retry: false as const,
    })),
  });
  const allVisibleCourseOutlinesResolved = outlineQueries.every((query) => !query.isLoading);

  // A course counts as accessible only once its outline fetch succeeds - a
  // failed fetch is excluded entirely rather than shown with a placeholder
  // name, and a still-loading one doesn't count as accessible either.
  const accessibleCourseIds = useMemo(() => {
    const ids = new Set<string>();
    courseIdsWithGroups.forEach((courseId, i) => {
      if (outlineQueries[i]?.isSuccess) {
        ids.add(courseId);
      }
    });
    return ids;
  }, [courseIdsWithGroups, outlineQueries]);

  const accessibleCourseGroups = useMemo(
    () => (index ? visibleCourseGroups(index, accessibleCourseIds) : []),
    [index, accessibleCourseIds],
  );

  const focusGroup = useCallback((groupId: number) => {
    setFocus((prev) => {
      if (prev?.groupId === groupId) {
        // No-op: clicking the group already in focus must not re-resolve
        // its default rule box, or it would silently throw away whichever
        // rule box the author had selected inside it.
        return prev;
      }
      const ruleKey = (index && systemDefaultProfile) ? lastRealRuleKeyIn(groupId, index, systemDefaultProfile) : null;
      return { groupId, ruleKey };
    });
  }, [index, systemDefaultProfile]);

  const focusRuleBox = useCallback((groupId: number, ruleKey: string) => {
    setFocus({ groupId, ruleKey });
  }, []);

  // Runs at most once per competency: once groups, profile, and every
  // course-with-a-group's outline have resolved, focus the sole bottom-tier
  // group if exactly one exists among *accessible* course-level groups (an
  // inaccessible one isn't rendered, so it must never be auto-focus
  // eligible). Independent of `expandedCourseIds`, which must not delay
  // this gate. A click that sets focus first beats this auto-focus; the
  // effect still marks itself as run, it just skips writing.
  useEffect(() => {
    if (hasRunInitialFocusRef.current) {
      return;
    }
    if (!groupsQuery.isSuccess || !profileQuery.isSuccess || !allVisibleCourseOutlinesResolved || !index) {
      return;
    }
    hasRunInitialFocusRef.current = true;
    if (focus !== null) {
      return;
    }
    const allBottomTierGroups = accessibleCourseGroups
      .flatMap((courseGroup) => bottomTierGroupsForCourse(index, courseGroup.courseKey));
    if (allBottomTierGroups.length === 1) {
      focusGroup(allBottomTierGroups[0].id);
    }
  }, [
    groupsQuery.isSuccess,
    profileQuery.isSuccess,
    allVisibleCourseOutlinesResolved,
    index,
    accessibleCourseGroups,
    focus,
    focusGroup,
  ]);

  // `canEditCourse`'s course list: every course with a group plus every
  // course expanded in the content panel (even group-less). Must not feed
  // the initial-focus gate above.
  const courseIdsForPermissions = useMemo(() => {
    const ids = new Set(expandedCourseIds);
    courseIdsWithGroups.forEach((courseId) => ids.add(courseId));
    return Array.from(ids);
  }, [expandedCourseIds, courseIdsWithGroups]);

  const { permissionsByCourseId } = useCourseTaggingPermissions(courseIdsForPermissions);
  const canEditCourse = useCallback(
    (courseId: string) => permissionsByCourseId[courseId] ?? false,
    [permissionsByCourseId],
  );

  const associateSubsection = useCallback((objectId: string, courseId: string) => {
    if (associatedIds.has(objectId)) {
      // Not a real failure - the backend is still the real backstop for a
      // race, this only spares the author a failed-request error for
      // something that isn't actually one.
      showToast(intl.formatMessage(messages.alreadyAssociatedToastMessage));
      return;
    }
    if (!index || !systemDefaultProfile) {
      // Shouldn't happen: the content panel only offers this action once
      // both queries have resolved.
      return;
    }

    let groupId: number | undefined;
    let ruleTypeOverride: string | undefined;
    let rulePayloadOverride: GradeRulePayload | undefined;

    if (focus) {
      const focusedGroup = index.groupsById.get(focus.groupId);
      if (focusedGroup && focusedGroup.parentId !== null) {
        const courseGroup = index.groupsById.get(focusedGroup.parentId);
        if (courseGroup?.courseKey === courseId && focus.ruleKey !== null) {
          const box = ruleBoxesForGroup(focus.groupId, index, systemDefaultProfile)
            .find((candidate) => candidate.key === focus.ruleKey);
          if (box) {
            groupId = focus.groupId;
            ruleTypeOverride = box.rule.ruleType;
            rulePayloadOverride = box.rule.rulePayload;
          }
        }
      }
    }

    const payload: CreateCompetencyCriterionPayload = {
      object_id: objectId,
      ...(groupId !== undefined ? { group_id: groupId } : {}),
      ...(ruleTypeOverride !== undefined ? { rule_type_override: ruleTypeOverride } : {}),
      ...(rulePayloadOverride !== undefined ? { rule_payload_override: rulePayloadOverride } : {}),
    };

    createCriterion.mutate({ tagId, payload }, {
      onSuccess: (criterion) => {
        // From the response itself, not `lastRealRuleKeyIn` against the
        // local tree: the groups query hasn't refetched yet, so the local
        // tree still doesn't know about this brand-new criterion (or
        // group) and would resolve a stale/`null` rule key.
        setFocus({
          groupId: criterion.groupId,
          ruleKey: ruleKeyOf(criterion, systemDefaultProfile),
        });
      },
      onError: (error) => {
        // The backend's hierarchy dominance check (ADR 0002): rejects a new
        // criterion when an ancestor or descendant competency already has
        // criteria in the same course, as a 400 with a `tag_id` field error.
        const { response } = error;
        const isHierarchyConflict = response?.status === 400
          && typeof response.data === 'object' && response.data !== null && 'tag_id' in response.data;
        showToast(intl.formatMessage(
          isHierarchyConflict
            ? messages.createCriterionHierarchyConflictToastMessage
            : messages.createCriterionFailedToastMessage,
        ));
      },
    });
  }, [associatedIds, index, systemDefaultProfile, focus, tagId, createCriterion, showToast, intl]);

  const updateGroupOperator = useCallback((groupId: number, logicOperator: CompetencyGroupLogicOperator) => {
    updateGroupOperatorMutation.mutate({ tagId, groupId, logicOperator }, {
      onError: () => {
        // No local rollback needed: `LogicOperatorSelect` always renders
        // from `group.logicOperator`, which a rejected mutation never touches.
        showToast(intl.formatMessage(messages.updateGroupOperatorFailedToastMessage));
      },
    });
  }, [tagId, updateGroupOperatorMutation, showToast, intl]);

  const updateRuleScore = useCallback((
    groupId: number,
    criterionIds: number[],
    rulePayload: GradeRulePayload,
  ): Promise<void> => {
    if (!index || !systemDefaultProfile) {
      // Shouldn't happen: a rule box is only ever rendered - let alone made
      // editable - once both queries have resolved.
      return Promise.resolve();
    }
    // Rule type is pinned to the box's current effective rule, resolved
    // from any one criterion already in it (they all share it, by definition).
    const groupCriteria = index.criteriaByGroupId.get(groupId) ?? [];
    const anchorCriterion = groupCriteria.find((criterion) => criterionIds.includes(criterion.id));
    if (!anchorCriterion) {
      return Promise.resolve();
    }
    const { ruleType } = effectiveRuleOf(anchorCriterion, systemDefaultProfile);

    return updateRuleScoreMutation.mutateAsync({ tagId, groupId, criterionIds, ruleType, rulePayload })
      .then((updatedCriteria) => {
        // From the response, not the request: a "reset to default" edit can
        // echo back a shared profile reference instead of the sent values,
        // so the new focus key has to come from what was actually persisted.
        const [updatedCriterion] = updatedCriteria;
        if (updatedCriterion) {
          setFocus({ groupId, ruleKey: ruleKeyOf(updatedCriterion, systemDefaultProfile) });
        }
      })
      .catch((error) => {
        showToast(intl.formatMessage(messages.updateRuleScoreFailedToastMessage));
        // Re-thrown so ScoreThresholdField's own commit handler also sees
        // the rejection and reverts its local input.
        throw error;
      });
  }, [index, systemDefaultProfile, tagId, updateRuleScoreMutation, showToast, intl]);

  const contextValue = useMemo<CompetencyAssociationsContextValue>(() => ({
    focus,
    focusGroup,
    focusRuleBox,
    notifyCourseExpanded,
    associateSubsection,
    updateGroupOperator,
    updateRuleScore,
    canEditCourse,
    groupsQuery,
    profileQuery,
    index,
    systemDefaultProfile,
    associatedObjectIds: associatedIds,
    accessibleCourseGroups,
    competencyExternalId,
  }), [
    focus,
    focusGroup,
    focusRuleBox,
    notifyCourseExpanded,
    associateSubsection,
    updateGroupOperator,
    updateRuleScore,
    canEditCourse,
    groupsQuery,
    profileQuery,
    index,
    systemDefaultProfile,
    associatedIds,
    accessibleCourseGroups,
    competencyExternalId,
  ]);

  return (
    <CompetencyAssociationsContext.Provider value={contextValue}>
      {children}
    </CompetencyAssociationsContext.Provider>
  );
};
