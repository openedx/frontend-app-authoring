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
import { isEqual } from 'lodash';
import moment from 'moment';

import { getCourseOutlineIndex } from '@src/course-outline/data';
import { courseOutlineQueryKeys } from '@src/course-outline/data/queryKeys';
import { useToastContext } from '@src/generic/toast-context';
import type { Course } from '@src/studio-home/data/api';
import { useStudioHomeCoursesV2 } from '@src/studio-home/data/apiHooks';

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
import { courseKeyOfFocus, resolveCreateTarget } from './criterionTarget';
import messages from './messages';
import {
  clearJustAddedOnFocusMove,
  initialPlaceholder,
  isPlaceholderOrphaned,
  PLACEHOLDER_REJECTION_CLEARING_ACTIONS,
  reducePlaceholderAction,
  usePlaceholderActions,
} from './placeholderState';
import type { CriteriaPlaceholder, PlaceholderAction } from './placeholderState';
import type { CompetencyCriteriaGroupsIndex } from './utils';
import {
  associatedObjectIds,
  bottomTierGroupsForCourse,
  buildCompetencyCriteriaGroupsIndex,
  effectiveRuleOf,
  lastBottomTierGroupForCourse,
  lastRuleKeyIn,
  ruleBoxesForGroup,
  ruleKeyOf,
  visibleCourseGroups,
} from './utils';

export type { CriteriaPlaceholder };

/** The rule box or group the author is working in; `ruleKey` is a rule box's key within its group.
 * `ruleKey === null` is an unsaved placeholder rule box in the group, and `groupId === null` is an unsaved
 * placeholder group under `placeholder.parentRuleGroupId`. A non-null `ruleKey` that matches no box re-resolves
 * to the group's last box, or to `null` for a saved group with no criteria, which then renders its placeholder
 * rule box on purpose.
 */
export interface CriteriaFocus {
  groupId: number | null;
  ruleKey: string | null;
}

export type CourseDateRange = [Date | null, Date | null];

/** The course list query, as the course browser needs it. */
export interface CourseList {
  /** The listed page. While a new page or filter loads (`isPlaceholderData`) this is still the previous
   * one, so the groups keep their scope until the listed courses really change.
   */
  courses: Course[];
  numPages: number;
  /** The first page is loading. A later page or filter loading shows as `isPlaceholderData` instead. */
  isLoading: boolean;
  /** `courses` is the previous parameters' page, and the requested one is still loading. */
  isPlaceholderData: boolean;
  isError: boolean;
  isSuccess: boolean;
}

const PAGE_SIZE = 10;

// Sends the local calendar day's own start/end instant (in the browser's own
// UTC offset), not a bare date: a bare `YYYY-MM-DD` is inherently ambiguous
// across time zones, since the backend has no way to know which time zone's
// midnight-to-midnight it should mean (see #834 for the day-boundary bug
// this caused). The backend requires an explicit UTC offset (or `Z`) and
// compares this value directly against a course's own start instant, so the
// selected day here always matches the day Studio itself shows for that
// course, regardless of the user's time zone. `SSS` keeps the "end" boundary
// at the day's last millisecond rather than its last whole second - `moment`
// can't go finer than that (it wraps the browser's own `Date`, which is
// itself only millisecond-precise), but that's still within a millisecond
// of the backend's own microsecond-precision end-of-day example.
const formatLocalDayBoundary = (date: Date, boundary: 'start' | 'end') =>
  (
    boundary === 'start' ? moment(date).startOf('day') : moment(date).endOf('day')
  ).format('YYYY-MM-DDTHH:mm:ss.SSSZ');

interface CourseListParams {
  page: number;
  search: string;
  dateRange: CourseDateRange;
}

const initialCourseListParams: CourseListParams = { page: 1, search: '', dateRange: [null, null] };

export interface CompetencyAssociationsContextBase {
  /** The course list, groups or profile failure, or the first course-outline failure other
   * than a 403 or 404, behind `status === 'error'`.
   */
  error: Error | null;
  focus: CriteriaFocus | null;
  placeholder: CriteriaPlaceholder;
  /** Whether a placeholder rule box or group exists, which disables both add controls. Also true for a focused
   * saved group with no criteria, which renders its placeholder rule box on purpose.
   */
  hasPlaceholder: boolean;
  /** Starts a placeholder rule box in a bottom-tier group, replacing any other placeholder. */
  addPlaceholderRuleBox: (groupId: number) => void;
  /** Starts a placeholder bottom-tier group under a course-level group, replacing any other placeholder. */
  addPlaceholderGroup: (parentRuleGroupId: number) => void;
  setPlaceholderLogicOperator: (logicOperator: CompetencyGroupLogicOperator) => void;
  setPlaceholderRulePayload: (rulePayload: GradeRulePayload) => void;
  /** True after content was selected while the placeholder's score duplicated a box in its group.
   * The request is not sent.
   */
  placeholderDuplicateRejected: boolean;
  /** Counts rejections, so a repeat rejection while `placeholderDuplicateRejected` is already true is still
   * observable. Resets only when the competency changes.
   */
  placeholderDuplicateRejectionCount: number;
  /** Drops the placeholder by clearing `focus`. */
  discardPlaceholder: () => void;
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
  /** Updates a bottom-tier group's any/all combining logic. A rejected save only shows a failure toast. */
  updateGroupOperator: (groupId: number, logicOperator: CompetencyGroupLogicOperator) => void;
  /** Updates a rule box's score threshold across `criterionIds`, keeping the box's current rule type.
   * Rejects on failure so `ScoreThresholdField` can revert its local input.
   */
  updateRuleScore: (groupId: number, criterionIds: number[], rulePayload: GradeRulePayload) => Promise<void>;
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
  /** The `objectId` of every criterion in the listed courses, for the duplicate guard
   * and the content panel's "already associated" marking. Content can only be picked
   * from a listed course, so the guard needs nothing outside them.
   */
  associatedObjectIds: Set<string>;
  /** Course-level groups whose course outline loaded. A course added by a later
   * groups refetch joins once its outline loads.
   */
  accessibleCourseGroups: CourseCompetencyCriteriaGroup[];
  /** The active competency's short external id (e.g. "CCRS-1.3"), or `null`. */
  competencyExternalId: string | null;
  /** The course list the groups are scoped to. */
  courseList: CourseList;
  /** The course list's 1-based page number. */
  coursePage: number;
  /** The course list's debounced search text. */
  courseSearch: string;
  /** The course list's start-date range filter. */
  courseDateRange: CourseDateRange;
  setCoursePage: (page: number) => void;
  /** Sets the search text and returns the list to page 1. */
  setCourseSearch: (search: string) => void;
  /** Sets the date range and returns the list to page 1. */
  setCourseDateRange: (dateRange: CourseDateRange) => void;
  /** The groups response's association counts: `criteriaCount` in the listed
   * courses and `totalCriteriaCount` across the instance. `undefined` while the
   * groups for the current scope are loading, and while the groups query is in error.
   */
  criteriaCounts: Pick<CompetencyCriteriaGroupsResponse, 'criteriaCount' | 'totalCriteriaCount'> | undefined;
}

/** Discriminated on `status`. `groupsIndex` and `systemDefaultProfile` are
 * always defined when `status` is `'success'`, and may be missing otherwise.
 *
 * `'pending'` until the course list, the groups, the default rule profile and
 * every course outline have settled, then `'success'` until the competency or the set of
 * listed courses changes, even when a later groups refetch adds a course whose
 * outline has not loaded yet. `'error'` if the course list, the groups, the profile
 * or any course outline failed, including a failure after `'success'`. An outline that
 * fails with a 403 or 404 only hides its course and does not affect `status`.
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

/** The focus to move to when `courseId` is expanded, or `null` when focus
 * already sits on one of that course's groups or the course has no group.
 */
function courseExpansionFocus(
  courseId: string,
  focus: CriteriaFocus | null,
  placeholder: CriteriaPlaceholder,
  index: CompetencyCriteriaGroupsIndex,
  systemDefaultProfile: CompetencyRuleProfile,
): CriteriaFocus | null {
  if (courseKeyOfFocus(focus, placeholder, index) === courseId) {
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
  // A `null` key is a placeholder rule box, which matches no real one by design.
  if (focus.groupId === null || focus.ruleKey === null || !index.groupsById.has(focus.groupId)) {
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

export interface ProviderState {
  tagId: number;
  /** Bumped on every competency change, so an in-flight create can tell the
   * author left and came back, which a `tagId` comparison cannot.
   */
  generation: number;
  focus: CriteriaFocus | null;
  placeholder: CriteriaPlaceholder;
  placeholderDuplicateRejected: boolean;
  placeholderDuplicateRejectionCount: number;
  /** A course expanded before the groups and default profile loaded. */
  pendingCourseId: string | null;
  initialFocusDone: boolean;
  /** Latches once `status` first reaches `'success'` for the competency, and
   * again for each new set of listed courses.
   */
  settled: boolean;
  /** The listed course keys the groups scope was last reset for; `undefined` until the course list's first page
   * has loaded. Kept across competencies.
   */
  scopeCourseKeys: string[] | undefined;
}

export type ProviderAction =
  | { type: 'competencyChanged'; tagId: number; }
  | { type: 'scopeChanged'; courseKeys: string[]; }
  | { type: 'focusGroup'; groupId: number; ruleKey: string | null; }
  | { type: 'focusRuleBox'; groupId: number; ruleKey: string; }
  | { type: 'setFocus'; focus: CriteriaFocus; }
  | PlaceholderAction
  | { type: 'placeholderDuplicateRejected'; }
  | { type: 'ruleKeyResolved'; groupId: number; staleRuleKey: string | null; resolvedRuleKey: string | null; }
  | { type: 'createSucceeded'; generation: number; focus: CriteriaFocus; }
  | { type: 'courseExpandedBeforeLoad'; courseId: string; }
  | { type: 'pendingCourseResolved'; focus: CriteriaFocus | null; }
  | { type: 'initialFocusRan'; focus: CriteriaFocus | null; }
  | { type: 'settled'; };

function reduceProviderState(state: ProviderState, action: ProviderAction): ProviderState {
  switch (action.type) {
    case 'competencyChanged':
      return {
        tagId: action.tagId,
        generation: state.generation + 1,
        focus: null,
        placeholder: initialPlaceholder,
        placeholderDuplicateRejected: false,
        placeholderDuplicateRejectionCount: 0,
        pendingCourseId: null,
        initialFocusDone: false,
        settled: false,
        scopeCourseKeys: state.scopeCourseKeys,
      };
    case 'scopeChanged': {
      if (isEqual(state.scopeCourseKeys, action.courseKeys)) {
        return state;
      }
      const next = { ...state, scopeCourseKeys: action.courseKeys };
      if (state.scopeCourseKeys === undefined) {
        return next;
      }
      // A new scope is a fresh load: `status` waits for its groups and for the
      // outline of every listed course that has a group, so an empty list never
      // shows while the outlines that decide access are still loading.
      next.settled = false;
      // Drops an unsaved placeholder even when its course stays listed (#683
      // leaves that open). Its course is only known through the previous
      // scope's index, and the new response can differ from it, so the
      // placeholder would need re-validating either way; a discard is the
      // predictable outcome. A saved focus is kept: `courseKeyOfFocus` finds no
      // course for a group outside the scope, and it shows again once its page is listed.
      const hasPlaceholderFocus = state.focus !== null && state.focus.ruleKey === null;
      return hasPlaceholderFocus
        ? reducePlaceholderAction({ ...next, placeholderDuplicateRejected: false }, { type: 'discardPlaceholder' })
        : next;
    }
    case 'focusGroup':
      if (state.focus?.groupId === action.groupId) {
        return state.pendingCourseId === null ? state : { ...state, pendingCourseId: null };
      }
      return { ...state, focus: { groupId: action.groupId, ruleKey: action.ruleKey }, pendingCourseId: null };
    case 'focusRuleBox':
      return { ...state, focus: { groupId: action.groupId, ruleKey: action.ruleKey }, pendingCourseId: null };
    case 'setFocus':
      return { ...state, focus: action.focus };
    case 'addPlaceholderRuleBox':
    case 'addPlaceholderGroup':
    case 'setPlaceholderLogicOperator':
    case 'discardPlaceholder':
    case 'setPlaceholderRulePayload':
      return reducePlaceholderAction(state, action);
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

function providerReducer(state: ProviderState, action: ProviderAction): ProviderState {
  if (action.type === 'placeholderDuplicateRejected') {
    return {
      ...state,
      placeholderDuplicateRejected: true,
      placeholderDuplicateRejectionCount: state.placeholderDuplicateRejectionCount + 1,
    };
  }
  const next = clearJustAddedOnFocusMove(state, reduceProviderState(state, action));
  const clears = PLACEHOLDER_REJECTION_CLEARING_ACTIONS.has(action.type)
    || (action.type === 'pendingCourseResolved' && action.focus !== null);
  return clears && next.placeholderDuplicateRejected ? { ...next, placeholderDuplicateRejected: false } : next;
}

/** Provides per-competency criteria-association state to the course panel.
 *
 * Not remounted per competency (no `key={tagId}`), so the content panel keeps
 * its own state; a `tagId` change instead resets focus during render. Expanded
 * courses persist across competencies.
 *
 * Owns the course list: its query and its page, search and date-range state,
 * which persist across competencies. The groups are scoped to the listed courses.
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
    placeholder: initialPlaceholder,
    placeholderDuplicateRejected: false,
    placeholderDuplicateRejectionCount: 0,
    pendingCourseId: null,
    initialFocusDone: false,
    settled: false,
    scopeCourseKeys: undefined,
  });
  const {
    focus,
    placeholder,
    placeholderDuplicateRejected,
    placeholderDuplicateRejectionCount,
    generation,
    pendingCourseId,
    initialFocusDone,
    settled,
  } = state;
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(new Set());
  const [expansionCountByCourseId, setExpansionCountByCourseId] = useState<Record<string, number>>({});

  // The page, search and date range are one state object so a render never pairs a new filter with the old page.
  const [courseListParams, setCourseListParams] = useState(initialCourseListParams);
  const { page: coursePage, search: courseSearch, dateRange: courseDateRange } = courseListParams;
  const setCoursePage = useCallback((page: number) => {
    setCourseListParams((prev) => ({ ...prev, page }));
  }, []);
  const setCourseSearch = useCallback((search: string) => {
    setCourseListParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);
  const setCourseDateRange = useCallback((dateRange: CourseDateRange) => {
    setCourseListParams((prev) => ({ ...prev, dateRange, page: 1 }));
  }, []);

  // `keepPreviousData` keeps the previous page as `data` while new parameters load, so a reload that lists the
  // same courses leaves the keys, and with them the groups query key, untouched: the groups never go pending and
  // the course cards keep their local state.
  const courseListQuery = useStudioHomeCoursesV2({
    page: coursePage,
    pageSize: PAGE_SIZE,
    search: courseSearch,
    order: 'display_name',
    startDateOnOrAfter: courseDateRange[0] ? formatLocalDayBoundary(courseDateRange[0], 'start') : undefined,
    startDateOnOrBefore: courseDateRange[1] ? formatLocalDayBoundary(courseDateRange[1], 'end') : undefined,
  }, { keepPreviousData: true });
  const courseListData = courseListQuery.data;
  const courses = useMemo(() => courseListData?.results.courses ?? [], [courseListData]);
  const listedCourseKeys = useMemo(
    () => (courseListData ? courses.map((course) => course.courseKey) : undefined),
    [courseListData, courses],
  );
  const courseList = useMemo<CourseList>(() => ({
    courses,
    numPages: courseListData?.numPages ?? 0,
    isLoading: courseListQuery.isLoading,
    isPlaceholderData: courseListQuery.isPlaceholderData,
    isError: courseListQuery.isError,
    isSuccess: courseListQuery.isSuccess,
  }), [
    courses,
    courseListData,
    courseListQuery.isLoading,
    courseListQuery.isPlaceholderData,
    courseListQuery.isError,
    courseListQuery.isSuccess,
  ]);

  // Both changes are applied during render, so the render that first sees the new data still has consistent
  // state: a competency change resets focus, a change of the listed courses starts a new scope.
  const competencyChanged = tagId !== state.tagId;
  if (competencyChanged) {
    dispatch({ type: 'competencyChanged', tagId });
  }
  const scopeChanged = listedCourseKeys !== undefined && !isEqual(listedCourseKeys, state.scopeCourseKeys);
  if (scopeChanged) {
    dispatch({ type: 'scopeChanged', courseKeys: listedCourseKeys });
  }
  // The rest of this render reads state that is about to be replaced, so the effects-in-render below skip it; the
  // immediate re-render runs them.
  const isStateOutdated = competencyChanged || scopeChanged;

  const groupsQuery = useCompetencyCriteriaGroups(tagId, listedCourseKeys);
  const profileQuery = useDefaultCompetencyRuleProfile();
  const { mutateAsync: createCriterion, isPending: isCreatePending, variables } = useCreateCompetencyCriterion();
  const isAssociating = isCreatePending && variables?.tagId === tagId;
  const { mutate: updateGroupOperatorMutate } = useUpdateCompetencyCriteriaGroupOperator();
  const { mutateAsync: updateRuleScoreMutateAsync } = useUpdateCompetencyCriteriaRule();

  const groupsIndex = useMemo(
    () => (groupsQuery.data ? buildCompetencyCriteriaGroupsIndex(groupsQuery.data) : undefined),
    [groupsQuery.data],
  );
  const systemDefaultProfile = profileQuery.data;
  const associatedIds = useMemo(
    () => (groupsQuery.data ? associatedObjectIds(groupsQuery.data) : new Set<string>()),
    [groupsQuery.data],
  );
  // `data` outlives a failed refetch under the same key, so after a write
  // whose refetch failed it holds the pre-write counts beside the panel's error.
  const countsData = groupsQuery.isError ? undefined : groupsQuery.data;
  const criteriaCount = countsData?.criteriaCount;
  const totalCriteriaCount = countsData?.totalCriteriaCount;
  const criteriaCounts = useMemo(
    () => (criteriaCount !== undefined && totalCriteriaCount !== undefined
      ? { criteriaCount, totalCriteriaCount }
      : undefined),
    [criteriaCount, totalCriteriaCount],
  );

  // Applied during render so the initial-focus effect below already sees it.
  // Skipped on a render that changes competency or scope: the pending course belongs
  // to the previous one, but `groupsIndex` may already be the new one's cached tree.
  if (!isStateOutdated && pendingCourseId !== null && groupsIndex && systemDefaultProfile) {
    dispatch({
      type: 'pendingCourseResolved',
      focus: courseExpansionFocus(pendingCourseId, focus, placeholder, groupsIndex, systemDefaultProfile),
    });
  }

  const notifyCourseExpanded = useCallback((courseId: string) => {
    setExpandedCourseIds((prev) => (prev.has(courseId) ? prev : new Set(prev).add(courseId)));
    setExpansionCountByCourseId((prev) => ({ ...prev, [courseId]: (prev[courseId] ?? 0) + 1 }));
    if (!groupsIndex || !systemDefaultProfile) {
      dispatch({ type: 'courseExpandedBeforeLoad', courseId });
      return;
    }
    const next = courseExpansionFocus(courseId, focus, placeholder, groupsIndex, systemDefaultProfile);
    if (next) {
      dispatch({ type: 'setFocus', focus: next });
    }
  }, [focus, placeholder, groupsIndex, systemDefaultProfile]);

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

  // A failed list hides the panel, and `status` follows it. A list that failed with no data leaves
  // `listedCourseKeys` undefined and the groups query skipped, which would otherwise read as `'pending'` for good.
  const error = courseListQuery.error ?? groupsQuery.error ?? profileQuery.error ?? outlines.error;
  let status: 'pending' | 'error' | 'success' = 'success';
  if (error) {
    status = 'error';
  } else if (!groupsIndex || !systemDefaultProfile || (!settled && outlines.isPending)) {
    status = 'pending';
  }
  // Skipped on a render that changes competency or scope, whose `settled` still belongs to the previous one.
  if (!isStateOutdated && !settled && status === 'success') {
    dispatch({ type: 'settled' });
  }

  const resolvedRuleKey = !isStateOutdated && focus && groupsIndex && systemDefaultProfile
    ? resolveStaleRuleKey(focus, groupsIndex, systemDefaultProfile)
    : undefined;
  if (focus?.groupId != null && resolvedRuleKey !== undefined) {
    dispatch({ type: 'ruleKeyResolved', groupId: focus.groupId, staleRuleKey: focus.ruleKey, resolvedRuleKey });
  }

  if (!isStateOutdated && groupsIndex && isPlaceholderOrphaned(focus, placeholder, groupsIndex)) {
    dispatch({ type: 'discardPlaceholder' });
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

  const {
    addPlaceholderRuleBox,
    addPlaceholderGroup,
    setPlaceholderLogicOperator,
    setPlaceholderRulePayload,
    discardPlaceholder,
  } = usePlaceholderActions(dispatch);

  const hasPlaceholder = focus !== null && focus.ruleKey === null;

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

    // Focus in another course resolves to that course's last group, so the placeholder score does not apply there.
    const isFocusInCourse = courseKeyOfFocus(focus, placeholder, groupsIndex) === courseId;
    const target = isFocusInCourse
      ? focus
      : courseExpansionFocus(courseId, focus, placeholder, groupsIndex, systemDefaultProfile);
    const targetPlaceholder = isFocusInCourse ? placeholder : { ...placeholder, rulePayload: null };
    const resolved = resolveCreateTarget(courseId, target, targetPlaceholder, groupsIndex, systemDefaultProfile);
    if (resolved.kind === 'duplicate') {
      dispatch({ type: 'placeholderDuplicateRejected' });
      return;
    }
    if (target && target !== focus) {
      dispatch({ type: 'setFocus', focus: target });
    }

    const payload: CreateCompetencyCriterionPayload = { object_id: objectId, ...resolved.fields };

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
    placeholder,
    tagId,
    generation,
    createCriterion,
    showToast,
    intl,
  ]);

  const updateGroupOperator = useCallback((groupId: number, logicOperator: CompetencyGroupLogicOperator) => {
    updateGroupOperatorMutate({ tagId, groupId, logicOperator }, {
      // `LogicOperatorSelect` renders from `group.logicOperator`, which a rejected mutation never touches.
      onError: () => {
        showToast(intl.formatMessage(messages.updateGroupOperatorFailedToastMessage), undefined, undefined, ErrorIcon);
      },
    });
  }, [tagId, updateGroupOperatorMutate, showToast, intl]);

  const updateRuleScore = useCallback((
    groupId: number,
    criterionIds: number[],
    rulePayload: GradeRulePayload,
  ): Promise<void> => {
    if (!groupsIndex || !systemDefaultProfile) {
      // A rule box is only editable once both queries have resolved, so this is a narrowing guard.
      throw new Error('updateRuleScore called before the groups index and system default profile were loaded.');
    }
    // Every criterion in a rule box shares its effective rule, so any one of them gives the rule type.
    const anchorCriterion = (groupsIndex.criteriaByGroupId.get(groupId) ?? [])
      .find((criterion) => criterionIds.includes(criterion.id));
    if (!anchorCriterion) {
      // Defensive guard, not an expected runtime path: `criterionIds` always comes from this
      // same group's own rendered rule box.
      throw new Error(`updateRuleScore: no criterion in group ${groupId} matched the given criterionIds.`);
    }
    const { ruleType } = effectiveRuleOf(anchorCriterion, systemDefaultProfile);

    return updateRuleScoreMutateAsync({ tagId, groupId, criterionIds, ruleType, rulePayload })
      .then((updatedCriteria) => {
        // Keyed from the response: a "reset to default" edit can echo back a shared profile reference.
        const [updatedCriterion] = updatedCriteria;
        if (updatedCriterion) {
          dispatch({
            type: 'setFocus',
            focus: { groupId, ruleKey: ruleKeyOf(updatedCriterion, systemDefaultProfile) },
          });
        }
      })
      .catch((updateError) => {
        showToast(intl.formatMessage(messages.updateRuleScoreFailedToastMessage), undefined, undefined, ErrorIcon);
        throw updateError;
      });
  }, [groupsIndex, systemDefaultProfile, tagId, updateRuleScoreMutateAsync, showToast, intl]);

  const contextValue = useMemo<CompetencyAssociationsContextValue>(() => {
    const shared: CompetencyAssociationsContextBase = {
      error,
      focus,
      placeholder,
      hasPlaceholder,
      addPlaceholderRuleBox,
      addPlaceholderGroup,
      setPlaceholderLogicOperator,
      setPlaceholderRulePayload,
      discardPlaceholder,
      placeholderDuplicateRejected,
      placeholderDuplicateRejectionCount,
      focusGroup,
      focusRuleBox,
      notifyCourseExpanded,
      associateSubsection,
      updateGroupOperator,
      updateRuleScore,
      isAssociating,
      expansionCountByCourseId,
      hasPermissionsError,
      canEditCourse,
      associatedObjectIds: associatedIds,
      accessibleCourseGroups,
      competencyExternalId,
      courseList,
      coursePage,
      courseSearch,
      courseDateRange,
      setCoursePage,
      setCourseSearch,
      setCourseDateRange,
      criteriaCounts,
    };
    if (status === 'success' && groupsIndex && systemDefaultProfile) {
      return { ...shared, status, groupsIndex, systemDefaultProfile };
    }
    return { ...shared, status: status === 'error' ? 'error' : 'pending', groupsIndex, systemDefaultProfile };
  }, [
    status,
    error,
    focus,
    placeholder,
    hasPlaceholder,
    addPlaceholderRuleBox,
    addPlaceholderGroup,
    setPlaceholderLogicOperator,
    setPlaceholderRulePayload,
    discardPlaceholder,
    placeholderDuplicateRejected,
    placeholderDuplicateRejectionCount,
    focusGroup,
    focusRuleBox,
    notifyCourseExpanded,
    associateSubsection,
    updateGroupOperator,
    updateRuleScore,
    isAssociating,
    expansionCountByCourseId,
    hasPermissionsError,
    canEditCourse,
    groupsIndex,
    systemDefaultProfile,
    associatedIds,
    accessibleCourseGroups,
    competencyExternalId,
    courseList,
    coursePage,
    courseSearch,
    courseDateRange,
    setCoursePage,
    setCourseSearch,
    setCourseDateRange,
    criteriaCounts,
  ]);

  return (
    <CompetencyAssociationsContext.Provider value={contextValue}>
      {children}
    </CompetencyAssociationsContext.Provider>
  );
};
