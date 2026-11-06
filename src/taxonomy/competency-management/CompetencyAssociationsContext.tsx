import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { Error as ErrorIcon, InfoOutline } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useQueries } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';

import { getCourseOutlineIndex } from '@src/course-outline/data';
import { courseOutlineQueryKeys } from '@src/course-outline/data/queryKeys';
import { useToastContext } from '@src/generic/toast-context';

import {
  useCompetencyCriteriaGroups,
  useCourseTaggingPermissions,
  useCreateCompetencyCriterion,
  useDefaultCompetencyRuleProfile,
} from './data/apiHooks';
import type {
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
  lastBottomTierGroupForCourse,
  lastRuleKeyIn,
  ruleBoxesForGroup,
  ruleKeyOf,
  visibleCourseGroups,
} from './utils';

/** `ruleKey` is `null` when the focused group has no rule box. A key that matches none of the
 * group's rule boxes is re-resolved to the group's last box.
 */
export interface CriteriaFocus {
  groupId: number;
  ruleKey: string | null;
}

export interface CompetencyAssociationsContextBase {
  /** The groups or profile failure, or the first course-outline failure other
   * than a 403 or 404, behind `status === 'error'`.
   */
  error: Error | null;
  focus: CriteriaFocus | null;
  /** Focuses a group and its last rule box. A no-op when `groupId` is already
   * focused, so re-clicking the group heading keeps the rule box the author
   * selected inside it.
   */
  focusGroup: (groupId: number) => void;
  focusRuleBox: (groupId: number, ruleKey: string) => void;
  /** Call when a course row expands, never when it collapses. Feeds `canEditCourse`
   * for a group-less course and moves focus to the course's last group and rule box
   * when focus is unset or on another course's group.
   */
  notifyCourseExpanded: (courseId: string) => void;
  /** Creates a criterion for the subsection in the active competency. Shows a
   * toast instead of sending a request when the subsection is already
   * associated or the groups tree or default profile has not loaded.
   */
  associateSubsection: (objectId: string, courseId: string) => void;
  isAssociating: boolean;
  /** How many times each course row has been expanded, so a card can reopen on an
   * expansion that leaves focus where it already was.
   */
  expansionCountByCourseId: Record<string, number>;
  /** The permissions request failed, so `canEditCourse` is `false` for courses it
   * could not resolve.
   */
  hasPermissionsError: boolean;
  /** Whether the author can manage associations for the course
   * (`courses.manage_tags`).
   */
  canEditCourse: (courseId: string) => boolean;
  /** The `objectId` of every criterion in the tree, for the duplicate guard
   * and the content panel's "already associated" marking.
   */
  associatedObjectIds: Set<string>;
  /** Course-level groups whose course outline loaded. A course added by a later
   * groups refetch joins once its outline loads.
   */
  accessibleCourseGroups: CourseCompetencyCriteriaGroup[];
  /** The active competency's short external id (e.g. "CCRS-1.3"), or `null`. */
  competencyExternalId: string | null;
}

/** Discriminated on `status`. `groupsIndex` and `systemDefaultProfile` are
 * always defined when `status` is `'success'`, and may be missing otherwise.
 *
 * `'pending'` until the groups, the default rule profile and every course
 * outline have settled, then `'success'` for the rest of that competency, even
 * when a later groups refetch adds a course whose outline has not loaded yet.
 * `'error'` if the groups, the profile or any course outline failed, including
 * a failure after `'success'`. An outline that fails with a 403 or 404 only
 * hides its course and does not affect `status`.
 */
export type CompetencyAssociationsContextValue =
  & CompetencyAssociationsContextBase
  & (
    | {
      status: 'success';
      groupsIndex: CompetencyCriteriaGroupsIndex;
      systemDefaultProfile: CompetencyRuleProfile;
    }
    | {
      status: 'pending' | 'error';
      groupsIndex: CompetencyCriteriaGroupsIndex | undefined;
      systemDefaultProfile: CompetencyRuleProfile | undefined;
    }
  );

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
  competencyExternalId: string | null;
  children: ReactNode;
}

/** A 403 or 404 on a course outline means the author cannot see that course. */
function isInaccessibleCourseError(error: unknown): boolean {
  return isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404);
}

function isFocusInCourse(
  courseId: string,
  focus: CriteriaFocus | null,
  index: CompetencyCriteriaGroupsIndex,
): focus is CriteriaFocus {
  const focusedGroup = focus ? index.groupsById.get(focus.groupId) : undefined;
  const focusedCourseGroup = focusedGroup?.parentId != null ? index.groupsById.get(focusedGroup.parentId) : undefined;
  return focusedCourseGroup?.courseKey === courseId;
}

/** The focus to move to when `courseId` is expanded, or `null` when focus
 * already sits on one of that course's groups or the course has no group.
 */
function courseExpansionFocus(
  courseId: string,
  focus: CriteriaFocus | null,
  index: CompetencyCriteriaGroupsIndex,
  systemDefaultProfile: CompetencyRuleProfile,
): CriteriaFocus | null {
  if (isFocusInCourse(courseId, focus, index)) {
    return null;
  }
  const target = lastBottomTierGroupForCourse(index, courseId);
  return target ? { groupId: target.id, ruleKey: lastRuleKeyIn(target.id, index, systemDefaultProfile) } : null;
}

/** The rule key to move focus to when the focused key matches no rule box, or `undefined` when focus is fine. */
function resolveStaleRuleKey(
  focus: CriteriaFocus,
  index: CompetencyCriteriaGroupsIndex,
  systemDefaultProfile: CompetencyRuleProfile,
): string | null | undefined {
  if (!index.groupsById.has(focus.groupId)) {
    return undefined;
  }
  // A rule box is keyed by its rule, so a refetch or a default-profile change can leave the key stale.
  const hasFocusedBox = ruleBoxesForGroup(focus.groupId, index, systemDefaultProfile)
    .some((box) => box.key === focus.ruleKey);
  if (hasFocusedBox) {
    return undefined;
  }
  const resolved = lastRuleKeyIn(focus.groupId, index, systemDefaultProfile);
  return resolved === focus.ruleKey ? undefined : resolved;
}

interface ProviderState {
  tagId: number;
  /** Bumped on every competency change, so an in-flight create can tell the
   * author left and came back, which a `tagId` comparison cannot.
   */
  generation: number;
  focus: CriteriaFocus | null;
  /** A course expanded before the groups and default profile loaded. */
  pendingCourseId: string | null;
  initialFocusDone: boolean;
  /** Latches once `status` first reaches `'success'` for the competency. */
  settled: boolean;
}

type ProviderAction =
  | { type: 'competencyChanged'; tagId: number; }
  | { type: 'focusGroup'; groupId: number; ruleKey: string | null; }
  | { type: 'focusRuleBox'; groupId: number; ruleKey: string; }
  | { type: 'setFocus'; focus: CriteriaFocus; }
  | { type: 'ruleKeyResolved'; groupId: number; staleRuleKey: string | null; resolvedRuleKey: string | null; }
  | { type: 'createSucceeded'; generation: number; focus: CriteriaFocus; }
  | { type: 'courseExpandedBeforeLoad'; courseId: string; }
  | { type: 'pendingCourseResolved'; focus: CriteriaFocus | null; }
  | { type: 'initialFocusRan'; focus: CriteriaFocus | null; }
  | { type: 'settled'; };

function providerReducer(state: ProviderState, action: ProviderAction): ProviderState {
  switch (action.type) {
    case 'competencyChanged':
      return {
        tagId: action.tagId,
        generation: state.generation + 1,
        focus: null,
        pendingCourseId: null,
        initialFocusDone: false,
        settled: false,
      };
    case 'focusGroup':
      if (state.focus?.groupId === action.groupId) {
        return state.pendingCourseId === null ? state : { ...state, pendingCourseId: null };
      }
      return { ...state, focus: { groupId: action.groupId, ruleKey: action.ruleKey }, pendingCourseId: null };
    case 'focusRuleBox':
      return { ...state, focus: { groupId: action.groupId, ruleKey: action.ruleKey }, pendingCourseId: null };
    case 'setFocus':
      return { ...state, focus: action.focus };
    case 'ruleKeyResolved':
      // Guarded so an action computed from a stale focus cannot overwrite a focus dispatched after it.
      return state.focus?.groupId === action.groupId && state.focus.ruleKey === action.staleRuleKey
        ? { ...state, focus: { groupId: action.groupId, ruleKey: action.resolvedRuleKey } }
        : state;
    case 'createSucceeded':
      return action.generation === state.generation ? { ...state, focus: action.focus } : state;
    case 'courseExpandedBeforeLoad':
      return { ...state, pendingCourseId: action.courseId };
    case 'pendingCourseResolved':
      return { ...state, pendingCourseId: null, focus: action.focus ?? state.focus };
    case 'initialFocusRan':
      // A focus set before the gate opened wins over the auto-focus.
      return state.focus === null && action.focus !== null
        ? { ...state, initialFocusDone: true, focus: action.focus, pendingCourseId: null }
        : { ...state, initialFocusDone: true };
    case 'settled':
      return { ...state, settled: true };
    default:
      return state;
  }
}

/** Provides per-competency criteria-association state to the course panel.
 *
 * Not remounted per competency (no `key={tagId}`), so the content panel keeps
 * its own state; a `tagId` change instead resets focus during render. Expanded
 * courses persist across competencies.
 */
export const CompetencyAssociationsProvider = ({
  tagId,
  competencyExternalId,
  children,
}: CompetencyAssociationsProviderProps) => {
  const intl = useIntl();
  const { showToast } = useToastContext();

  const [state, dispatch] = useReducer(providerReducer, {
    tagId,
    generation: 0,
    focus: null,
    pendingCourseId: null,
    initialFocusDone: false,
    settled: false,
  });
  const {
    focus,
    generation,
    pendingCourseId,
    initialFocusDone,
    settled,
  } = state;
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(new Set());
  const [expansionCountByCourseId, setExpansionCountByCourseId] = useState<Record<string, number>>({});

  const competencyChanged = tagId !== state.tagId;
  if (competencyChanged) {
    dispatch({ type: 'competencyChanged', tagId });
  }

  const groupsQuery = useCompetencyCriteriaGroups(tagId);
  const profileQuery = useDefaultCompetencyRuleProfile();
  const { mutateAsync: createCriterion, isPending: isCreatePending, variables } = useCreateCompetencyCriterion();
  const isAssociating = isCreatePending && variables?.tagId === tagId;

  const groupsIndex = useMemo(
    () => (groupsQuery.data ? buildCompetencyCriteriaGroupsIndex(groupsQuery.data) : undefined),
    [groupsQuery.data],
  );
  const systemDefaultProfile = profileQuery.data;
  const associatedIds = useMemo(
    () => (groupsQuery.data ? associatedObjectIds(groupsQuery.data) : new Set<string>()),
    [groupsQuery.data],
  );

  // Applied during render so the initial-focus effect below already sees it.
  // Skipped on the render that changes competency: the pending course belongs
  // to the previous one, but `groupsIndex` may already be the new one's cached tree.
  if (!competencyChanged && pendingCourseId !== null && groupsIndex && systemDefaultProfile) {
    dispatch({
      type: 'pendingCourseResolved',
      focus: courseExpansionFocus(pendingCourseId, focus, groupsIndex, systemDefaultProfile),
    });
  }

  const notifyCourseExpanded = useCallback((courseId: string) => {
    setExpandedCourseIds((prev) => (prev.has(courseId) ? prev : new Set(prev).add(courseId)));
    setExpansionCountByCourseId((prev) => ({ ...prev, [courseId]: (prev[courseId] ?? 0) + 1 }));
    if (!groupsIndex || !systemDefaultProfile) {
      dispatch({ type: 'courseExpandedBeforeLoad', courseId });
      return;
    }
    const next = courseExpansionFocus(courseId, focus, groupsIndex, systemDefaultProfile);
    if (next) {
      dispatch({ type: 'setFocus', focus: next });
    }
  }, [focus, groupsIndex, systemDefaultProfile]);

  const courseIdsWithGroups = useMemo(
    () => (groupsIndex ? groupsIndex.courseGroups.map((courseGroup) => courseGroup.courseKey) : []),
    [groupsIndex],
  );

  // Stays referentially stable because TanStack structurally shares the result; `useCallback` avoids recomputing it.
  const combineOutlines = useCallback((results: UseQueryResult[]) => ({
    accessibleCourseIds: courseIdsWithGroups.filter((_, i) => results[i]?.isSuccess).sort(),
    isPending: results.some((result) => result.isPending),
    error: results.find((result) => result.isError && !isInaccessibleCourseError(result.error))?.error ?? null,
  }), [courseIdsWithGroups]);

  const outlines = useQueries({
    // Same key and `retry: false` as `useCourseOutlineIndex`, so the cache is shared.
    queries: courseIdsWithGroups.map((courseId) => ({
      queryKey: courseOutlineQueryKeys.index(courseId),
      queryFn: () => getCourseOutlineIndex(courseId),
      retry: false as const,
    })),
    combine: combineOutlines,
  });

  const accessibleCourseGroups = useMemo(
    () => (groupsIndex ? visibleCourseGroups(groupsIndex, new Set(outlines.accessibleCourseIds)) : []),
    [groupsIndex, outlines.accessibleCourseIds],
  );

  const error = groupsQuery.error ?? profileQuery.error ?? outlines.error;
  let status: 'pending' | 'error' | 'success' = 'success';
  if (error) {
    status = 'error';
  } else if (!groupsIndex || !systemDefaultProfile || (!settled && outlines.isPending)) {
    status = 'pending';
  }
  // Skipped on the render that changes competency, whose data belongs to the previous one.
  if (!competencyChanged && !settled && status === 'success') {
    dispatch({ type: 'settled' });
  }

  const resolvedRuleKey = !competencyChanged && focus && groupsIndex && systemDefaultProfile
    ? resolveStaleRuleKey(focus, groupsIndex, systemDefaultProfile)
    : undefined;
  if (focus && resolvedRuleKey !== undefined) {
    dispatch({ type: 'ruleKeyResolved', groupId: focus.groupId, staleRuleKey: focus.ruleKey, resolvedRuleKey });
  }

  const focusGroup = useCallback((groupId: number) => {
    const ruleKey = (groupsIndex && systemDefaultProfile)
      ? lastRuleKeyIn(groupId, groupsIndex, systemDefaultProfile)
      : null;
    dispatch({ type: 'focusGroup', groupId, ruleKey });
  }, [groupsIndex, systemDefaultProfile]);

  const focusRuleBox = useCallback((groupId: number, ruleKey: string) => {
    dispatch({ type: 'focusRuleBox', groupId, ruleKey });
  }, []);

  // Runs once per competency, after groups, profile and every outline have
  // settled. An inaccessible course's group is not rendered, so it is never
  // auto-focus eligible. Independent of `expandedCourseIds`, which must not
  // delay it.
  useEffect(() => {
    if (initialFocusDone || status !== 'success' || !groupsIndex || !systemDefaultProfile) {
      return;
    }
    const allBottomTierGroups = accessibleCourseGroups
      .flatMap((courseGroup) => bottomTierGroupsForCourse(groupsIndex, courseGroup.courseKey));
    dispatch({
      type: 'initialFocusRan',
      focus: allBottomTierGroups.length === 1
        ? {
          groupId: allBottomTierGroups[0].id,
          ruleKey: lastRuleKeyIn(allBottomTierGroups[0].id, groupsIndex, systemDefaultProfile),
        }
        : null,
    });
  }, [initialFocusDone, status, groupsIndex, systemDefaultProfile, accessibleCourseGroups]);

  // Every course with a group plus every expanded course, even a group-less one.
  const courseIdsForPermissions = useMemo(() => {
    const ids = new Set(expandedCourseIds);
    courseIdsWithGroups.forEach((courseId) => ids.add(courseId));
    return Array.from(ids);
  }, [expandedCourseIds, courseIdsWithGroups]);

  const { permissionsByCourseId, isError: hasPermissionsError } = useCourseTaggingPermissions(courseIdsForPermissions);
  const canEditCourse = useCallback(
    (courseId: string) => permissionsByCourseId[courseId] ?? false,
    [permissionsByCourseId],
  );

  const associateSubsection = useCallback((objectId: string, courseId: string) => {
    if (associatedIds.has(objectId)) {
      showToast(intl.formatMessage(messages.alreadyAssociatedToastMessage), undefined, undefined, InfoOutline);
      return;
    }
    if (!groupsIndex || !systemDefaultProfile) {
      showToast(intl.formatMessage(messages.createCriterionFailedToastMessage), undefined, undefined, ErrorIcon);
      return;
    }

    let groupId: number | undefined;
    let ruleTypeOverride: string | undefined;
    let rulePayloadOverride: GradeRulePayload | undefined;

    const target = isFocusInCourse(courseId, focus, groupsIndex)
      ? focus
      : courseExpansionFocus(courseId, focus, groupsIndex, systemDefaultProfile);
    if (target) {
      groupId = target.groupId;
      const box = ruleBoxesForGroup(target.groupId, groupsIndex, systemDefaultProfile)
        .find((candidate) => candidate.key === target.ruleKey);
      if (box) {
        ruleTypeOverride = box.rule.ruleType;
        rulePayloadOverride = box.rule.rulePayload;
      }
      if (target !== focus) {
        dispatch({ type: 'setFocus', focus: target });
      }
    }

    const payload: CreateCompetencyCriterionPayload = {
      object_id: objectId,
      ...(groupId !== undefined ? { group_id: groupId } : {}),
      ...(ruleTypeOverride !== undefined ? { rule_type_override: ruleTypeOverride } : {}),
      ...(rulePayloadOverride !== undefined ? { rule_payload_override: rulePayloadOverride } : {}),
    };

    createCriterion({ tagId, payload }).then(
      (criterion) => {
        // Read from the response: this callback closed over the pre-create `groupsIndex`,
        // which does not know a brand-new criterion or group.
        dispatch({
          type: 'createSucceeded',
          generation,
          focus: { groupId: criterion.groupId, ruleKey: ruleKeyOf(criterion, systemDefaultProfile) },
        });
      },
      (createError: AxiosError) => {
        // A 400 with a `tag_id` field error is the backend's hierarchy
        // dominance check: an ancestor or descendant competency already has
        // criteria in this course.
        const { response } = createError;
        const isHierarchyConflict = response?.status === 400
          && typeof response.data === 'object' && response.data !== null && 'tag_id' in response.data;
        showToast(
          intl.formatMessage(
            isHierarchyConflict
              ? messages.createCriterionHierarchyConflictToastMessage
              : messages.createCriterionFailedToastMessage,
          ),
          undefined,
          undefined,
          ErrorIcon,
        );
      },
    );
  }, [
    associatedIds,
    groupsIndex,
    systemDefaultProfile,
    focus,
    tagId,
    generation,
    createCriterion,
    showToast,
    intl,
  ]);

  const contextValue = useMemo<CompetencyAssociationsContextValue>(() => {
    const shared: CompetencyAssociationsContextBase = {
      error,
      focus,
      focusGroup,
      focusRuleBox,
      notifyCourseExpanded,
      associateSubsection,
      isAssociating,
      expansionCountByCourseId,
      hasPermissionsError,
      canEditCourse,
      associatedObjectIds: associatedIds,
      accessibleCourseGroups,
      competencyExternalId,
    };
    if (status === 'success' && groupsIndex && systemDefaultProfile) {
      return { ...shared, status, groupsIndex, systemDefaultProfile };
    }
    return { ...shared, status: status === 'error' ? 'error' : 'pending', groupsIndex, systemDefaultProfile };
  }, [
    status,
    error,
    focus,
    focusGroup,
    focusRuleBox,
    notifyCourseExpanded,
    associateSubsection,
    isAssociating,
    expansionCountByCourseId,
    hasPermissionsError,
    canEditCourse,
    groupsIndex,
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
