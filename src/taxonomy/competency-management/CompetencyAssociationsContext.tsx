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
// Reaches past `@src/course-outline/data`'s own public barrel (which doesn't
// re-export this) deliberately: this is the exact query key
// `useCourseOutlineIndex` itself uses, so the `useQueries` calls below share
// its cache instead of issuing a second request per course. Worth revisiting
// if `course-outline/data` ever exports this properly.
import { courseOutlineQueryKeys } from '@src/course-outline/data/queryKeys';
import { useToastContext } from '@src/generic/toast-context';

import {
  useCompetencyCriteriaGroups,
  useCourseTaggingPermissions,
  useCreateCompetencyCriterion,
  useDefaultCompetencyRuleProfile,
} from './data/apiHooks';
import type {
  CompetencyCriteriaGroupsResponse,
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
  lastRealRuleKeyIn,
  ruleBoxesForGroup,
  ruleKeyOf,
  visibleCourseGroups,
} from './utils';

/** Identifies which bottom-tier group and, within it, which rule box
 * currently has focus. A rule box only means anything inside a particular
 * group, so the two are always written together (see `focusGroup`/
 * `focusRuleBox` below) - never one without the other, and never `null`
 * once either write happens. `ruleKey` is `null` when the focused group has
 * no rule box yet (e.g. `lastRealRuleKeyIn` found none).
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
  /** Focuses a group and, with it, its own last real rule box
   * (`lastRealRuleKeyIn`). A no-op when `groupId` is already focused - does
   * NOT re-resolve the default rule box in that case, so re-clicking the
   * group heading never throws away a rule box the author had selected
   * inside it.
   */
  focusGroup: (groupId: number) => void;
  /** Focuses one specific rule box, and the group it belongs to, together. */
  focusRuleBox: (groupId: number, ruleKey: string) => void;
  /**
   * Notify the provider that a course was expanded in the content panel
   * below. Call this ONLY from that panel's own per-course chevron toggle,
   * and only when it EXPANDS a course - never on collapse, and never from
   * a page-level "Expand All" control. The provider has no way to enforce
   * this itself. Growing the set of courses this way lets `canEditCourse`
   * resolve a real answer for a group-less course the author just opened,
   * not just the courses this competency already has groups in. It has no
   * effect on the one-time initial-focus mechanism, which only ever counts
   * bottom-tier groups already in the tree.
   */
  notifyCourseExpanded: (courseId: string) => void;
  /** Associates a piece of course content (a gradable subsection) with the
   * active competency. See the provider's own implementation for the
   * target-selection and duplicate-guard rules.
   */
  associateSubsection: (objectId: string, courseId: string) => void;
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
  /** `profileQuery.data`, under the name every rule-resolution helper in
   * `./utils` expects.
   */
  systemDefaultProfile: CompetencyRuleProfile | undefined;
  /** Every already-associated criterion's `objectId`, across the whole
   * tree - the create mutation's duplicate guard, and every "already
   * associated" marking in the content panel below, read this.
   */
  associatedObjectIds: Set<string>;
  /** Every course-level group whose own course the author can actually
   * see - i.e. `utils.ts`'s `visibleCourseGroups`, already filtered by this
   * provider's own per-course outline-fetch results. `CourseGroupList` maps
   * over this directly instead of calling `visibleCourseGroups` itself.
   */
  accessibleCourseGroups: CourseCompetencyCriteriaGroup[];
  /** The active competency's short external id (e.g. "CCRS-1.3"), shown on
   * an already-associated subsection's badge. `null` when the competency
   * has none.
   */
  competencyExternalId: string | null;
}

// Exported (alongside the provider and hook above) so component tests can
// render a hand-built value via `<CompetencyAssociationsContext.Provider>`
// directly, without needing to mock every HTTP request the real provider
// would otherwise issue - see e.g. `criteria-groups/RuleBox.test.tsx`.
export const CompetencyAssociationsContext = createContext<CompetencyAssociationsContextValue | undefined>(undefined);

/** Reads the current competency-associations context.
 *
 * Throws if called outside a `<CompetencyAssociationsProvider>` ancestor
 * rather than falling back to a no-op default: every real consumer of this
 * context is built to exist only inside the provider, so a silent no-op
 * default would hide a missing-provider bug instead of surfacing it.
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
 * Deliberately never remounted (no `key={tagId}`) so it doesn't reset
 * `CourseSearchBrowse`'s own state when the selected competency changes;
 * instead it resets its own state - `focus`, the one-time initial-focus
 * guard, and the tracked expanded-course set - by comparing the incoming
 * `tagId` against the previous render's value, all in the same render-time
 * block. React's documented alternative to a remounting `key`, and not an
 * effect.
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

  // The course keys of every course-level group in the raw `#681` response,
  // unfiltered - every one of these must be fetched to find out whether its
  // course is actually accessible (see `accessibleCourseIds` below); a
  // course can't be excluded from that check before the check itself has
  // run. Used for two other, unrelated things too: the initial-focus
  // effect's own outline-resolution gate (below), and, unioned with
  // `expandedCourseIds`, `canEditCourse`'s permission check (which needs an
  // answer for a group-less course the author just expanded too).
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

  // A course counts as accessible only once its own outline fetch has
  // resolved successfully - matching the ticket's own "a course-level
  // group for a course I cannot see is not shown" acceptance criterion
  // (and its own "not shown with a missing, blank, or placeholder course
  // name instead" clause: this is why a failed fetch is excluded entirely,
  // never degraded to a raw-id fallback). Still loading doesn't count as
  // accessible either - only a confirmed success does, so a course-level
  // group never renders before its own fetch has actually confirmed it.
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

  // Runs at most once per competency (guarded by `hasRunInitialFocusRef`,
  // reset alongside `focus` above): once the groups query, the default
  // profile, and every course-with-a-group's own outline have all
  // resolved, focus the sole bottom-tier group if exactly one exists across
  // the *accessible* course-level groups - counting `accessibleCourseGroups`,
  // never `index.courseGroups` unfiltered, so a bottom-tier group that
  // belongs to a course the author can't see is never eligible for
  // auto-focus (it isn't rendered, so focusing it would point at nothing).
  // Deliberately independent of `expandedCourseIds`/`notifyCourseExpanded`:
  // a course the author expands that has no group for this competency yet
  // has no bearing on this count, and must not delay this gate. A click
  // that already set `focus` before the gate resolved beats this
  // auto-focus; the effect still marks itself as having run (so it never
  // fires later), it just skips writing anything.
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

  // `canEditCourse`'s own course list: every course this competency already
  // has a group in, plus every course the author has expanded in the
  // content panel (even one with no group yet) - the union the ticket's
  // text actually describes for the permission check (not the initial-focus
  // gate above, which this list must not influence).
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
        if (courseGroup?.depth === 1 && courseGroup.courseKey === courseId && focus.ruleKey !== null) {
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
          groupId: criterion.competencyCriteriaGroupId,
          ruleKey: ruleKeyOf(criterion, systemDefaultProfile),
        });
      },
      onError: () => {
        showToast(intl.formatMessage(messages.createCriterionFailedToastMessage));
      },
    });
  }, [associatedIds, index, systemDefaultProfile, focus, tagId, createCriterion, showToast, intl]);

  const contextValue = useMemo<CompetencyAssociationsContextValue>(() => ({
    focus,
    focusGroup,
    focusRuleBox,
    notifyCourseExpanded,
    associateSubsection,
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
