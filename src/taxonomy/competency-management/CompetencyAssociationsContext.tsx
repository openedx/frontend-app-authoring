import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { Error as ErrorIcon, InfoOutline } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useQueries, useQueryClient } from '@tanstack/react-query';
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
  competencyQueryKeys,
  useCompetencyBlockedCourses,
  useCompetencyCriteriaGroups,
  useCourseTaggingPermissions,
  useCreateCompetencyCriterion,
  useDefaultCompetencyRuleProfile,
  useDeleteCompetencyCriteriaGroup,
  useDeleteCompetencyCriterion,
  useDeleteCompetencyRuleBox,
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
import type { RemovalFailure } from './constants';
import { courseKeyOfSelection, resolveCreateTarget } from './criterionTarget';
import messages from './messages';
import {
  clearJustAddedOnSelectionMove,
  initialPlaceholder,
  isPlaceholderOrphaned,
  PLACEHOLDER_REJECTION_CLEARING_ACTIONS,
  reducePlaceholderAction,
  usePlaceholderActions,
} from './placeholderState';
import type { CriteriaPlaceholder, PlaceholderAction } from './placeholderState';
import { useRemovalConfirmation } from './useRemovalConfirmation';
import type {
  CompetencyCriteriaGroupsIndex,
  PageOrderSnapshot,
  RemovalSummary,
  RemovalTarget,
} from './utils';
import {
  associatedObjectIds,
  bottomTierGroupsForCourse,
  buildCompetencyCriteriaGroupsIndex,
  effectiveRuleOf,
  firstGroupOfNewCourse,
  selectionTargetAfterRemoval,
  lastBottomTierGroupForCourse,
  lastRuleKeyIn,
  ruleBoxesForGroup,
  ruleKeyAfterRemoval,
  ruleKeyOf,
  snapshotPageOrder,
  visibleCourseGroups,
} from './utils';

export type { CriteriaPlaceholder };

/** The rule box or group the author is working in; `ruleKey` is a rule box's key within its group.
 * `ruleKey === null` is an unsaved placeholder rule box in the group, and `groupId === null` is an unsaved
 * placeholder group under `placeholder.parentRuleGroupId`. A non-null `ruleKey` that matches no box re-resolves
 * to the group's last box, or to `null` for a saved group with no criteria, which then renders its placeholder
 * rule box on purpose.
 */
export interface CriteriaSelection {
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
/** A one-shot request for the browser's keyboard focus, left by a delete whose control is gone or disabled. `group`
 * names the bottom-tier card that takes it, `menu` the group whose menu toggle takes it after a failed delete, `empty`
 * the "no associations" message, and `subsection` the content panel's row for `objectId`.
 *
 * `selectionMoved` on a `group` request is true when selection moved to the card, so the card does not scroll to itself
 * because its rule box does.
 */
export type KeyboardFocusRequest =
  | { kind: 'group'; groupId: number; selectionMoved: boolean; }
  | { kind: 'menu'; groupId: number; }
  | { kind: 'empty'; }
  | { kind: 'subsection'; objectId: string; };

/** Where focus goes after one association is removed: back to the Courses & Content row it was removed from, else to
 * its group's header while the group still exists. `null` keeps the request `resolveSelectionAfterDelete` made. */
const focusRequestAfterAssociationRemoval = (
  returnFocusTo: 'group' | 'subsection',
  objectId: string,
  groupId: number,
  isGroupStillPresent: boolean,
): KeyboardFocusRequest | null => {
  if (returnFocusTo === 'subsection') {
    return { kind: 'subsection', objectId };
  }
  return isGroupStillPresent ? { kind: 'group', groupId, selectionMoved: false } : null;
};

/** A removal awaiting confirmation. */
export interface PendingRemoval {
  target: RemovalTarget;
  summary: RemovalSummary;
  failure: RemovalFailure | null;
}

export interface CompetencyAssociationsContextBase {
  /** The course list or profile failure, a groups failure before any groups loaded, or the first course-outline
   * failure other than a 403 or 404, behind `status === 'error'`.
   */
  error: Error | null;
  selection: CriteriaSelection | null;
  placeholder: CriteriaPlaceholder;
  /** Whether a placeholder rule box or group exists, which disables both add controls. Also true for a selected
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
  /** Drops the placeholder by clearing `selection`. */
  discardPlaceholder: () => void;
  /** True while a group, rule box, or criterion is being deleted, or while the refetch after the delete is in flight.
   * It disables every delete control, the "+ Rule" and "+ Rule Group" controls, and the content panel's subsection pills.
   */
  isDeletingGroupOrRuleBoxOrCriterion: boolean;
  /** The removal awaiting confirmation, or `null` while no dialog is open. */
  pendingRemoval: PendingRemoval | null;
  /** Opens the confirmation for one removal without sending a request. Ignored while a delete is in flight or an
   * association is being created, or when the loaded data no longer has the target.
   */
  requestRemoval: (target: RemovalTarget) => void;
  /** Runs the pending removal. Closes the dialog on success, and on failure leaves it open with `failure` set so a
   * second call retries. Ignored while a delete is in flight or an association is being created.
   */
  confirmRemoval: () => Promise<void>;
  /** Closes the confirmation without a request. */
  cancelRemoval: () => void;
  /** Discards the placeholder group without a request and selects the last saved group in its course group. */
  discardPlaceholderGroup: () => void;
  /** Discards a saved group's placeholder rule box without a request; selection returns to the box above it. */
  discardPlaceholderRuleBox: () => void;
  keyboardFocusRequest: KeyboardFocusRequest | null;
  /** Clears `keyboardFocusRequest` once the component it names has taken it. */
  consumeKeyboardFocusRequest: () => void;
  /** Selects a group and its last rule box. A no-op when `groupId` is already
   * selected, so re-clicking the group heading keeps the rule box the author
   * selected inside it.
   */
  selectGroup: (groupId: number) => void;
  selectRuleBox: (groupId: number, ruleKey: string) => void;
  /** Call when a course row expands, never when it collapses. Feeds `canEditCourse`
   * for a group-less course and moves selection to the course's last group and rule box
   * when selection is unset or on another course's group.
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
   * expansion that leaves selection where it already was.
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
  /** The ancestor or descendant competency that blocks the given listed course, or
   * `undefined` when the course is not blocked or the lookup is still
   * loading or failed, so selection fails open (the backend still rejects).
   */
  conflictingCompetencyName: (courseId: string) => string | undefined;
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
  /** The active competency's name, for the course group menu's "Remove from" item. */
  competencyName: string;
}

/** Discriminated on `status`. `groupsIndex` and `systemDefaultProfile` are
 * always defined when `status` is `'success'`, and may be missing otherwise.
 *
 * `'pending'` until the course list, the groups, the default rule profile and
 * every course outline have settled, then `'success'` until the competency or the set of
 * listed courses changes, even when a later groups refetch adds a course whose
 * outline has not loaded yet. `'error'` if the course list, the profile or any course
 * outline failed, including a failure after `'success'`, or if the groups failed before
 * any groups data loaded. A groups refetch that fails after data loaded keeps the last
 * loaded groups and `status`. An outline that fails with a 403 or 404 only hides its
 * course and does not affect `status`.
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
  competencyName: string;
  competencyExternalId: string | null;
  children: ReactNode;
}

/** A 403 or 404 on a course outline means the author cannot see that course. */
function isInaccessibleCourseError(error: unknown): boolean {
  return isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404);
}

/** The selection to move to when `courseId` is expanded, or `null` when selection
 * already sits on one of that course's groups or the course has no group.
 */
function courseExpansionSelection(
  courseId: string,
  selection: CriteriaSelection | null,
  placeholder: CriteriaPlaceholder,
  index: CompetencyCriteriaGroupsIndex,
  systemDefaultProfile: CompetencyRuleProfile,
): CriteriaSelection | null {
  if (courseKeyOfSelection(selection, placeholder, index) === courseId) {
    return null;
  }
  const target = lastBottomTierGroupForCourse(index, courseId);
  return target ? { groupId: target.id, ruleKey: lastRuleKeyIn(target.id, index, systemDefaultProfile) } : null;
}

/** The rule key to move selection to when the selected key matches no rule box, or `undefined` when selection is fine. */
function resolveStaleRuleKey(
  selection: CriteriaSelection,
  index: CompetencyCriteriaGroupsIndex,
  systemDefaultProfile: CompetencyRuleProfile,
): string | null | undefined {
  // A `null` key is a placeholder rule box, which matches no real one by design.
  if (selection.groupId === null || selection.ruleKey === null || !index.groupsById.has(selection.groupId)) {
    return undefined;
  }
  // A rule box is keyed by its rule, so a refetch or a default-profile change can leave the key stale.
  const hasSelectedBox = ruleBoxesForGroup(selection.groupId, index, systemDefaultProfile)
    .some((box) => box.key === selection.ruleKey);
  if (hasSelectedBox) {
    return undefined;
  }
  const resolved = lastRuleKeyIn(selection.groupId, index, systemDefaultProfile);
  return resolved === selection.ruleKey ? undefined : resolved;
}

export interface ProviderState {
  tagId: number;
  /** Bumped on every competency change, so an in-flight create can tell the
   * author left and came back, which a `tagId` comparison cannot.
   */
  generation: number;
  selection: CriteriaSelection | null;
  placeholder: CriteriaPlaceholder;
  placeholderDuplicateRejected: boolean;
  placeholderDuplicateRejectionCount: number;
  keyboardFocusRequest: KeyboardFocusRequest | null;
  /** A course expanded before the groups and default profile loaded. */
  pendingCourseId: string | null;
  /** The page order from before a delete that left no visible group while a new course group's outline was still
   * loading, so the first group of the new course can take selection once the outline settles.
   */
  pendingNewCourseSnapshot: PageOrderSnapshot | null;
  initialSelectionDone: boolean;
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
  | { type: 'selectGroup'; groupId: number; ruleKey: string | null; }
  | { type: 'selectRuleBox'; groupId: number; ruleKey: string; }
  | { type: 'setSelection'; selection: CriteriaSelection; }
  | PlaceholderAction
  | { type: 'placeholderDuplicateRejected'; }
  | {
    type: 'groupDeleted';
    generation: number;
    snapshot: PageOrderSnapshot;
    freshIndex: CompetencyCriteriaGroupsIndex;
    /** The course keys, among those in `freshIndex`, whose course outline has loaded. */
    accessibleCourseKeys: ReadonlySet<string>;
    deletedGroupId: number;
    deleteFailed: boolean;
    /** Whether a course group added since the snapshot has an outline that is neither loaded nor failed. */
    hasUnsettledNewCourse: boolean;
    systemDefaultProfile: CompetencyRuleProfile;
    /** The dialog that held keyboard focus closed after a successful rule box delete, and the ⋮ toggle that opened it is
     * disabled for the run, so the browser dropped its focus even if the group survives.
     */
    triggerLosesKeyboardFocus: boolean;
  }
  | { type: 'deleteRefetchFailed'; generation: number; }
  | {
    type: 'placeholderDiscarded';
    selection: CriteriaSelection | null;
    keyboardFocusRequest: KeyboardFocusRequest | null;
  }
  | { type: 'keyboardFocusRequestConsumed'; }
  | { type: 'keyboardFocusRequested'; generation: number; keyboardFocusRequest: KeyboardFocusRequest; }
  | { type: 'ruleKeyResolved'; groupId: number; staleRuleKey: string | null; resolvedRuleKey: string | null; }
  | { type: 'createSucceeded'; generation: number; selection: CriteriaSelection; }
  | { type: 'courseExpandedBeforeLoad'; courseId: string; }
  | { type: 'pendingCourseResolved'; selection: CriteriaSelection | null; }
  | {
    type: 'newCourseResolved';
    selection: CriteriaSelection | null;
    keyboardFocusRequest: KeyboardFocusRequest;
  }
  | { type: 'initialSelectionRan'; selection: CriteriaSelection | null; }
  | { type: 'settled'; };

/** Selects the group's FIRST rule box, unlike `selectGroup`, which selects the last. */
function selectionOnFirstRuleBox(
  groupId: number,
  index: CompetencyCriteriaGroupsIndex,
  systemDefaultProfile: CompetencyRuleProfile,
): CriteriaSelection {
  return { groupId, ruleKey: ruleBoxesForGroup(groupId, index, systemDefaultProfile)[0]?.key ?? null };
}

function moveSelection(
  state: ProviderState,
  selection: CriteriaSelection | null,
  keyboardFocusRequest: KeyboardFocusRequest | null,
): ProviderState {
  return { ...state, selection, placeholderDuplicateRejected: false, keyboardFocusRequest };
}

/** The request for the keyboard focus a vanished ⋮ toggle leaves behind when selection does not move: the empty state if
 * no accessible group remains, else the nearest surviving neighbor of the deleted group.
 */
function keyboardRequestWithoutSelectionMove(
  snapshot: PageOrderSnapshot,
  freshIndex: CompetencyCriteriaGroupsIndex,
  accessibleCourseKeys: ReadonlySet<string>,
  deletedGroupId: number,
): KeyboardFocusRequest | null {
  const hasAccessibleGroup = visibleCourseGroups(freshIndex, accessibleCourseKeys)
    .some((courseGroup) => bottomTierGroupsForCourse(freshIndex, courseGroup.courseKey).length > 0);
  if (!hasAccessibleGroup) {
    return { kind: 'empty' };
  }
  const neighbor = selectionTargetAfterRemoval(
    snapshot,
    freshIndex,
    { groupId: deletedGroupId, ruleKey: null },
    null,
    accessibleCourseKeys,
  );
  return typeof neighbor === 'number' ? { kind: 'group', groupId: neighbor, selectionMoved: false } : null;
}

/** Resolves selection against the state at settle time, so a click made while the request was in flight is respected. */
function reduceGroupDeleted(
  state: ProviderState,
  action: Extract<ProviderAction, { type: 'groupDeleted'; }>,
): ProviderState {
  const {
    snapshot,
    freshIndex,
    accessibleCourseKeys,
    deletedGroupId,
    deleteFailed,
    hasUnsettledNewCourse,
    systemDefaultProfile,
    triggerLosesKeyboardFocus,
  } = action;
  const target = selectionTargetAfterRemoval(
    snapshot,
    freshIndex,
    state.selection,
    state.placeholder.parentRuleGroupId,
    accessibleCourseKeys,
  );
  const isDeletedGroupGone = !freshIndex.groupsById.has(deletedGroupId);
  // A vanished group strands the browser's focus, and so does a disabled trigger. A failed delete keeps its menu
  // toggle, which was disabled during the request and may have lost focus.
  const isKeyboardFocusLost = isDeletedGroupGone || triggerLosesKeyboardFocus;
  const menuRequest: KeyboardFocusRequest | null = deleteFailed && !isDeletedGroupGone
    ? { kind: 'menu', groupId: deletedGroupId }
    : null;
  const requestWithoutSelectionMove = () => (
    isKeyboardFocusLost
      ? keyboardRequestWithoutSelectionMove(snapshot, freshIndex, accessibleCourseKeys, deletedGroupId)
      : menuRequest
  );

  if (target === 'keep-current') {
    // The selected group takes focus; with nothing or a placeholder group selected, the deleted group does if it
    // survives.
    const keyboardGroupId = state.selection?.groupId ?? (isDeletedGroupGone ? null : deletedGroupId);
    if (isKeyboardFocusLost && keyboardGroupId !== null) {
      return { ...state, keyboardFocusRequest: { kind: 'group', groupId: keyboardGroupId, selectionMoved: false } };
    }
    const keyboardFocusRequest = requestWithoutSelectionMove();
    return keyboardFocusRequest ? { ...state, keyboardFocusRequest } : state;
  }
  if (target === null && hasUnsettledNewCourse) {
    // Neither selection nor the empty state's focus request is settled until that outline loads.
    return { ...moveSelection(state, null, null), pendingNewCourseSnapshot: snapshot };
  }
  if (target === null) {
    // The panel is empty only if the fresh data has no accessible group: the selected group can also be missing from
    // the snapshot.
    return moveSelection(state, null, requestWithoutSelectionMove());
  }
  return moveSelection(
    state,
    selectionOnFirstRuleBox(target, freshIndex, systemDefaultProfile),
    isKeyboardFocusLost ? { kind: 'group', groupId: target, selectionMoved: true } : menuRequest,
  );
}

function reduceProviderState(state: ProviderState, action: ProviderAction): ProviderState {
  switch (action.type) {
    case 'competencyChanged':
      return {
        tagId: action.tagId,
        generation: state.generation + 1,
        selection: null,
        placeholder: initialPlaceholder,
        placeholderDuplicateRejected: false,
        placeholderDuplicateRejectionCount: 0,
        keyboardFocusRequest: null,
        pendingCourseId: null,
        pendingNewCourseSnapshot: null,
        initialSelectionDone: false,
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
      // A pending new course is any course group missing from the delete's snapshot, which a new scope makes meaningless.
      next.pendingNewCourseSnapshot = null;
      // Drops an unsaved placeholder even when its course stays listed (#683
      // leaves that open). Its course is only known through the previous
      // scope's index, and the new response can differ from it, so the
      // placeholder would need re-validating either way; a discard is the
      // predictable outcome. A saved selection is kept: `courseKeyOfSelection` finds no
      // course for a group outside the scope, and it shows again once its page is listed.
      const hasPlaceholderSelection = state.selection !== null && state.selection.ruleKey === null;
      return hasPlaceholderSelection
        ? reducePlaceholderAction({ ...next, placeholderDuplicateRejected: false }, { type: 'discardPlaceholder' })
        : next;
    }
    case 'selectGroup':
      if (state.selection?.groupId === action.groupId) {
        return state.pendingCourseId === null ? state : { ...state, pendingCourseId: null };
      }
      return { ...state, selection: { groupId: action.groupId, ruleKey: action.ruleKey }, pendingCourseId: null };
    case 'selectRuleBox':
      return { ...state, selection: { groupId: action.groupId, ruleKey: action.ruleKey }, pendingCourseId: null };
    case 'setSelection':
      return { ...state, selection: action.selection };
    case 'groupDeleted':
      return action.generation === state.generation ? reduceGroupDeleted(state, action) : state;
    case 'deleteRefetchFailed':
      // The loaded groups may predate the delete, so selection is cleared instead of resolved against them.
      return action.generation === state.generation ? moveSelection(state, null, null) : state;
    case 'placeholderDiscarded':
      return moveSelection(state, action.selection, action.keyboardFocusRequest);
    case 'keyboardFocusRequestConsumed':
      return { ...state, keyboardFocusRequest: null };
    case 'keyboardFocusRequested':
      return action.generation === state.generation
        ? { ...state, keyboardFocusRequest: action.keyboardFocusRequest }
        : state;
    case 'addPlaceholderRuleBox':
    case 'addPlaceholderGroup':
    case 'setPlaceholderLogicOperator':
    case 'discardPlaceholder':
    case 'setPlaceholderRulePayload':
      return reducePlaceholderAction(state, action);
    case 'ruleKeyResolved':
      // Guarded so an action computed from a stale selection cannot overwrite a selection dispatched after it.
      return state.selection?.groupId === action.groupId && state.selection.ruleKey === action.staleRuleKey
        ? { ...state, selection: { groupId: action.groupId, ruleKey: action.resolvedRuleKey } }
        : state;
    case 'createSucceeded':
      return action.generation === state.generation ? { ...state, selection: action.selection } : state;
    case 'courseExpandedBeforeLoad':
      return { ...state, pendingCourseId: action.courseId };
    case 'pendingCourseResolved':
      return { ...state, pendingCourseId: null, selection: action.selection ?? state.selection };
    case 'newCourseResolved':
      // A selection made while the outline loaded wins.
      return state.selection === null
        ? { ...moveSelection(state, action.selection, action.keyboardFocusRequest), pendingNewCourseSnapshot: null }
        : { ...state, pendingNewCourseSnapshot: null };
    case 'initialSelectionRan':
      // A selection set before the gate opened wins over the auto-selection.
      return state.selection === null && action.selection !== null
        ? { ...state, initialSelectionDone: true, selection: action.selection, pendingCourseId: null }
        : { ...state, initialSelectionDone: true };
    case 'settled':
      return { ...state, settled: true };
    default:
      return state;
  }
}

/** Actions that move the selection for a reason other than a delete, which drops a pending keyboard focus request. */
const KEYBOARD_REQUEST_CLEARING_ACTIONS: ReadonlySet<ProviderAction['type']> = new Set([
  'competencyChanged',
  'selectGroup',
  'selectRuleBox',
  'setSelection',
  'addPlaceholderRuleBox',
  'addPlaceholderGroup',
  'discardPlaceholder',
]);

function providerReducer(state: ProviderState, action: ProviderAction): ProviderState {
  if (action.type === 'placeholderDuplicateRejected') {
    return {
      ...state,
      placeholderDuplicateRejected: true,
      placeholderDuplicateRejectionCount: state.placeholderDuplicateRejectionCount + 1,
    };
  }
  let next = clearJustAddedOnSelectionMove(state, reduceProviderState(state, action));
  const movesSelection = action.type === 'pendingCourseResolved' && action.selection !== null;
  if (
    (PLACEHOLDER_REJECTION_CLEARING_ACTIONS.has(action.type) || movesSelection) && next.placeholderDuplicateRejected
  ) {
    next = { ...next, placeholderDuplicateRejected: false };
  }
  if ((KEYBOARD_REQUEST_CLEARING_ACTIONS.has(action.type) || movesSelection) && next.keyboardFocusRequest) {
    next = { ...next, keyboardFocusRequest: null };
  }
  return next;
}

/** Provides per-competency criteria-association state to the course panel.
 *
 * Not remounted per competency (no `key={tagId}`), so the content panel keeps
 * its own state; a `tagId` change instead resets selection during render. Expanded
 * courses persist across competencies.
 *
 * Owns the course list: its query and its page, search and date-range state,
 * which persist across competencies. The groups are scoped to the listed courses.
 */
export const CompetencyAssociationsProvider = ({
  tagId,
  competencyName,
  competencyExternalId,
  children,
}: CompetencyAssociationsProviderProps) => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();

  const [state, dispatch] = useReducer(providerReducer, {
    tagId,
    generation: 0,
    selection: null,
    placeholder: initialPlaceholder,
    placeholderDuplicateRejected: false,
    placeholderDuplicateRejectionCount: 0,
    keyboardFocusRequest: null,
    pendingCourseId: null,
    pendingNewCourseSnapshot: null,
    initialSelectionDone: false,
    settled: false,
    scopeCourseKeys: undefined,
  });
  const {
    selection,
    placeholder,
    placeholderDuplicateRejected,
    placeholderDuplicateRejectionCount,
    keyboardFocusRequest,
    generation,
    pendingCourseId,
    pendingNewCourseSnapshot,
    initialSelectionDone,
    settled,
  } = state;
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
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
  // state: a competency change resets selection, a change of the listed courses starts a new scope.
  const competencyChanged = tagId !== state.tagId;
  if (competencyChanged) {
    dispatch({ type: 'competencyChanged', tagId });
    setPendingRemoval(null);
  }
  const scopeChanged = listedCourseKeys !== undefined && !isEqual(listedCourseKeys, state.scopeCourseKeys);
  if (scopeChanged) {
    dispatch({ type: 'scopeChanged', courseKeys: listedCourseKeys });
  }
  // The rest of this render reads state that is about to be replaced, so the effects-in-render below skip it; the
  // immediate re-render runs them.
  const isStateOutdated = competencyChanged || scopeChanged;

  const groupsQuery = useCompetencyCriteriaGroups(tagId, listedCourseKeys);
  const blockedCoursesQuery = useCompetencyBlockedCourses(tagId, listedCourseKeys);
  const profileQuery = useDefaultCompetencyRuleProfile();
  const { mutateAsync: createCriterion, isPending: isCreatePending, variables } = useCreateCompetencyCriterion();
  const isAssociating = isCreatePending && variables?.tagId === tagId;
  const { mutate: updateGroupOperatorMutate } = useUpdateCompetencyCriteriaGroupOperator();
  const { mutateAsync: updateRuleScoreMutateAsync } = useUpdateCompetencyCriteriaRule();
  const {
    mutateAsync: mutateDeleteGroup,
    isPending: isGroupDeletePending,
    variables: groupDeleteVariables,
  } = useDeleteCompetencyCriteriaGroup();
  const {
    mutateAsync: mutateDeleteCriterion,
    isPending: isCriterionDeletePending,
    variables: criterionDeleteVariables,
  } = useDeleteCompetencyCriterion();
  const {
    mutateAsync: mutateDeleteRuleBox,
    isPending: isRuleBoxDeletePending,
    variables: ruleBoxDeleteVariables,
  } = useDeleteCompetencyRuleBox();
  const isDeletingGroupOrRuleBoxOrCriterion = (isGroupDeletePending && groupDeleteVariables?.tagId === tagId)
    || (isCriterionDeletePending && criterionDeleteVariables?.tagId === tagId)
    || (isRuleBoxDeletePending && ruleBoxDeleteVariables?.tagId === tagId);
  // The latest generation, so a rule box delete that settles after a competency switch can tell it is stale.
  const generationRef = useRef(generation);
  useLayoutEffect(() => {
    generationRef.current = generation;
  }, [generation]);
  // Closes the gap between a click and the render that disables the delete menus. Holds the generation that started
  // the delete, so a delete still pending for the previous competency does not block this one.
  const deleteInFlightGenerationRef = useRef<number | null>(null);

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

  // Applied during render so the initial-selection effect below already sees it.
  // Skipped on a render that changes competency or scope: the pending course belongs
  // to the previous one, but `groupsIndex` may already be the new one's cached tree.
  if (!isStateOutdated && pendingCourseId !== null && groupsIndex && systemDefaultProfile) {
    dispatch({
      type: 'pendingCourseResolved',
      selection: courseExpansionSelection(pendingCourseId, selection, placeholder, groupsIndex, systemDefaultProfile),
    });
  }

  const notifyCourseExpanded = useCallback((courseId: string) => {
    setExpandedCourseIds((prev) => (prev.has(courseId) ? prev : new Set(prev).add(courseId)));
    setExpansionCountByCourseId((prev) => ({ ...prev, [courseId]: (prev[courseId] ?? 0) + 1 }));
    if (!groupsIndex || !systemDefaultProfile) {
      dispatch({ type: 'courseExpandedBeforeLoad', courseId });
      return;
    }
    const next = courseExpansionSelection(courseId, selection, placeholder, groupsIndex, systemDefaultProfile);
    if (next) {
      dispatch({ type: 'setSelection', selection: next });
    }
  }, [selection, placeholder, groupsIndex, systemDefaultProfile]);

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

  // Skipped on a render that changes competency or scope, whose snapshot belongs to the previous one.
  if (
    !isStateOutdated && pendingNewCourseSnapshot !== null && groupsIndex && systemDefaultProfile
    && !outlines.isPending
  ) {
    const target = firstGroupOfNewCourse(pendingNewCourseSnapshot, groupsIndex, new Set(outlines.accessibleCourseIds));
    dispatch({
      type: 'newCourseResolved',
      selection: target === undefined ? null : selectionOnFirstRuleBox(target, groupsIndex, systemDefaultProfile),
      keyboardFocusRequest: target === undefined
        ? { kind: 'empty' }
        : { kind: 'group', groupId: target, selectionMoved: true },
    });
  }

  // A failed list hides the panel, and `status` follows it. A list that failed with no data leaves
  // `listedCourseKeys` undefined and the groups query skipped, which would otherwise read as `'pending'` for good.
  // A groups refetch that fails after data loaded keeps the loaded groups, so an item whose delete failed stays
  // listed behind the removal dialog.
  const error = courseListQuery.error
    ?? (groupsQuery.data ? null : groupsQuery.error)
    ?? profileQuery.error
    ?? outlines.error;
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

  const resolvedRuleKey = !isStateOutdated && selection && groupsIndex && systemDefaultProfile
    ? resolveStaleRuleKey(selection, groupsIndex, systemDefaultProfile)
    : undefined;
  if (selection?.groupId != null && resolvedRuleKey !== undefined) {
    dispatch({ type: 'ruleKeyResolved', groupId: selection.groupId, staleRuleKey: selection.ruleKey, resolvedRuleKey });
  }

  if (!isStateOutdated && groupsIndex && isPlaceholderOrphaned(selection, placeholder, groupsIndex)) {
    dispatch({ type: 'discardPlaceholder' });
  }

  const selectGroup = useCallback((groupId: number) => {
    const ruleKey = (groupsIndex && systemDefaultProfile)
      ? lastRuleKeyIn(groupId, groupsIndex, systemDefaultProfile)
      : null;
    dispatch({ type: 'selectGroup', groupId, ruleKey });
  }, [groupsIndex, systemDefaultProfile]);

  const selectRuleBox = useCallback((groupId: number, ruleKey: string) => {
    dispatch({ type: 'selectRuleBox', groupId, ruleKey });
  }, []);

  const {
    addPlaceholderRuleBox,
    addPlaceholderGroup,
    setPlaceholderLogicOperator,
    setPlaceholderRulePayload,
    discardPlaceholder,
  } = usePlaceholderActions(dispatch);

  const hasPlaceholder = selection !== null && selection.ruleKey === null;

  // Runs once per competency, after groups, profile and every outline have
  // settled. An inaccessible course's group is not rendered, so it is never
  // auto-selection eligible. Independent of `expandedCourseIds`, which must not
  // delay it.
  useEffect(() => {
    if (initialSelectionDone || status !== 'success' || !groupsIndex || !systemDefaultProfile) {
      return;
    }
    const allBottomTierGroups = accessibleCourseGroups
      .flatMap((courseGroup) => bottomTierGroupsForCourse(groupsIndex, courseGroup.courseKey));
    dispatch({
      type: 'initialSelectionRan',
      selection: allBottomTierGroups.length === 1
        ? {
          groupId: allBottomTierGroups[0].id,
          ruleKey: lastRuleKeyIn(allBottomTierGroups[0].id, groupsIndex, systemDefaultProfile),
        }
        : null,
    });
  }, [initialSelectionDone, status, groupsIndex, systemDefaultProfile, accessibleCourseGroups]);

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

  const conflictingCompetencyName = useCallback(
    (courseId: string) => blockedCoursesQuery.data?.find((row) => row.courseKey === courseId)?.conflictingTagValue,
    [blockedCoursesQuery.data],
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

    // Selection in another course resolves to that course's last group, so the placeholder score does not apply there.
    const isSelectionInCourse = courseKeyOfSelection(selection, placeholder, groupsIndex) === courseId;
    const target = isSelectionInCourse
      ? selection
      : courseExpansionSelection(courseId, selection, placeholder, groupsIndex, systemDefaultProfile);
    const targetPlaceholder = isSelectionInCourse ? placeholder : { ...placeholder, rulePayload: null };
    const resolved = resolveCreateTarget(courseId, target, targetPlaceholder, groupsIndex, systemDefaultProfile);
    if (resolved.kind === 'duplicate') {
      dispatch({ type: 'placeholderDuplicateRejected' });
      return;
    }
    if (target && target !== selection) {
      dispatch({ type: 'setSelection', selection: target });
    }

    const payload: CreateCompetencyCriterionPayload = { object_id: objectId, ...resolved.fields };

    createCriterion({ tagId, payload }).then(
      (criterion) => {
        // Read from the response: this callback closed over the pre-create `groupsIndex`,
        // which does not know a brand-new criterion or group.
        dispatch({
          type: 'createSucceeded',
          generation,
          selection: { groupId: criterion.groupId, ruleKey: ruleKeyOf(criterion, systemDefaultProfile) },
        });
      },
      (createError: AxiosError) => {
        // A 400 with a `tag_id` field error is the backend's hierarchy check:
        // an ancestor or descendant competency already has criteria in this course.
        const { response } = createError;
        const isHierarchyConflict = response?.status === 400
          && typeof response.data === 'object' && response.data !== null && 'tag_id' in response.data;
        if (isHierarchyConflict) {
          // The lookup missed this block (it failed, or the association was added after it loaded),
          // so ask again to disable the course's associate buttons.
          queryClient.invalidateQueries({ queryKey: competencyQueryKeys.competencyBlockedCourses(tagId) });
        }
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
    selection,
    placeholder,
    tagId,
    generation,
    createCriterion,
    queryClient,
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
            type: 'setSelection',
            selection: { groupId, ruleKey: ruleKeyOf(updatedCriterion, systemDefaultProfile) },
          });
        }
      })
      .catch((updateError) => {
        showToast(intl.formatMessage(messages.updateRuleScoreFailedToastMessage), undefined, undefined, ErrorIcon);
        throw updateError;
      });
  }, [groupsIndex, systemDefaultProfile, tagId, updateRuleScoreMutateAsync, showToast, intl]);

  const consumeKeyboardFocusRequest = useCallback(() => {
    dispatch({ type: 'keyboardFocusRequestConsumed' });
  }, []);

  /**
   * Moves selection and keyboard focus after a delete, reading the groups cache once the delete's refetch has landed.
   * @param deletedGroupId The group that was deleted, or the group that held the deleted criterion or rule box.
   * @param snapshot The page order captured at click time, which decides where selection moves if the group is gone.
   * @param deleteFailed Whether the delete failed. When the group survives, a failure asks for keyboard focus on its
   * ⋮ menu toggle, unless `triggerLosesKeyboardFocus` already asks for the group.
   * @param profile The system default rule profile, used to derive rule boxes from the fresh criteria.
   * @param triggerLosesKeyboardFocus Whether the control that started the delete was disabled for the run, so the
   * browser dropped its keyboard focus even though its group may survive. When true, keyboard focus goes to the group
   * (or to a neighbor, or the empty state, when the group is gone) instead of the ⋮ menu toggle.
   */
  const resolveSelectionAfterDelete = useCallback((
    deletedGroupId: number,
    snapshot: PageOrderSnapshot,
    deleteFailed: boolean,
    profile: CompetencyRuleProfile,
    triggerLosesKeyboardFocus = false,
  ) => {
    const queryKey = competencyQueryKeys.competencyCriteriaGroups(tagId, listedCourseKeys);
    const freshData = queryClient.getQueryData<CompetencyCriteriaGroupsResponse>(queryKey);
    if (queryClient.getQueryState(queryKey)?.status === 'error') {
      dispatch({ type: 'deleteRefetchFailed', generation });
      return;
    }
    if (!freshData) {
      return;
    }
    const freshIndex = buildCompetencyCriteriaGroupsIndex(freshData);
    // A course added since the snapshot may have no loaded outline yet, which counts as not accessible.
    const accessibleCourseKeys = new Set(
      freshIndex.courseGroups
        .map((courseGroup) => courseGroup.courseKey)
        .filter((courseKey) =>
          queryClient.getQueryState(courseOutlineQueryKeys.index(courseKey))?.status === 'success'
        ),
    );
    const hasUnsettledNewCourse = freshIndex.courseGroups.some((courseGroup) => {
      const outlineStatus = queryClient.getQueryState(courseOutlineQueryKeys.index(courseGroup.courseKey))?.status;
      return !snapshot.knownCourseGroupIds.includes(courseGroup.id)
        && outlineStatus !== 'success' && outlineStatus !== 'error';
    });
    dispatch({
      type: 'groupDeleted',
      generation,
      snapshot,
      freshIndex,
      accessibleCourseKeys,
      deletedGroupId,
      deleteFailed,
      hasUnsettledNewCourse,
      systemDefaultProfile: profile,
      triggerLosesKeyboardFocus,
    });
  }, [queryClient, tagId, listedCourseKeys, generation]);

  const deleteGroup = useCallback(async (groupId: number): Promise<void> => {
    if (deleteInFlightGenerationRef.current === generation || !groupsIndex || !systemDefaultProfile) {
      return;
    }
    deleteInFlightGenerationRef.current = generation;
    const snapshot = snapshotPageOrder(groupsIndex, accessibleCourseGroups);
    try {
      await mutateDeleteGroup({ tagId, groupId });
    } catch (deleteError) {
      // 404: the group is already gone, which is what the author asked for.
      if (!isAxiosError(deleteError) || deleteError.response?.status !== 404) {
        throw deleteError;
      }
    } finally {
      if (deleteInFlightGenerationRef.current === generation) {
        deleteInFlightGenerationRef.current = null;
      }
      resolveSelectionAfterDelete(groupId, snapshot, false, systemDefaultProfile);
    }
  }, [
    groupsIndex,
    systemDefaultProfile,
    accessibleCourseGroups,
    tagId,
    generation,
    mutateDeleteGroup,
    resolveSelectionAfterDelete,
  ]);

  // Keyboard focus returns to the group box or the subsection row; when the group goes with it,
  // `selectionTargetAfterRemoval` picks the neighbor.
  const removeCriterion = useCallback(async (
    criterionId: number,
    returnFocusTo: 'group' | 'subsection',
  ): Promise<void> => {
    const criterion = groupsQuery.data?.criteria.find((c) => c.id === criterionId);
    if (
      deleteInFlightGenerationRef.current === generation
      || isAssociating
      || !groupsIndex
      || !systemDefaultProfile
      || !criterion
    ) {
      return;
    }
    deleteInFlightGenerationRef.current = generation;
    const snapshot = snapshotPageOrder(groupsIndex, accessibleCourseGroups);
    const { groupId, objectId } = criterion;
    try {
      await mutateDeleteCriterion({ tagId, criterionId });
    } catch (deleteError) {
      // 404: the criterion is already gone, which is what the author asked for.
      if (!isAxiosError(deleteError) || deleteError.response?.status !== 404) {
        throw deleteError;
      }
    } finally {
      if (deleteInFlightGenerationRef.current === generation) {
        deleteInFlightGenerationRef.current = null;
      }
      resolveSelectionAfterDelete(groupId, snapshot, false, systemDefaultProfile);
    }
    // Only where focus lands depends on this key, which was captured at click time.
    const groupsQueryState = queryClient.getQueryState<CompetencyCriteriaGroupsResponse>(
      competencyQueryKeys.competencyCriteriaGroups(tagId, listedCourseKeys),
    );
    const isGroupStillPresent = groupsQueryState?.status === 'success'
      && groupsQueryState.data?.groups.some((group) => group.id === groupId) === true;
    const focusRequest = focusRequestAfterAssociationRemoval(returnFocusTo, objectId, groupId, isGroupStillPresent);
    if (focusRequest) {
      dispatch({ type: 'keyboardFocusRequested', generation, keyboardFocusRequest: focusRequest });
    }
  }, [
    groupsQuery.data,
    isAssociating,
    groupsIndex,
    systemDefaultProfile,
    accessibleCourseGroups,
    tagId,
    listedCourseKeys,
    generation,
    mutateDeleteCriterion,
    resolveSelectionAfterDelete,
    queryClient,
  ]);

  // `criterionIds` are exactly the criteria the dialog listed, so content added to the box since then is not sent.
  const deleteRuleBox = useCallback(async (groupId: number, criterionIds: number[]): Promise<void> => {
    if (
      deleteInFlightGenerationRef.current === generation
      || isAssociating
      || !groupsIndex
      || !systemDefaultProfile
    ) {
      return;
    }
    const boxesBeforeDelete = ruleBoxesForGroup(groupId, groupsIndex, systemDefaultProfile);
    const ruleKeysBeforeDelete = boxesBeforeDelete.map((candidate) => candidate.key);
    // Every criterion in a box shares its rule key, so any listed one names the box.
    const ruleKey = boxesBeforeDelete.find((box) => box.criteria.some((c) => criterionIds.includes(c.id)))?.key
      ?? null;
    const snapshot = snapshotPageOrder(groupsIndex, accessibleCourseGroups);
    deleteInFlightGenerationRef.current = generation;
    let isDeleted = false;
    try {
      await mutateDeleteRuleBox({ tagId, criterionIds });
      isDeleted = true;
    } finally {
      if (deleteInFlightGenerationRef.current === generation) {
        deleteInFlightGenerationRef.current = null;
      }
      if (generationRef.current === generation) {
        // On success the dialog closes and the ⋮ toggle that opened it is disabled, so keyboard focus is lost. On
        // failure the dialog stays open and keeps it.
        resolveSelectionAfterDelete(groupId, snapshot, false, systemDefaultProfile, isDeleted);
        const dataAfterDelete = queryClient.getQueryData<CompetencyCriteriaGroupsResponse>(
          competencyQueryKeys.competencyCriteriaGroups(tagId, listedCourseKeys),
        );
        const indexAfterDelete = dataAfterDelete && buildCompetencyCriteriaGroupsIndex(dataAfterDelete);
        if (indexAfterDelete?.groupsById.has(groupId) && ruleKey !== null) {
          // Rule boxes are derived from criteria, so a selection still on the vanished box names no box. Left to the
          // render that re-resolves a stale key, selection would land on the group's last box instead of a neighbor.
          const ruleKeysAfterDelete = ruleBoxesForGroup(groupId, indexAfterDelete, systemDefaultProfile)
            .map((candidate) => candidate.key);
          if (!ruleKeysAfterDelete.includes(ruleKey)) {
            dispatch({
              type: 'ruleKeyResolved',
              groupId,
              staleRuleKey: ruleKey,
              resolvedRuleKey: ruleKeyAfterRemoval(ruleKeysBeforeDelete, ruleKey, ruleKeysAfterDelete),
            });
          }
        }
      }
    }
  }, [
    groupsIndex,
    systemDefaultProfile,
    isAssociating,
    accessibleCourseGroups,
    tagId,
    listedCourseKeys,
    generation,
    mutateDeleteRuleBox,
    resolveSelectionAfterDelete,
    queryClient,
  ]);

  const discardPlaceholderRuleBox = useCallback(() => {
    const groupId = selection?.ruleKey === null ? selection.groupId : null;
    if (groupId === null || !groupsIndex || !systemDefaultProfile) {
      return;
    }
    const ruleKey = lastRuleKeyIn(groupId, groupsIndex, systemDefaultProfile);
    dispatch({
      type: 'placeholderDiscarded',
      selection: ruleKey !== null ? { groupId, ruleKey } : null,
      keyboardFocusRequest: { kind: 'group', groupId, selectionMoved: ruleKey !== null },
    });
  }, [selection, groupsIndex, systemDefaultProfile]);

  const discardPlaceholderGroup = useCallback(() => {
    const { parentRuleGroupId } = placeholder;
    const parentGroup = parentRuleGroupId !== null ? groupsIndex?.groupsById.get(parentRuleGroupId) : undefined;
    const lastGroup = groupsIndex && parentGroup?.courseKey != null
      ? lastBottomTierGroupForCourse(groupsIndex, parentGroup.courseKey)
      : null;
    if (groupsIndex && systemDefaultProfile && lastGroup) {
      dispatch({
        type: 'placeholderDiscarded',
        selection: selectionOnFirstRuleBox(lastGroup.id, groupsIndex, systemDefaultProfile),
        keyboardFocusRequest: { kind: 'group', groupId: lastGroup.id, selectionMoved: true },
      });
    } else {
      dispatch({ type: 'placeholderDiscarded', selection: null, keyboardFocusRequest: null });
    }
  }, [placeholder, groupsIndex, systemDefaultProfile]);

  const { requestRemoval, confirmRemoval, cancelRemoval } = useRemovalConfirmation({
    tagId,
    listedCourseKeys,
    index: groupsIndex,
    systemDefaultProfile,
    courseIdsWithGroups,
    pendingRemoval,
    setPendingRemoval,
    isDeletingGroupOrRuleBoxOrCriterion,
    isAssociating,
    generationRef,
    removeCriterion,
    deleteRuleBox,
    deleteGroup,
  });

  const contextValue = useMemo<CompetencyAssociationsContextValue>(() => {
    const shared: CompetencyAssociationsContextBase = {
      error,
      selection,
      placeholder,
      hasPlaceholder,
      addPlaceholderRuleBox,
      addPlaceholderGroup,
      setPlaceholderLogicOperator,
      setPlaceholderRulePayload,
      discardPlaceholder,
      placeholderDuplicateRejected,
      placeholderDuplicateRejectionCount,
      selectGroup,
      selectRuleBox,
      notifyCourseExpanded,
      associateSubsection,
      updateGroupOperator,
      updateRuleScore,
      isDeletingGroupOrRuleBoxOrCriterion,
      pendingRemoval,
      requestRemoval,
      confirmRemoval,
      cancelRemoval,
      discardPlaceholderGroup,
      discardPlaceholderRuleBox,
      // Held back while a dialog is open, so the request lands after the dialog's own focus return.
      keyboardFocusRequest: pendingRemoval ? null : keyboardFocusRequest,
      consumeKeyboardFocusRequest,
      isAssociating,
      expansionCountByCourseId,
      hasPermissionsError,
      canEditCourse,
      conflictingCompetencyName,
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
      competencyName,
    };
    if (status === 'success' && groupsIndex && systemDefaultProfile) {
      return { ...shared, status, groupsIndex, systemDefaultProfile };
    }
    return { ...shared, status: status === 'error' ? 'error' : 'pending', groupsIndex, systemDefaultProfile };
  }, [
    status,
    error,
    selection,
    placeholder,
    hasPlaceholder,
    addPlaceholderRuleBox,
    addPlaceholderGroup,
    setPlaceholderLogicOperator,
    setPlaceholderRulePayload,
    discardPlaceholder,
    placeholderDuplicateRejected,
    placeholderDuplicateRejectionCount,
    selectGroup,
    selectRuleBox,
    notifyCourseExpanded,
    associateSubsection,
    updateGroupOperator,
    updateRuleScore,
    isDeletingGroupOrRuleBoxOrCriterion,
    pendingRemoval,
    requestRemoval,
    confirmRemoval,
    cancelRemoval,
    discardPlaceholderGroup,
    discardPlaceholderRuleBox,
    keyboardFocusRequest,
    consumeKeyboardFocusRequest,
    isAssociating,
    expansionCountByCourseId,
    hasPermissionsError,
    canEditCourse,
    conflictingCompetencyName,
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
    competencyName,
  ]);

  return (
    <CompetencyAssociationsContext.Provider value={contextValue}>
      {children}
    </CompetencyAssociationsContext.Provider>
  );
};
