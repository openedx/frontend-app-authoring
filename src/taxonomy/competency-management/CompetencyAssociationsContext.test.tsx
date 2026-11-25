import { memo, useState } from 'react';
import type { ReactNode } from 'react';
import { onlineManager } from '@tanstack/react-query';
import { Error as ErrorIcon, InfoOutline } from '@openedx/paragon/icons';
import * as authzApi from '@src/authz/data/api';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import { courseOutlineQueryKeys } from '@src/course-outline/data/queryKeys';
import {
  act,
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import {
  buildCourseListResponse,
  courseA,
  courseB,
  courseBGroupsResponse,
  courseListUrl,
  courseOther,
  criterion,
  defaultProfileResponse as profileResponse,
  eqRule,
  group,
  gteRule,
  mockHeldGroupsRefetch,
  noGroupsResponse,
  otherSingleGroupResponse,
  singleGroupResponse,
  tagId,
  twoCoursesResponse,
  twoGroupsResponse,
} from './__mocks__';
import { CompetencyAssociationsProvider, useCompetencyAssociations } from './CompetencyAssociationsContext';
import { RemovalTargetKind } from './constants';
import { apiUrls } from './data/api';
import { competencyQueryKeys } from './data/apiHooks';
import type { CompetencyCriteriaGroupsResponse, GradeRulePayload } from './data/types';
import { ruleBoxesForGroup } from './utils';

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];
let mockShowToast: ReturnType<typeof initializeMocks>['mockShowToast'];
let queryClient: ReturnType<typeof initializeMocks>['queryClient'];
let user: ReturnType<typeof userEvent.setup>;

const otherTagId = 43;
const gte70PercentRuleKey = 'grade:gte:0.7:percent';
const eqKey = 'grade:eq:1:percent';

const groupsUrl = apiUrls.competencyCriteriaGroups(tagId);
const otherGroupsUrl = apiUrls.competencyCriteriaGroups(otherTagId);
const blockedCoursesUrl = apiUrls.competencyBlockedCourses(tagId);
const profileUrl = apiUrls.defaultCompetencyRuleProfile();
const createUrl = apiUrls.createCompetencyCriterion(tagId);
/** `twoGroupsResponse`'s two leaf groups, each holding one default-rule criterion. */
const twoGroupsWithCriteriaResponse = {
  ...twoGroupsResponse,
  criteria: [criterion(901, 'sub-a', 10), criterion(902, 'sub-b', 11)],
};

/** `twoGroupsWithCriteriaResponse` after group 10 was deleted. */
const afterDeletingGroup10Response = {
  groups: twoGroupsWithCriteriaResponse.groups.filter((item) => item.id !== 10),
  criteria: twoGroupsWithCriteriaResponse.criteria.filter((item) => item.groupId !== 10),
};

/** Course A with leaf groups 10, 11 and 12. Groups 11 and 12 each hold two rule boxes, the default `gte` first and
 * an `eq` second.
 */
const eqOverride = { ruleProfileId: null, ruleTypeOverride: 'grade', rulePayloadOverride: eqRule } as const;
const threeGroupsWithCriteriaResponse = {
  groups: [...twoGroupsResponse.groups, group(12, 1, null, 2)],
  criteria: [
    criterion(901, 'sub-a', 10),
    criterion(902, 'sub-b', 11),
    criterion(903, 'sub-c', 11, eqOverride),
    criterion(904, 'sub-d', 12),
    criterion(905, 'sub-e', 12, eqOverride),
  ],
};

/** `threeGroupsWithCriteriaResponse` after group 10 was deleted. */
const afterDeletingGroup10OfThreeResponse = {
  groups: threeGroupsWithCriteriaResponse.groups.filter((item) => item.id !== 10),
  criteria: threeGroupsWithCriteriaResponse.criteria.filter((item) => item.groupId !== 10),
};

/** Course A (group 10) and course B (group 20), each leaf holding one default-rule criterion. */
const twoCoursesWithCriteriaResponse = {
  ...twoCoursesResponse,
  criteria: [criterion(901, 'sub-a', 10), criterion(902, 'sub-b', 20)],
};

/** Group 10 holds two criteria (`sub-a` at the default 70%, `sub-c` at 80%), so each is its own rule box. */
const twoCriteriaInGroupResponse = {
  ...singleGroupResponse,
  criteria: [
    criterion(901, 'sub-a', 10),
    criterion(903, 'sub-c', 10, {
      ruleProfileId: null,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'gte', value: 0.8, scale: 'percent' },
    }),
  ],
};

/** `twoCriteriaInGroupResponse` after `sub-a` was removed. */
const afterRemovingSubAResponse = {
  ...twoCriteriaInGroupResponse,
  criteria: twoCriteriaInGroupResponse.criteria.filter((item) => item.id !== 901),
};

const gte80PercentRuleKey = 'grade:gte:0.8:percent';
const gte90PercentRuleKey = 'grade:gte:0.9:percent';

/** A criterion in group `groupId` at `percent`, or one resolving through the 70% default profile when `percent` is null. */
const criterionInGroupAtScore = (id: number, groupId: number, percent: number | null) => (
  percent === null
    ? criterion(id, `sub-${id}`, groupId)
    : criterion(id, `sub-${id}`, groupId, {
      ruleProfileId: null,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'gte', value: percent / 100, scale: 'percent' },
    })
);

const responseWithoutCriteria = (response: CompetencyCriteriaGroupsResponse, criterionIds: number[]) => ({
  ...response,
  criteria: response.criteria.filter((item) => !criterionIds.includes(item.id)),
});

// Criterion ids in `threeRuleBoxesInGroup10Response` and `fourRuleBoxesInGroup10Response`, named by the rule box each
// belongs to. Each box in those responses holds one criterion. `twoGroupsWithCriteriaResponse` gives group 10 and
// group 11 one 70% box each, with the same ids as the 70% boxes here.
const criterionIdIn70PercentRuleBoxOfGroup10 = 901;
const criterionIdIn80PercentRuleBoxOfGroup10 = 903;
const criterionIdIn90PercentRuleBoxOfGroup10 = 904;
const criterionIdIn95PercentRuleBoxOfGroup10 = 907;
const criterionIdIn70PercentRuleBoxOfGroup11 = 902;

/** Group 10 holds three rule boxes (70%, 80%, 90%) and group 11 one (70%), so a box can vanish while its group
 * survives.
 */
const threeRuleBoxesInGroup10Response: CompetencyCriteriaGroupsResponse = {
  ...twoGroupsResponse,
  criteria: [
    criterionInGroupAtScore(criterionIdIn70PercentRuleBoxOfGroup10, 10, null),
    criterionInGroupAtScore(criterionIdIn80PercentRuleBoxOfGroup10, 10, 80),
    criterionInGroupAtScore(criterionIdIn90PercentRuleBoxOfGroup10, 10, 90),
    criterionInGroupAtScore(criterionIdIn70PercentRuleBoxOfGroup11, 11, null),
  ],
};

/** `threeRuleBoxesInGroup10Response` plus a fourth box (95%) in group 10, so a removed box has a neighbor on each
 * side.
 */
const fourRuleBoxesInGroup10Response: CompetencyCriteriaGroupsResponse = {
  ...threeRuleBoxesInGroup10Response,
  criteria: [
    ...threeRuleBoxesInGroup10Response.criteria,
    criterionInGroupAtScore(criterionIdIn95PercentRuleBoxOfGroup10, 10, 95),
  ],
};

// Criterion ids in `threeCriteriaInOneRuleBoxResponse`, in the order the API lists them.
const criterionIdsIn70PercentRuleBox = [901, 905, 906];
const criterionIdsIn80PercentRuleBox = [903];

/** Group 10 holds a 70% rule box with three criteria and an 80% rule box with one. */
const threeCriteriaInOneRuleBoxResponse: CompetencyCriteriaGroupsResponse = {
  ...singleGroupResponse,
  criteria: [
    ...criterionIdsIn70PercentRuleBox.map((id) => criterionInGroupAtScore(id, 10, null)),
    ...criterionIdsIn80PercentRuleBox.map((id) => criterionInGroupAtScore(id, 10, 80)),
  ],
};

const courseAOutlineUrl = getCourseOutlineIndexApiUrl(courseA);
const courseBOutlineUrl = getCourseOutlineIndexApiUrl(courseB);
const updateGroupOperatorUrl = apiUrls.competencyCriteriaGroup(tagId, 10);
const updateRuleScoreUrl = apiUrls.updateCompetencyCriteriaRule(10);

const outlineFixture = buildOutlineIndex();

const createFailedMessage = 'There was a problem creating this association. Please try again.';

/** The body of a 201 from the create endpoint: an override rule when `rule` is
 * given, otherwise the default profile.
 */
const createdCriterion = (groupId: number, rule?: GradeRulePayload) => ({
  id: 920,
  group_id: groupId,
  rule_profile_id: rule ? null : 1,
  rule_type_override: rule ? 'grade' : null,
  rule_payload_override: rule ?? null,
  object_tag_id: tagId,
});

const deferred = () => {
  let release!: () => void;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { released, release };
};

/** Renders every context value as text and every action as a button. */
const TestConsumer = () => {
  const ctx = useCompetencyAssociations();
  // Asks for the box's removal with the ids a rendered rule box holds, which is what `RuleBox` hands to
  // `requestRemoval`; none for a key the group lacks.
  const requestRuleBoxRemoval = (groupId: number, ruleKey: string) =>
    ctx.requestRemoval({
      kind: RemovalTargetKind.RuleBox,
      groupId,
      criterionIds: ctx.groupsIndex && ctx.systemDefaultProfile
        ? ruleBoxesForGroup(groupId, ctx.groupsIndex, ctx.systemDefaultProfile)
          .find((box) => box.key === ruleKey)?.criteria.map((criterion) => criterion.id) ?? []
        : [],
    });
  const requestAssociationRemoval = (criterionId: number, returnFocusTo: 'group' | 'subsection') => (
    ctx.requestRemoval({ kind: RemovalTargetKind.Association, criterionId, returnFocusTo })
  );
  const actions: Array<[string, () => void]> = [
    ['Select group 999', () => ctx.selectGroup(999)],
    ['Select rule box 999 gte', () => ctx.selectRuleBox(999, gte70PercentRuleKey)],
    ['Select group 10', () => ctx.selectGroup(10)],
    ['Select group 20', () => ctx.selectGroup(20)],
    ['Select group 21', () => ctx.selectGroup(21)],
    ['Select rule box 10 gte', () => ctx.selectRuleBox(10, gte70PercentRuleKey)],
    ['Select the 80% rule box in group 10', () => ctx.selectRuleBox(10, gte80PercentRuleKey)],
    ['Select the 90% rule box in group 10', () => ctx.selectRuleBox(10, gte90PercentRuleKey)],
    ['Select rule box 21 gte', () => ctx.selectRuleBox(21, gte70PercentRuleKey)],
    ['Select rule box 12 eq', () => ctx.selectRuleBox(12, eqKey)],
    ['Expand course A', () => ctx.notifyCourseExpanded(courseA)],
    ['Expand course B', () => ctx.notifyCourseExpanded(courseB)],
    ['Associate in course A', () => ctx.associateSubsection('new-sub', courseA)],
    ['Associate in course B', () => ctx.associateSubsection('new-sub', courseB)],
    ['Associate in another course', () => ctx.associateSubsection('new-sub', courseOther)],
    ['Associate duplicate', () => ctx.associateSubsection('existing-sub', courseA)],
    ['Search for course B', () => ctx.setCourseSearch('b')],
    ['Search for another course', () => ctx.setCourseSearch('other')],
    ['Search for the same courses', () => ctx.setCourseSearch('same')],
    ['Go to page 2', () => ctx.setCoursePage(2)],
    ['Go to page 1', () => ctx.setCoursePage(1)],
    ['Discard placeholder', () => ctx.discardPlaceholder()],
    ['Select group 11', () => ctx.selectGroup(11)],
    ['Delete group 10', () => ctx.requestRemoval({ kind: RemovalTargetKind.RuleGroup, groupId: 10 })],
    ['Delete group 20', () => ctx.requestRemoval({ kind: RemovalTargetKind.RuleGroup, groupId: 20 })],
    ['Delete group 30', () => ctx.requestRemoval({ kind: RemovalTargetKind.RuleGroup, groupId: 30 })],
    ['Request remove group 11', () => ctx.requestRemoval({ kind: RemovalTargetKind.RuleGroup, groupId: 11 })],
    ['Request remove course group 1', () => ctx.requestRemoval({ kind: RemovalTargetKind.CourseGroup, groupId: 1 })],
    ['Confirm removal', () => ctx.confirmRemoval()],
    ['Cancel removal', () => ctx.cancelRemoval()],
    ['Discard placeholder group', () => ctx.discardPlaceholderGroup()],
    ['Delete the 70% rule box in group 10', () => requestRuleBoxRemoval(10, gte70PercentRuleKey)],
    ['Delete the 80% rule box in group 10', () => requestRuleBoxRemoval(10, gte80PercentRuleKey)],
    ['Delete the 90% rule box in group 10', () => requestRuleBoxRemoval(10, gte90PercentRuleKey)],
    ['Delete the 70% rule box in group 11', () => requestRuleBoxRemoval(11, gte70PercentRuleKey)],
    ['Delete the 70% rule box in group 20', () => requestRuleBoxRemoval(20, gte70PercentRuleKey)],
    [
      'Confirm removal twice in one tick',
      () => {
        void ctx.confirmRemoval();
        void ctx.confirmRemoval();
      },
    ],
    [
      'Confirm removal, then request removing group 11 and confirm it, in one tick',
      () => {
        void ctx.confirmRemoval();
        ctx.requestRemoval({ kind: RemovalTargetKind.RuleGroup, groupId: 11 });
        void ctx.confirmRemoval();
      },
    ],
    [
      'Delete rule box with ids 999',
      () => ctx.requestRemoval({ kind: RemovalTargetKind.RuleBox, groupId: 10, criterionIds: [999] }),
    ],
    ['Discard placeholder rule box', () => ctx.discardPlaceholderRuleBox()],
    ['Remove existing-sub chip', () => requestAssociationRemoval(900, 'group')],
    ['Remove sub-a chip', () => requestAssociationRemoval(901, 'group')],
    ['Remove criterion 902', () => requestAssociationRemoval(902, 'group')],
    ['Remove sub-a from browse', () => requestAssociationRemoval(901, 'subsection')],
    ['Add placeholder rule box in group 10', () => ctx.addPlaceholderRuleBox(10)],
    ['Add placeholder group under course A', () => ctx.addPlaceholderGroup(1)],
    ['Set placeholder logic operator to AND', () => ctx.setPlaceholderLogicOperator('AND')],
    ['Set placeholder score', () => ctx.setPlaceholderRulePayload({ op: 'gte', value: 0.85, scale: 'percent' })],
    ['Update group operator', () => ctx.updateGroupOperator(10, 'OR')],
    [
      'Update rule score',
      // The rejection is covered by the toast assertion, so it is swallowed here to avoid an unhandled rejection.
      () => {
        ctx.updateRuleScore(10, [900], { op: 'gte', value: 0.8, scale: 'percent' }).catch(() => {});
      },
    ],
    [
      'Associate two in one tick',
      () => {
        ctx.associateSubsection('first-sub', courseA);
        ctx.associateSubsection('second-sub', courseA);
      },
    ],
  ];
  return (
    <div>
      <p>
        Selection: {ctx.selection ? `group ${ctx.selection.groupId}, rule ${ctx.selection.ruleKey ?? 'none'}` : 'none'}
      </p>
      <p>Status: {ctx.status}</p>
      <p>Has placeholder: {String(ctx.hasPlaceholder)}</p>
      <p>Deleting: {String(ctx.isDeletingGroupOrRuleBoxOrCriterion)}</p>
      <p>
        Pending removal: {ctx.pendingRemoval
          ? JSON.stringify({ kind: ctx.pendingRemoval.target.kind, failure: ctx.pendingRemoval.failure })
          : 'closed'}
      </p>
      <p>Pending summary: {JSON.stringify(ctx.pendingRemoval?.summary ?? null)}</p>
      <p>
        Criterion ids: {JSON.stringify(
          ctx.groupsIndex?.criteriaByGroupId && [...ctx.groupsIndex.criteriaByGroupId.values()].flat().map((c) => c.id),
        )}
      </p>
      <p>Keyboard request: {JSON.stringify(ctx.keyboardFocusRequest)}</p>
      <p>Duplicate rejected: {String(ctx.placeholderDuplicateRejected)}</p>
      <p>Duplicate rejection count: {ctx.placeholderDuplicateRejectionCount}</p>
      <p>Placeholder: {JSON.stringify(ctx.placeholder)}</p>
      <p>Error: {ctx.error?.message ?? 'none'}</p>
      <p>Associating: {String(ctx.isAssociating)}</p>
      <p>Course A expansions: {ctx.expansionCountByCourseId[courseA] ?? 0}</p>
      <p>Groups index: {ctx.groupsIndex ? 'loaded' : 'missing'}</p>
      <p>Listed course keys: {JSON.stringify(ctx.courseList.courses.map((course) => course.courseKey))}</p>
      <p>Course list: {ctx.courseList.isError ? 'error' : ctx.courseList.isLoading ? 'loading' : 'loaded'}</p>
      <p>Course list reloading: {String(ctx.courseList.isPlaceholderData)}</p>
      <p>Course page: {ctx.coursePage}</p>
      <p>Course search: {JSON.stringify(ctx.courseSearch)}</p>
      <p>Criteria counts: {JSON.stringify(ctx.criteriaCounts ?? null)}</p>
      <p>Groups refresh error: {String(ctx.hasGroupsRefreshError)}</p>
      <p>Competency: {String(ctx.competencyExternalId)}</p>
      <p>Conflict in course A: {ctx.conflictingCompetencyName(courseA) ?? 'none'}</p>
      <p>Conflict in course B: {ctx.conflictingCompetencyName(courseB) ?? 'none'}</p>
      <p>Can edit course B: {String(ctx.canEditCourse(courseB))}</p>
      <p>Can edit another course: {String(ctx.canEditCourse(courseOther))}</p>
      <ul aria-label="Associated object ids">
        {Array.from(ctx.associatedObjectIds).map((id) => <li key={id}>{id}</li>)}
      </ul>
      <ul aria-label="Accessible courses">
        {ctx.accessibleCourseGroups.map((courseGroup) => <li key={courseGroup.id}>{courseGroup.courseKey}</li>)}
      </ul>
      {actions.map(([label, onClick]) => <button key={label} type="button" onClick={onClick}>{label}</button>)}
    </div>
  );
};

/** The courses the list endpoint returns by default: every course the fixtures use. */
const defaultListedCourseKeys = [courseA, courseB];

/** Answers the list request by its `search` parameter, so a test changes the listed courses through
 * `setCourseSearch`: 'b' (or page 2) lists course B, 'other' a course outside the fixtures, anything else the default pair.
 */
const listedCoursesFor = ({ search, page }: { search?: string; page?: number; }) => {
  if (search === 'b' || page === 2) {
    return [courseB];
  }
  return search === 'other' ? [courseOther] : defaultListedCourseKeys;
};

const providerFor = (id: number, children: ReactNode = <TestConsumer />) => (
  <CompetencyAssociationsProvider tagId={id} competencyName="Competency" competencyExternalId="CCRS-1.3">
    {children}
  </CompetencyAssociationsProvider>
);

const renderProvider = () => render(providerFor(tagId));

const click = (name: string) => user.click(screen.getByRole('button', { name }));

/** Opens the confirmation for the removal behind `requestName`, then confirms it. */
const requestAndConfirm = async (requestName: string) => {
  await click(requestName);
  await click('Confirm removal');
};
const pendingRemoval = (text: string) => `Pending removal: ${text}`;

const waitForSuccess = () => screen.findByText('Status: success');
const accessibleCourses = () => screen.getByRole('list', { name: 'Accessible courses' });
const noSelection = () => screen.getByText('Selection: none');
const selectionOnGroup = (groupId: number) => new RegExp(`^Selection: group ${groupId},`);
const selectionOn = (groupId: number, ruleKey: string | null) =>
  `Selection: group ${groupId}, rule ${ruleKey ?? 'none'}`;
/** The text of the "Criterion ids" line, which lists the criteria of every saved rule box, in the order shown. */
const criterionIdsShown = (ids: number[]) => `Criterion ids: ${JSON.stringify(ids)}`;

/** Clears the initial selection the way an author can: by starting a placeholder rule box and discarding it. */
const clearSelectionByAddingAndDiscardingPlaceholderRuleBox = async () => {
  await click('Add placeholder rule box in group 10');
  await click('Discard placeholder');
  expect(noSelection()).toBeInTheDocument();
};

/** Lets effects and the state updates they dispatch run to completion. */
const flushEffects = (ms = 0) =>
  act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });

const expectSinglePost = async (body: object) => {
  await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
  expect(JSON.parse(axiosMock.history.post[0].data)).toEqual(body);
};

const expectToast = (message: string, icon: unknown) => {
  expect(mockShowToast).toHaveBeenCalledWith(message, undefined, undefined, icon);
};

describe('CompetencyAssociationsProvider', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast, queryClient } = initializeMocks());
    user = userEvent.setup();
    axiosMock.onGet(courseListUrl()).reply((config) => [200, buildCourseListResponse(listedCoursesFor(config.params))]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial selection', () => {
    it('selects the sole bottom-tier group once the groups query and every visible course outline resolve', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();

      expect(await screen.findByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();
    });

    it('leaves selection unset when more than one bottom-tier group exists across visible course groups', async () => {
      axiosMock.onGet(groupsUrl).reply(200, twoGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();

      await waitForSuccess();
      await flushEffects();
      expect(noSelection()).toBeInTheDocument();
    });

    it('leaves selection unset when there are no visible course-level groups', async () => {
      axiosMock.onGet(groupsUrl).reply(200, noGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      renderProvider();

      await waitForSuccess();
      expect(noSelection()).toBeInTheDocument();
    });

    it('keeps a click made before the data resolves instead of auto-selecting the sole group (10)', async () => {
      const outlineGate = deferred();
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(() => outlineGate.released.then(() => [200, outlineFixture]));
      renderProvider();

      await click('Select rule box 999 gte');
      expect(screen.getByText(selectionOnGroup(999))).toBeInTheDocument();

      await act(async () => {
        outlineGate.release();
      });
      await waitForSuccess();

      expect(screen.getByText(selectionOnGroup(999))).toBeInTheDocument();
    });
  });

  describe('accessibleCourseGroups', () => {
    it.each([403, 404])(
      'excludes a course-level group whose own outline fetch fails with %s, keeping a sibling course\'s group',
      async (outlineStatus) => {
        axiosMock.onGet(groupsUrl).reply(200, twoCoursesResponse);
        axiosMock.onGet(profileUrl).reply(200, profileResponse);
        axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
        axiosMock.onGet(courseBOutlineUrl).reply(outlineStatus);
        renderProvider();

        await waitFor(() => expect(accessibleCourses()).toHaveTextContent(courseA));
        expect(accessibleCourses()).not.toHaveTextContent(courseB);
        expect(screen.getByText('Status: success')).toBeInTheDocument();
        expect(screen.getByText('Error: none')).toBeInTheDocument();
      },
    );

    it.each([
      ['a 500', () => axiosMock.onGet(courseBOutlineUrl).reply(500), /500/],
      ['a network error', () => axiosMock.onGet(courseBOutlineUrl).networkError(), /Network Error/],
    ])(
      'reports an error when a course outline fetch fails with %s',
      async (_description, failCourseBOutline, errorMessage) => {
        axiosMock.onGet(groupsUrl).reply(200, twoCoursesResponse);
        axiosMock.onGet(profileUrl).reply(200, profileResponse);
        axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
        failCourseBOutline();
        renderProvider();

        await screen.findByText('Status: error');
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(accessibleCourses()).not.toHaveTextContent(courseB);
      },
    );

    it('keeps the loaded groups and the success status when a groups refetch fails', async () => {
      axiosMock.onGet(groupsUrl).replyOnce(200, singleGroupResponse).onGet(groupsUrl).reply(500);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();

      await act(async () => {
        await queryClient.invalidateQueries({ queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId) });
      });

      await waitFor(() => expect(axiosMock.history.get.filter((request) => request.url === groupsUrl)).toHaveLength(2));
      expect(screen.getByText('Status: success')).toBeInTheDocument();
      expect(screen.getByText('Error: none')).toBeInTheDocument();
      expect(screen.getByText('Groups refresh error: true')).toBeInTheDocument();
      expect(screen.getByText('Groups index: loaded')).toBeInTheDocument();
      expect(accessibleCourses()).toHaveTextContent(courseA);
    });

    it('clears the refresh error once a later groups load succeeds', async () => {
      axiosMock.onGet(groupsUrl).replyOnce(200, singleGroupResponse);
      axiosMock.onGet(groupsUrl).replyOnce(500);
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();
      expect(screen.getByText('Groups refresh error: false')).toBeInTheDocument();
      const invalidateGroups = () =>
        act(async () => {
          await queryClient.invalidateQueries({ queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId) });
        });

      await invalidateGroups();
      expect(await screen.findByText('Groups refresh error: true')).toBeInTheDocument();
      await invalidateGroups();

      expect(await screen.findByText('Groups refresh error: false')).toBeInTheDocument();
    });

    it('reports an error when a course outline refetch fails after the status was success', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).replyOnce(200, outlineFixture).onGet(courseAOutlineUrl).reply(500);
      renderProvider();
      await waitForSuccess();

      await act(async () => {
        await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.index(courseA) });
      });

      await screen.findByText('Status: error');
      expect(screen.getByText(/^Error: .*500/)).toBeInTheDocument();
    });

    it('excludes every course-level group and auto-selects nothing when every course outline fails', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(403);
      renderProvider();

      await waitForSuccess();
      await flushEffects();
      expect(accessibleCourses()).toBeEmptyDOMElement();
      expect(noSelection()).toBeInTheDocument();
    });

    it('does not count a course whose outline is still loading as accessible, and stays pending', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(() => new Promise(() => {}));
      renderProvider();

      await waitFor(() => {
        expect(axiosMock.history.get.some((req) => req.url === courseAOutlineUrl)).toBe(true);
      });
      await screen.findByText('Groups index: loaded');
      expect(accessibleCourses()).toBeEmptyDOMElement();
      expect(screen.getByText('Status: pending')).toBeInTheDocument();
      expect(noSelection()).toBeInTheDocument();
    });

    it('treats a course whose outline request is paused offline as unresolved', async () => {
      // Goes offline just before the groups resolve and mount the outline queries.
      // The fallback reply is needed because `onlineManager.setOnline(true)` in `finally` refetches groups on reconnect.
      axiosMock.onGet(groupsUrl).replyOnce(() =>
        new Promise((resolve) => {
          setTimeout(() => {
            onlineManager.setOnline(false);
            resolve([200, singleGroupResponse]);
          }, 50);
        })
      ).onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      try {
        renderProvider();

        await screen.findByText('Groups index: loaded');
        await flushEffects(50);
        expect(axiosMock.history.get.some((req) => req.url === courseAOutlineUrl)).toBe(false);
        expect(screen.getByText('Status: pending')).toBeInTheDocument();
        expect(noSelection()).toBeInTheDocument();
      } finally {
        onlineManager.setOnline(true);
      }
    });
  });

  it('stays successful when a groups refetch adds a course whose outline is still loading', async () => {
    const outlineGate = deferred();
    let groupsReply = singleGroupResponse;
    axiosMock.onGet(groupsUrl).reply(() => [200, groupsReply]);
    axiosMock.onGet(profileUrl).reply(200, profileResponse);
    axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
    axiosMock.onGet(courseBOutlineUrl).reply(() => outlineGate.released.then(() => [200, outlineFixture]));
    renderProvider();
    await waitForSuccess();

    groupsReply = twoCoursesResponse;
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId) });
    });
    await waitFor(() => {
      expect(axiosMock.history.get.some((req) => req.url === courseBOutlineUrl)).toBe(true);
    });

    expect(screen.getByText('Status: success')).toBeInTheDocument();
    expect(accessibleCourses()).toHaveTextContent(courseA);
    expect(accessibleCourses()).not.toHaveTextContent(courseB);

    await act(async () => {
      outlineGate.release();
    });
    await waitFor(() => expect(accessibleCourses()).toHaveTextContent(courseB));
    expect(screen.getByText('Status: success')).toBeInTheDocument();
  });

  it('does not delay initial selection when a group-less course is expanded', async () => {
    const outlineGate = deferred();
    axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
    axiosMock.onGet(profileUrl).reply(200, profileResponse);
    axiosMock.onGet(courseAOutlineUrl).reply(() => outlineGate.released.then(() => [200, outlineFixture]));
    renderProvider();

    await click('Expand course B');
    await act(async () => {
      outlineGate.release();
    });

    expect(await screen.findByText(selectionOnGroup(10))).toBeInTheDocument();
  });

  it('keeps an expanded group-less course editable after the competency changes', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    // `initializeMocks` stubs `validateUserPermissions` (the permissions POST) to `{}`.
    jest.spyOn(authzApi, 'validateUserPermissions').mockResolvedValue({ [courseB]: true });
    axiosMock.onGet(groupsUrl).reply(200, noGroupsResponse);
    axiosMock.onGet(otherGroupsUrl).reply(200, noGroupsResponse);
    axiosMock.onGet(profileUrl).reply(200, profileResponse);
    const { rerender } = renderProvider();

    await click('Expand course B');
    await screen.findByText('Can edit course B: true');

    rerender(providerFor(otherTagId));
    await waitForSuccess();

    expect(screen.getByText('Can edit course B: true')).toBeInTheDocument();
  });

  describe('notifyCourseExpanded selection', () => {
    const renderWithCourseB = async () => {
      axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();
    };

    it('moves selection from course A\'s group to course B\'s last group by ordering (21) and its last rule box', async () => {
      await renderWithCourseB();
      await click('Select group 10');

      await click('Expand course B');

      expect(screen.getByText(selectionOn(21, eqKey))).toBeInTheDocument();
    });

    it('moves selection again when an already-expanded course is expanded after selection went back to another course', async () => {
      await renderWithCourseB();
      await click('Select group 10');
      await click('Expand course B');
      await click('Select group 10');

      await click('Expand course B');

      expect(screen.getByText(selectionOn(21, eqKey))).toBeInTheDocument();
    });

    it('selects course B\'s last group by ordering (21) when nothing is selected', async () => {
      await renderWithCourseB();

      await click('Expand course B');

      expect(screen.getByText(selectionOnGroup(21))).toBeInTheDocument();
    });

    it('counts every expansion of a course, even one that leaves selection unchanged', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();
      expect(screen.getByText('Course A expansions: 0')).toBeInTheDocument();

      await click('Expand course A');
      await click('Expand course A');

      expect(screen.getByText('Course A expansions: 2')).toBeInTheDocument();
      expect(screen.getByText(selectionOnGroup(10))).toBeInTheDocument();
    });

    it('leaves selection unchanged when the expanded course has no groups', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();
      await click('Select group 10');

      await click('Expand course B');

      expect(screen.getByText(selectionOnGroup(10))).toBeInTheDocument();
    });

    it('leaves selection unchanged when it is already on a group of the expanded course', async () => {
      await renderWithCourseB();
      await click('Select group 20');
      expect(screen.getByText(selectionOn(20, null))).toBeInTheDocument();

      await click('Expand course B');

      expect(screen.getByText(selectionOn(20, null))).toBeInTheDocument();
    });

    it('associates into course B\'s last group by ordering (21), the group that expansion selected', async () => {
      await renderWithCourseB();
      axiosMock.onPost(createUrl).reply(201, createdCriterion(21, eqRule));
      await click('Select group 10');
      await click('Expand course B');

      await click('Associate in course B');

      await expectSinglePost({
        object_id: 'new-sub',
        group_id: 21,
        rule_type_override: 'grade',
        rule_payload_override: eqRule,
      });
    });
  });

  describe('course expanded before the association data loads', () => {
    let releaseGroups: () => void;
    let releaseProfile: () => void;

    /** The groups and profile responses stay pending until `releaseGroups()`
     * and `releaseProfile()` are called.
     */
    const renderWithPendingGroupsAndProfile = ({ courseBOutlineStatus = 200 } = {}) => {
      const groupsGate = deferred();
      const profileGate = deferred();
      releaseGroups = groupsGate.release;
      releaseProfile = profileGate.release;
      axiosMock.onGet(groupsUrl).reply(() => groupsGate.released.then(() => [200, courseBGroupsResponse]));
      axiosMock.onGet(profileUrl).reply(() => profileGate.released.then(() => [200, profileResponse]));
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onGet(courseBOutlineUrl).reply(courseBOutlineStatus, outlineFixture);
      return render(providerFor(tagId));
    };

    const finishLoading = async () => {
      await act(async () => {
        releaseGroups();
        releaseProfile();
      });
      await waitForSuccess();
    };

    it('selects course B\'s last group by ordering (21) and rule box once the data arrives, and associates into it', async () => {
      renderWithPendingGroupsAndProfile();
      axiosMock.onPost(createUrl).reply(201, createdCriterion(21, eqRule));
      await click('Expand course B');
      expect(noSelection()).toBeInTheDocument();

      await finishLoading();

      expect(screen.getByText(selectionOn(21, eqKey))).toBeInTheDocument();
      await click('Associate in course B');
      await expectSinglePost({
        object_id: 'new-sub',
        group_id: 21,
        rule_type_override: 'grade',
        rule_payload_override: eqRule,
      });
    });

    it('keeps the author\'s own pick (10) over the expansion selection (21) when they picked after expanding', async () => {
      renderWithPendingGroupsAndProfile();
      await click('Expand course B');
      await click('Select group 10');

      await finishLoading();

      expect(screen.getByText(selectionOnGroup(10))).toBeInTheDocument();
    });

    it('moves selection to course B\'s last group (21) when an earlier pick (10) also has a stale rule key', async () => {
      renderWithPendingGroupsAndProfile();
      await click('Select rule box 10 gte');
      await click('Expand course B');

      await finishLoading();

      expect(screen.getByText(selectionOn(21, eqKey))).toBeInTheDocument();
    });

    it('selects course A\'s only group (10) when course A is expanded after course B', async () => {
      renderWithPendingGroupsAndProfile();
      await click('Expand course B');
      await click('Expand course A');

      await finishLoading();

      expect(screen.getByText(selectionOnGroup(10))).toBeInTheDocument();
    });

    it('selects the expanded course\'s last group (21) rather than the sole accessible group (10)', async () => {
      // Course B's outline fails, so auto-selection alone would choose group 10, course A's only leaf.
      renderWithPendingGroupsAndProfile({ courseBOutlineStatus: 403 });
      await click('Expand course B');

      await finishLoading();
      await waitFor(() => expect(accessibleCourses()).toHaveTextContent(courseA));

      expect(screen.getByText(selectionOnGroup(21))).toBeInTheDocument();
    });

    it('does not apply a pending expansion to a previously loaded competency it switches to', async () => {
      const { rerender } = renderWithPendingGroupsAndProfile();
      axiosMock.onGet(otherGroupsUrl).reply(200, courseBGroupsResponse);
      rerender(providerFor(otherTagId));
      await act(async () => {
        releaseProfile();
      });
      await waitForSuccess();

      rerender(providerFor(tagId));
      await click('Expand course B');
      rerender(providerFor(otherTagId));

      expect(noSelection()).toBeInTheDocument();
    });

    it('is dropped when the competency changes', async () => {
      const { rerender } = renderWithPendingGroupsAndProfile();
      axiosMock.onGet(otherGroupsUrl).reply(200, courseBGroupsResponse);
      await act(async () => {
        releaseProfile();
      });
      await click('Expand course B');

      rerender(providerFor(otherTagId));
      await waitForSuccess();

      expect(noSelection()).toBeInTheDocument();
    });
  });

  describe('context value', () => {
    it('exposes the loaded tree, the associated ids and the competency external id', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();

      await waitForSuccess();
      expect(screen.getByText('Error: none')).toBeInTheDocument();
      expect(screen.getByText('Groups index: loaded')).toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'Associated object ids' })).toHaveTextContent('existing-sub');
      expect(screen.getByText('Competency: CCRS-1.3')).toBeInTheDocument();
      expect(screen.getByText('Associating: false')).toBeInTheDocument();
    });

    it('is pending, without a tree, while the groups request is in flight', async () => {
      axiosMock.onGet(groupsUrl).reply(() => new Promise(() => {}));
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      renderProvider();

      await waitFor(() => expect(axiosMock.history.get.some((req) => req.url === groupsUrl)).toBe(true));
      expect(screen.getByText('Status: pending')).toBeInTheDocument();
      expect(screen.getByText('Groups index: missing')).toBeInTheDocument();
    });

    it('reports an error when the groups request fails', async () => {
      axiosMock.onGet(groupsUrl).reply(500);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      renderProvider();

      await screen.findByText('Status: error');
      expect(screen.getByText(/^Error: .*500/)).toBeInTheDocument();
    });

    it('reports an error and shows the failure toast on associate when the default profile fails', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(500);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();

      await screen.findByText('Status: error');
      expect(screen.getByText(/^Error: .*500/)).toBeInTheDocument();

      await click('Associate in course A');

      expectToast(createFailedMessage, ErrorIcon);
      await flushEffects();
      expect(axiosMock.history.post).toHaveLength(0);
    });

    it('does not re-render a memoized consumer when the provider re-renders', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      let probeRenders = 0;
      const Probe = memo(() => {
        useCompetencyAssociations();
        probeRenders += 1;
        return null;
      });
      const Parent = () => {
        const [, setCount] = useState(0);
        return providerFor(
          tagId,
          <>
            <TestConsumer />
            <Probe />
            <button type="button" onClick={() => setCount((count) => count + 1)}>Re-render provider</button>
          </>,
        );
      };
      render(<Parent />);
      await screen.findByText(selectionOnGroup(10));
      const rendersBefore = probeRenders;

      await click('Re-render provider');

      expect(probeRenders).toBe(rendersBefore);
    });
  });

  describe('canEditCourse', () => {
    it('is false for a course that has no group and was never expanded', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await click('Expand course B');

      await screen.findByText('Can edit course B: true');
      expect(screen.getByText('Can edit another course: false')).toBeInTheDocument();
    });
  });

  describe('selectGroup', () => {
    it('keeps the selected rule box when the already-selected group is selected again', async () => {
      axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();
      await click('Select group 21');
      expect(screen.getByText(selectionOn(21, eqKey))).toBeInTheDocument();
      await click('Select rule box 21 gte');
      expect(screen.getByText(selectionOn(21, gte70PercentRuleKey))).toBeInTheDocument();

      await click('Select group 21');

      expect(screen.getByText(selectionOn(21, gte70PercentRuleKey))).toBeInTheDocument();
    });

    it('moves selection to the rule box\'s own group when a rule box of another group is selected', async () => {
      axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();
      await click('Select group 10');

      await click('Select rule box 21 gte');

      expect(screen.getByText(selectionOn(21, gte70PercentRuleKey))).toBeInTheDocument();
    });
  });

  describe('when the selected rule key matches none of the selected group\'s rule boxes', () => {
    const groupsWithRule = (rule: GradeRulePayload | null) => ({
      ...singleGroupResponse,
      criteria: rule
        ? [
          criterion(900, 'existing-sub', 10, {
            ruleProfileId: null,
            ruleTypeOverride: 'grade',
            rulePayloadOverride: rule,
          }),
        ]
        : [],
    });
    let groupsReply: typeof singleGroupResponse;

    const refetchGroupsAs = async (reply: typeof singleGroupResponse) => {
      groupsReply = reply;
      await act(async () => {
        await queryClient.invalidateQueries({ queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId) });
      });
    };

    beforeEach(() => {
      groupsReply = singleGroupResponse;
      axiosMock.onGet(groupsUrl).reply(() => [200, groupsReply]);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
    });

    it('moves selection to the group\'s last rule box and creates into it', async () => {
      axiosMock.onPost(createUrl).reply(201, createdCriterion(10, eqRule));
      renderProvider();
      await screen.findByText(selectionOn(10, gte70PercentRuleKey));

      await refetchGroupsAs(groupsWithRule(eqRule));

      expect(await screen.findByText(selectionOn(10, eqKey))).toBeInTheDocument();
      await click('Associate in course A');
      await expectSinglePost({
        object_id: 'new-sub',
        group_id: 10,
        rule_type_override: 'grade',
        rule_payload_override: eqRule,
      });
    });

    it('keeps the group selected with no rule box when it has none left, and creates into it', async () => {
      axiosMock.onPost(createUrl).reply(201, createdCriterion(10));
      renderProvider();
      await screen.findByText(selectionOn(10, gte70PercentRuleKey));

      await refetchGroupsAs(groupsWithRule(null));

      expect(await screen.findByText(selectionOn(10, null))).toBeInTheDocument();
      await click('Associate in course A');
      await expectSinglePost({ object_id: 'new-sub', group_id: 10 });
    });

    // Unlike "selects the response's group and rule after a successful create", whose group 999 is absent from the
    // tree so re-resolution never runs, this refetches a tree containing the new box and checks selection stays on it.
    it('keeps selection on the rule box a create just added to the selected group', async () => {
      axiosMock.onPost(createUrl).reply(() => {
        groupsReply = {
          ...singleGroupResponse,
          criteria: [
            ...singleGroupResponse.criteria,
            criterion(920, 'new-sub', 10, {
              ruleProfileId: null,
              ruleTypeOverride: 'grade',
              rulePayloadOverride: eqRule,
            }),
          ],
        };
        return [201, createdCriterion(10, eqRule)];
      });
      renderProvider();
      await screen.findByText(selectionOn(10, gte70PercentRuleKey));

      await click('Associate in course A');

      expect(await screen.findByText(selectionOn(10, eqKey))).toBeInTheDocument();
      await flushEffects();
      expect(screen.getByText(selectionOn(10, eqKey))).toBeInTheDocument();
    });
  });

  describe('switching competencies', () => {
    it('is pending again while the new competency\'s data loads, after the previous one succeeded', async () => {
      const otherGroupsGate = deferred();
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(otherGroupsUrl).reply(() => otherGroupsGate.released.then(() => [200, otherSingleGroupResponse]));
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      const { rerender } = renderProvider();
      await waitForSuccess();

      rerender(providerFor(otherTagId));
      await screen.findByText('Status: pending');

      await act(async () => {
        otherGroupsGate.release();
      });
      await waitForSuccess();
    });

    it('resets selection and re-arms the auto-selection when both competencies\' trees are already cached', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(otherGroupsUrl).reply(200, otherSingleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      const { rerender } = renderProvider();
      await screen.findByText(selectionOnGroup(10));
      rerender(providerFor(otherTagId));
      await screen.findByText(selectionOnGroup(30));

      rerender(providerFor(tagId));

      expect(await screen.findByText(selectionOnGroup(10))).toBeInTheDocument();
    });
  });

  describe('listed course changes (#683)', () => {
    const groupsRequests = () => axiosMock.history.get.filter((req) => req.url === groupsUrl);

    beforeEach(() => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
    });

    it('stays pending and sends no groups request until the course list has loaded', async () => {
      const listGate = deferred();
      axiosMock.onGet(courseListUrl()).reply(() =>
        listGate.released.then(() => [200, buildCourseListResponse([courseA])])
      );
      renderProvider();
      await waitFor(() => expect(axiosMock.history.get.some((req) => req.url === profileUrl)).toBe(true));
      await flushEffects();

      expect(screen.getByText('Status: pending')).toBeInTheDocument();
      expect(screen.getByText('Course list: loading')).toBeInTheDocument();
      expect(groupsRequests()).toHaveLength(0);

      await act(async () => {
        listGate.release();
      });
      await waitForSuccess();
      expect(groupsRequests()).toHaveLength(1);
    });

    it('scopes the groups request to the listed course keys and exposes the response counts', async () => {
      renderProvider();
      await waitForSuccess();

      expect(groupsRequests()).toHaveLength(1);
      expect(groupsRequests()[0].params).toEqual({ course_keys: defaultListedCourseKeys.join(',') });
      expect(screen.getByText(`Listed course keys: ${JSON.stringify(defaultListedCourseKeys)}`)).toBeInTheDocument();
      expect(screen.getByText('Criteria counts: {"criteriaCount":1,"totalCriteriaCount":1}')).toBeInTheDocument();
    });

    it('requests the list with the page and search, returning to page 1 when the search changes', async () => {
      renderProvider();
      await waitForSuccess();
      await click('Go to page 2');
      await screen.findByText('Course page: 2');

      await click('Search for the same courses');

      await screen.findByText('Course search: "same"');
      expect(screen.getByText('Course page: 1')).toBeInTheDocument();
      const listRequests = axiosMock.history.get.filter((req) => req.url === courseListUrl());
      // No render paired the new search with the old page.
      expect(listRequests.map((req) => [req.params.page, req.params.search])).toEqual([[1, ''], [2, ''], [1, 'same']]);
    });

    it('keeps the previous scope, with no groups request for other keys, while the next page loads', async () => {
      const page2Gate = deferred();
      axiosMock.onGet(courseListUrl()).reply((config) => (
        config.params.page === 2
          ? page2Gate.released.then(() => [200, buildCourseListResponse([courseB])])
          : [200, buildCourseListResponse(defaultListedCourseKeys)]
      ));
      axiosMock.onGet(groupsUrl).reply((config) => [
        200,
        config.params.course_keys === courseB ? courseBGroupsResponse : singleGroupResponse,
      ]);
      axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();

      await click('Go to page 2');
      await screen.findByText('Course list reloading: true');
      await flushEffects();

      // The previous page is still the listed one, so the groups keep their scope and stay settled.
      expect(screen.getByText(`Listed course keys: ${JSON.stringify(defaultListedCourseKeys)}`)).toBeInTheDocument();
      expect(screen.getByText('Status: success')).toBeInTheDocument();
      expect(groupsRequests()).toHaveLength(1);

      await act(async () => {
        page2Gate.release();
      });
      await screen.findByText(`Listed course keys: ${JSON.stringify([courseB])}`);
      await waitForSuccess();
      expect(groupsRequests().map((req) => req.params.course_keys)).toEqual([
        defaultListedCourseKeys.join(','),
        courseB,
      ]);
    });

    it('is pending again until a newly listed course\'s outline loads', async () => {
      const courseBOutlineGate = deferred();
      axiosMock.onGet(groupsUrl).reply((config) => [
        200,
        config.params.course_keys === courseB ? twoCoursesResponse : singleGroupResponse,
      ]);
      axiosMock.onGet(courseBOutlineUrl).reply(() => courseBOutlineGate.released.then(() => [200, outlineFixture]));
      renderProvider();
      await waitForSuccess();

      await click('Search for course B');
      await screen.findByText('Groups index: loaded');
      await screen.findByText(`Listed course keys: ${JSON.stringify([courseB])}`);
      await flushEffects();
      expect(screen.getByText('Status: pending')).toBeInTheDocument();

      await act(async () => {
        courseBOutlineGate.release();
      });
      await waitForSuccess();
    });

    it.each([
      ['rule box', 'Add placeholder rule box in group 10'],
      ['group', 'Add placeholder group under course A'],
    ])(
      'discards a placeholder %s, and goes pending, when a search lists different courses',
      async (_label, addButton) => {
        const groupsGate = deferred();
        axiosMock.onGet(groupsUrl).reply((config) => (
          config.params.course_keys === courseOther
            ? groupsGate.released.then(() => [200, noGroupsResponse])
            : [200, singleGroupResponse]
        ));
        renderProvider();
        await waitForSuccess();
        await click(addButton);
        expect(screen.getByText('Has placeholder: true')).toBeInTheDocument();

        await click('Search for another course');

        await screen.findByText('Status: pending');
        expect(screen.getByText('Has placeholder: false')).toBeInTheDocument();
        expect(noSelection()).toBeInTheDocument();

        await act(async () => {
          groupsGate.release();
        });
        await waitForSuccess();
      },
    );

    it('keeps a placeholder, with no groups refetch, when a search lists the same courses', async () => {
      renderProvider();
      await waitForSuccess();
      await click('Add placeholder rule box in group 10');

      await click('Search for the same courses');
      await screen.findByText('Course search: "same"');
      await waitFor(() => expect(screen.getByText('Course list reloading: false')).toBeInTheDocument());
      await flushEffects();

      expect(screen.getByText('Has placeholder: true')).toBeInTheDocument();
      expect(screen.getByText(selectionOn(10, null))).toBeInTheDocument();
      expect(screen.getByText('Status: success')).toBeInTheDocument();
      expect(groupsRequests()).toHaveLength(1);
    });

    it('keeps a selected saved rule box when a search lists different courses', async () => {
      renderProvider();
      await waitForSuccess();
      await click('Select rule box 10 gte');

      await click('Search for another course');
      await flushEffects();

      expect(screen.getByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();
    });

    it('reports an error, and sends no groups request, when the course list fails', async () => {
      axiosMock.onGet(courseListUrl()).reply(500);
      renderProvider();

      await screen.findByText('Status: error');
      expect(screen.getByText('Course list: error')).toBeInTheDocument();
      expect(screen.getByText(/^Error: .*500/)).toBeInTheDocument();
      expect(groupsRequests()).toHaveLength(0);
    });

    it('ignores a kept selection whose group is out of scope: a create in a listed course sends no group fields', async () => {
      axiosMock.onGet(groupsUrl).reply((config) => [
        200,
        config.params.course_keys === courseOther ? noGroupsResponse : singleGroupResponse,
      ]);
      axiosMock.onPost(createUrl).reply(201, createdCriterion(30));
      renderProvider();
      await waitForSuccess();
      await click('Select rule box 10 gte'); // group 10 belongs to course A

      await click('Search for another course');
      await screen.findByText('Status: pending');
      await waitForSuccess();
      expect(screen.getByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();

      await click('Associate in another course');

      await expectSinglePost({ object_id: 'new-sub' });
    });
  });

  describe('blocked courses', () => {
    const blockedCoursesBody = (rows: { course_key: string; conflicting_tag_value: string; }[]) => ({
      count: rows.length,
      next: null,
      previous: null,
      results: rows.map((row) => ({ ...row, conflicting_tag_id: 7 })),
    });
    const blockedCoursesRequests = (url = blockedCoursesUrl) => axiosMock.history.get.filter((req) => req.url === url);

    beforeEach(() => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
    });

    it('names the related competency for a blocked listed course, and nothing for the others', async () => {
      axiosMock.onGet(blockedCoursesUrl).reply(
        200,
        blockedCoursesBody([
          { course_key: courseA, conflicting_tag_value: 'Inference' },
        ]),
      );
      renderProvider();

      expect(await screen.findByText('Conflict in course A: Inference')).toBeInTheDocument();
      expect(screen.getByText('Conflict in course B: none')).toBeInTheDocument();
    });

    it.each([404, 500])('names nothing, and shows no toast, when the lookup fails with %s', async (status) => {
      axiosMock.onGet(blockedCoursesUrl).reply(status);
      renderProvider();

      await waitFor(() => (
        expect(
          queryClient.getQueryState(
            competencyQueryKeys.competencyBlockedCourses(tagId, defaultListedCourseKeys),
          )?.status,
        ).toEqual('error')
      ));
      expect(screen.getByText('Conflict in course A: none')).toBeInTheDocument();
      expect(await waitForSuccess()).toBeInTheDocument();
      expect(screen.getByText('Error: none')).toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('asks again each time the author returns to a page, once the app\'s one-hour stale time applies', async () => {
      queryClient.setDefaultOptions({ queries: { retry: false, staleTime: 60 * 60_000 } });
      axiosMock.onGet(blockedCoursesUrl).reply(200, blockedCoursesBody([]));
      renderProvider();
      await waitFor(() => expect(blockedCoursesRequests()).toHaveLength(1));

      await click('Go to page 2');
      await waitFor(() => expect(blockedCoursesRequests()).toHaveLength(2));
      expect(await screen.findByText('Course list reloading: false')).toBeInTheDocument();
      await click('Go to page 1');

      await waitFor(() => expect(blockedCoursesRequests()).toHaveLength(3));
    });

    it('asks again after the backend rejects an add as a hierarchy conflict, and then names the competency', async () => {
      axiosMock.onGet(blockedCoursesUrl)
        .replyOnce(200, blockedCoursesBody([]))
        .onGet(blockedCoursesUrl)
        .reply(200, blockedCoursesBody([{ course_key: courseA, conflicting_tag_value: 'Inference' }]));
      axiosMock.onPost(createUrl).reply(400, {
        tag_id: ['An ancestor or descendant competency already has criteria in this course.'],
      });
      renderProvider();
      await waitForSuccess();
      await waitFor(() => expect(blockedCoursesRequests()).toHaveLength(1));
      expect(screen.getByText('Conflict in course A: none')).toBeInTheDocument();

      await click('Associate in course A');

      await waitFor(() => expect(blockedCoursesRequests()).toHaveLength(2));
      expect(await screen.findByText('Conflict in course A: Inference')).toBeInTheDocument();
    });

    it('re-scopes to the keys of the next course list page, keeping no previous conflict while they load', async () => {
      axiosMock.onGet(blockedCoursesUrl).reply((config) => (
        config.params.course_keys.includes(courseA)
          ? [200, blockedCoursesBody([{ course_key: courseA, conflicting_tag_value: 'Inference' }])]
          : new Promise(() => {})
      ));
      renderProvider();
      expect(await screen.findByText('Conflict in course A: Inference')).toBeInTheDocument();

      await click('Go to page 2');

      await waitFor(() => expect(blockedCoursesRequests()).toHaveLength(2));
      expect(blockedCoursesRequests()[1].params).toEqual({ course_keys: courseB });
      expect(screen.getByText('Conflict in course A: none')).toBeInTheDocument();
    });

    it('keeps the previous page\'s conflict, and sends no request, while the next page of courses loads', async () => {
      const pageTwoGate = deferred();
      axiosMock.onGet(courseListUrl()).reply((config) => (
        config.params.page === 2
          ? pageTwoGate.released.then(() => [200, buildCourseListResponse([courseB])])
          : [200, buildCourseListResponse(defaultListedCourseKeys)]
      ));
      axiosMock.onGet(blockedCoursesUrl).reply((config) => (
        config.params.course_keys === courseB
          ? [200, blockedCoursesBody([{ course_key: courseB, conflicting_tag_value: 'Deduction' }])]
          : [200, blockedCoursesBody([{ course_key: courseA, conflicting_tag_value: 'Inference' }])]
      ));
      renderProvider();
      expect(await screen.findByText('Conflict in course A: Inference')).toBeInTheDocument();

      await click('Go to page 2');

      expect(await screen.findByText('Course list reloading: true')).toBeInTheDocument();
      await flushEffects();
      expect(screen.getByText('Conflict in course A: Inference')).toBeInTheDocument();
      expect(blockedCoursesRequests()).toHaveLength(1);

      await act(async () => {
        pageTwoGate.release();
      });

      expect(await screen.findByText('Conflict in course B: Deduction')).toBeInTheDocument();
      expect(screen.getByText('Conflict in course A: none')).toBeInTheDocument();
      expect(blockedCoursesRequests()).toHaveLength(2);
      expect(blockedCoursesRequests()[1].params).toEqual({ course_keys: courseB });
    });

    it('fetches again for a newly selected competency, keeping no previous conflict while it loads', async () => {
      axiosMock.onGet(otherGroupsUrl).reply(200, noGroupsResponse);
      axiosMock.onGet(blockedCoursesUrl).reply(
        200,
        blockedCoursesBody([
          { course_key: courseA, conflicting_tag_value: 'Inference' },
        ]),
      );
      axiosMock.onGet(apiUrls.competencyBlockedCourses(otherTagId)).reply(() => new Promise(() => {}));
      const { rerender } = renderProvider();
      expect(await screen.findByText('Conflict in course A: Inference')).toBeInTheDocument();

      rerender(providerFor(otherTagId));

      await waitFor(() => (
        expect(blockedCoursesRequests(apiUrls.competencyBlockedCourses(otherTagId))).toHaveLength(1)
      ));
      expect(screen.getByText('Conflict in course A: none')).toBeInTheDocument();
    });
  });

  describe('placeholders', () => {
    const placeholderScore = { op: 'gte', value: 0.85, scale: 'percent' };

    const renderLoaded = async (groups = singleGroupResponse) => {
      axiosMock.onGet(groupsUrl).reply(200, groups);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      const view = renderProvider();
      await waitForSuccess();
      return view;
    };

    it('adding a rule box selects the group with no rule key', async () => {
      await renderLoaded();

      await click('Add placeholder rule box in group 10');

      expect(screen.getByText(selectionOn(10, null))).toBeInTheDocument();
      expect(screen.getByText('Has placeholder: true')).toBeInTheDocument();
    });

    it('adding a group replaces a placeholder rule box, since selection has one slot', async () => {
      await renderLoaded();
      await click('Add placeholder rule box in group 10');
      expect(screen.getByText(selectionOn(10, null))).toBeInTheDocument();

      await click('Add placeholder group under course A');

      expect(screen.getByText('Selection: group null, rule none')).toBeInTheDocument();
      expect(screen.getByText(/"parentRuleGroupId":1,"logicOperator":"OR"/)).toBeInTheDocument();
    });

    it('selecting a real group clears the placeholder', async () => {
      await renderLoaded(courseBGroupsResponse);
      await click('Add placeholder rule box in group 10');
      expect(screen.getByText('Has placeholder: true')).toBeInTheDocument();

      await click('Select group 21');

      expect(screen.getByText('Has placeholder: false')).toBeInTheDocument();
      expect(screen.getByText(selectionOn(21, eqKey))).toBeInTheDocument();
    });

    it('keeps the placeholder rule box selection instead of resolving its null key to the last box', async () => {
      await renderLoaded();
      await click('Add placeholder rule box in group 10');
      await flushEffects();

      expect(screen.getByText(selectionOn(10, null))).toBeInTheDocument();
    });

    it('moves selection off a placeholder onto another course\'s last group when that course expands', async () => {
      await renderLoaded(twoCoursesResponse);
      await click('Add placeholder rule box in group 10');

      await click('Expand course B');

      expect(await screen.findByText(selectionOnGroup(20))).toBeInTheDocument();
    });

    it.each([
      ['rule box in a real group', 'Add placeholder rule box in group 10', selectionOn(10, null)],
      ['group', 'Add placeholder group under course A', 'Selection: group null, rule none'],
    ])('keeps a placeholder %s selected when its own course expands', async (_label, addAction, expectedSelection) => {
      await renderLoaded();
      await click(addAction);

      await click('Expand course A');

      expect(screen.getByText(expectedSelection)).toBeInTheDocument();
    });

    it('discarding the placeholder clears selection', async () => {
      await renderLoaded();
      await click('Add placeholder group under course A');

      await click('Discard placeholder');

      expect(noSelection()).toBeInTheDocument();
    });

    it('sends nothing and flags a rejection when the placeholder\'s default score duplicates a box', async () => {
      axiosMock.onPost(createUrl).reply(201, createdCriterion(10));
      await renderLoaded();
      await click('Add placeholder rule box in group 10');

      await click('Associate in course A');
      await flushEffects();

      expect(axiosMock.history.post).toHaveLength(0);
      expect(screen.getByText('Duplicate rejected: true')).toBeInTheDocument();
    });

    it('clears the rejection once the author changes the placeholder\'s score', async () => {
      await renderLoaded();
      await click('Add placeholder rule box in group 10');
      await click('Associate in course A');
      expect(screen.getByText('Duplicate rejected: true')).toBeInTheDocument();

      await click('Set placeholder score');

      expect(screen.getByText('Duplicate rejected: false')).toBeInTheDocument();
    });

    it('drops the selection on a group missing from the loaded tree', async () => {
      await renderLoaded();

      await click('Select group 999');

      expect(noSelection()).toBeInTheDocument();
    });

    it('counts each rejection, including a repeat while the flag is already set', async () => {
      await renderLoaded();
      await click('Add placeholder rule box in group 10');

      await click('Associate in course A');
      expect(screen.getByText('Duplicate rejection count: 1')).toBeInTheDocument();
      await click('Associate in course A');

      expect(screen.getByText('Duplicate rejection count: 2')).toBeInTheDocument();
      expect(screen.getByText('Duplicate rejected: true')).toBeInTheDocument();
    });

    it('resets the rejection count when the competency changes', async () => {
      axiosMock.onGet(otherGroupsUrl).reply(200, otherSingleGroupResponse);
      const view = await renderLoaded();
      await click('Add placeholder rule box in group 10');
      await click('Associate in course A');
      expect(screen.getByText('Duplicate rejection count: 1')).toBeInTheDocument();

      view.rerender(providerFor(otherTagId));

      await waitFor(() => expect(screen.getByText('Duplicate rejection count: 0')).toBeInTheDocument());
    });

    describe('when a groups refetch removes what the placeholder belongs to', () => {
      const refetchGroupsAs = async (reply: typeof singleGroupResponse) => {
        axiosMock.onGet(groupsUrl).reply(200, reply);
        await act(async () => {
          await queryClient.invalidateQueries({ queryKey: competencyQueryKeys.competencyCriteriaGroups(tagId) });
        });
      };

      it('drops a placeholder rule box whose group is gone', async () => {
        await renderLoaded();
        await click('Add placeholder rule box in group 10');
        expect(screen.getByText('Has placeholder: true')).toBeInTheDocument();

        await refetchGroupsAs(otherSingleGroupResponse);

        await waitFor(() => expect(screen.getByText('Has placeholder: false')).toBeInTheDocument());
      });

      it('drops a placeholder group whose parent course-level group is gone', async () => {
        await renderLoaded();
        await click('Add placeholder group under course A');
        expect(screen.getByText('Has placeholder: true')).toBeInTheDocument();

        await refetchGroupsAs(noGroupsResponse);

        await waitFor(() => expect(screen.getByText('Has placeholder: false')).toBeInTheDocument());
      });

      it('keeps a placeholder whose group is still there', async () => {
        await renderLoaded();
        await click('Add placeholder rule box in group 10');

        await refetchGroupsAs(twoGroupsResponse);
        await flushEffects();

        expect(screen.getByText('Has placeholder: true')).toBeInTheDocument();
      });
    });

    it('sends the chosen logic_operator and score together for a placeholder group', async () => {
      axiosMock.onPost(createUrl).reply(201, createdCriterion(11, placeholderScore as GradeRulePayload));
      await renderLoaded();
      await click('Add placeholder group under course A');
      await click('Set placeholder logic operator to AND');
      await click('Set placeholder score');

      await click('Associate in course A');

      await expectSinglePost({
        object_id: 'new-sub',
        logic_operator: 'AND',
        rule_type_override: 'grade',
        rule_payload_override: placeholderScore,
      });
    });

    it('sends no optional field for a placeholder group when the subsection is from a course without groups', async () => {
      axiosMock.onPost(createUrl).reply(201, createdCriterion(20));
      await renderLoaded();
      await click('Add placeholder group under course A');

      await click('Associate in another course');

      await expectSinglePost({ object_id: 'new-sub' });
    });
  });

  describe('deleting a rule group', () => {
    const deleteUrl = apiUrls.competencyCriteriaGroup(tagId, 10);
    const groupsReads = () => axiosMock.history.get.filter((request) => request.url === groupsUrl);
    const keyboardRequest = (request: object | null) => `Keyboard request: ${JSON.stringify(request)}`;

    /** `mockHeldGroupsRefetch`, plus the profile and both course outline reads. */
    const mockGroupsReads = (initial: object, refetched: object) => {
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      return mockHeldGroupsRefetch(axiosMock, tagId, initial, refetched);
    };

    const renderWithSelectionOnGroup10 = async () => {
      renderProvider();
      await waitForSuccess();
      await click('Select group 10');
      expect(screen.getByText(selectionOnGroup(10))).toBeInTheDocument();
    };

    const deleteAndRefetch = async (action: string, reads: { release: () => void; }) => {
      await requestAndConfirm(action);
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      await act(async () => {
        reads.release();
      });
    };

    it('keeps the dialog open until the refetch lands, then closes it, selects the neighbor and requests keyboard focus for it', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, {});
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, afterDeletingGroup10Response);
      await renderWithSelectionOnGroup10();

      await requestAndConfirm('Delete group 10');

      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      // The delete itself has resolved, but the refetch has not.
      expect(screen.getByText('Deleting: true')).toBeInTheDocument();
      expect(screen.getByText(pendingRemoval('{"kind":"ruleGroup","failure":null}'))).toBeInTheDocument();
      expect(screen.getByText(selectionOnGroup(10))).toBeInTheDocument();

      await act(async () => {
        reads.release();
      });

      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(screen.getByText(selectionOn(11, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 11, selectionMoved: true })))
        .toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('treats a 404 as success: no failure, and selection still moves off the vanished group', async () => {
      axiosMock.onDelete(deleteUrl).reply(404);
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, afterDeletingGroup10Response);
      await renderWithSelectionOnGroup10();

      await deleteAndRefetch('Delete group 10', reads);

      expect(await screen.findByText(selectionOn(11, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('keeps the dialog open on a failure, keeps selection when the group is still there, and requests no keyboard focus', async () => {
      axiosMock.onDelete(deleteUrl).reply(500);
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, twoGroupsWithCriteriaResponse);
      await renderWithSelectionOnGroup10();

      await deleteAndRefetch('Delete group 10', reads);

      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
      expect(await screen.findByText(pendingRemoval('{"kind":"ruleGroup","failure":"nothing-removed"}')))
        .toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(screen.getByText(selectionOnGroup(10))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest(null))).toBeInTheDocument();
    });

    it('keeps the loaded groups and clears selection when the refetch after a successful delete fails', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, {});
      axiosMock.onGet(groupsUrl).replyOnce(200, twoGroupsWithCriteriaResponse).onGet(groupsUrl).reply(500);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      await renderWithSelectionOnGroup10();

      await requestAndConfirm('Delete group 10');

      await waitFor(() => expect(screen.getByText('Deleting: false')).toBeInTheDocument());
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      expect(screen.getByText('Status: success')).toBeInTheDocument();
      expect(screen.getByText('Error: none')).toBeInTheDocument();
      expect(screen.getByText('Groups refresh error: true')).toBeInTheDocument();
      expect(screen.getByText('Groups index: loaded')).toBeInTheDocument();
      expect(noSelection()).toBeInTheDocument();
    });

    it.each([
      { selected: 'the group', setUp: async () => {} },
      { selected: 'nothing', setUp: clearSelectionByAddingAndDiscardingPlaceholderRuleBox },
    ])('requests the empty state when the delete leaves no course group and $selected was selected', async (
      { setUp },
    ) => {
      axiosMock.onDelete(deleteUrl).reply(200, {});
      const reads = mockGroupsReads(singleGroupResponse, noGroupsResponse);
      renderProvider();
      expect(await screen.findByText(selectionOnGroup(10))).toBeInTheDocument();
      await setUp();

      await deleteAndRefetch('Delete group 10', reads);

      expect(await screen.findByText(keyboardRequest({ kind: 'empty' }))).toBeInTheDocument();
      expect(noSelection()).toBeInTheDocument();
    });

    it('clears the keyboard focus request when selection is written some other way', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, {});
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, afterDeletingGroup10Response);
      await renderWithSelectionOnGroup10();
      await deleteAndRefetch('Delete group 10', reads);
      expect(await screen.findByText(keyboardRequest({ kind: 'group', groupId: 11, selectionMoved: true })))
        .toBeInTheDocument();

      await click('Select group 11');

      expect(screen.getByText(keyboardRequest(null))).toBeInTheDocument();
    });

    it('selects the last rule group of the course group above when deleting the only rule group removes its course group', async () => {
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 20)).reply(200, {});
      const reads = mockGroupsReads(twoCoursesWithCriteriaResponse, {
        groups: twoCoursesWithCriteriaResponse.groups.filter((item) => item.id !== 2 && item.id !== 20),
        criteria: twoCoursesWithCriteriaResponse.criteria.filter((item) => item.groupId === 10),
      });
      renderProvider();
      await waitForSuccess();
      await click('Select group 20');

      await deleteAndRefetch('Delete group 20', reads);

      expect(await screen.findByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 10, selectionMoved: true })))
        .toBeInTheDocument();
    });

    it('lands on the first rule box of the neighbor group, not its last', async () => {
      // Group 11 holds a `gte` box, then an `eq` box.
      axiosMock.onDelete(deleteUrl).reply(200, {});
      const reads = mockGroupsReads(threeGroupsWithCriteriaResponse, afterDeletingGroup10OfThreeResponse);
      await renderWithSelectionOnGroup10();

      await deleteAndRefetch('Delete group 10', reads);

      expect(await screen.findByText(selectionOn(11, gte70PercentRuleKey))).toBeInTheDocument();
    });

    it('keeps selection, and asks to keep sections as they are, when the deleted group did not hold selection', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, {});
      const reads = mockGroupsReads(threeGroupsWithCriteriaResponse, afterDeletingGroup10OfThreeResponse);
      renderProvider();
      await waitForSuccess();
      await click('Select rule box 12 eq');

      await deleteAndRefetch('Delete group 10', reads);

      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
      expect(screen.getByText(selectionOn(12, eqKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 12, selectionMoved: false })))
        .toBeInTheDocument();
    });

    it('respects a click made on another group\'s rule box while the delete is pending', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, {});
      const reads = mockGroupsReads(threeGroupsWithCriteriaResponse, afterDeletingGroup10OfThreeResponse);
      await renderWithSelectionOnGroup10();

      await requestAndConfirm('Delete group 10');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      await click('Select rule box 12 eq');
      await act(async () => {
        reads.release();
      });

      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
      expect(screen.getByText(selectionOn(12, eqKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 12, selectionMoved: false })))
        .toBeInTheDocument();
    });

    describe('when the author switches competency while a delete is pending', () => {
      const renderSwitchedWhileDeleting = async () => {
        const deleteGate = deferred();
        axiosMock.onDelete(deleteUrl).reply(() => deleteGate.released.then(() => [200, {}]));
        mockGroupsReads(twoGroupsWithCriteriaResponse, afterDeletingGroup10Response);
        axiosMock.onGet(otherGroupsUrl).reply(200, otherSingleGroupResponse);
        const { rerender } = renderProvider();
        await waitForSuccess();
        await click('Select group 10');
        await requestAndConfirm('Delete group 10');
        await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
        rerender(providerFor(otherTagId));
        await screen.findByText(selectionOnGroup(30));
        return deleteGate;
      };

      it('leaves the new competency\'s selection alone when the delete settles', async () => {
        const deleteGate = await renderSwitchedWhileDeleting();

        await act(async () => {
          deleteGate.release();
        });
        await flushEffects();

        expect(screen.getByText(selectionOnGroup(30))).toBeInTheDocument();
        expect(screen.getByText(keyboardRequest(null))).toBeInTheDocument();
      });

      it('does not report the other competency\'s delete as in flight', async () => {
        await renderSwitchedWhileDeleting();

        expect(screen.getByText('Deleting: false')).toBeInTheDocument();
      });

      it('sends a delete started in the new competency', async () => {
        axiosMock.onDelete(apiUrls.competencyCriteriaGroup(otherTagId, 30)).reply(200, {});
        await renderSwitchedWhileDeleting();

        await requestAndConfirm('Delete group 30');

        await waitFor(() => expect(axiosMock.history.delete).toHaveLength(2));
      });
    });

    it('requests the empty state when only a course group the author cannot see is left', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, {});
      const reads = mockGroupsReads(twoCoursesWithCriteriaResponse, {
        groups: twoCoursesWithCriteriaResponse.groups.filter((item) => item.id !== 1 && item.id !== 10),
        criteria: twoCoursesWithCriteriaResponse.criteria.filter((item) => item.groupId === 20),
      });
      axiosMock.onGet(courseBOutlineUrl).reply(403);
      await renderWithSelectionOnGroup10();

      await deleteAndRefetch('Delete group 10', reads);

      expect(await screen.findByText(keyboardRequest({ kind: 'empty' }))).toBeInTheDocument();
      expect(noSelection()).toBeInTheDocument();
    });

    describe('when a course group is deleted', () => {
      const courseGroupUrl = apiUrls.competencyCriteriaGroup(tagId, 1);
      const afterDeletingCourseGroup1Response = {
        groups: twoCoursesWithCriteriaResponse.groups.filter((item) => item.id !== 1 && item.id !== 10),
        criteria: twoCoursesWithCriteriaResponse.criteria.filter((item) => item.groupId === 20),
      };

      it('keeps the dialog open on a failure, keeps selection, and requests no keyboard focus', async () => {
        axiosMock.onDelete(courseGroupUrl).reply(500);
        const reads = mockGroupsReads(twoCoursesWithCriteriaResponse, twoCoursesWithCriteriaResponse);
        await renderWithSelectionOnGroup10();

        await deleteAndRefetch('Request remove course group 1', reads);

        expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
        expect(await screen.findByText(pendingRemoval('{"kind":"courseGroup","failure":"nothing-removed"}')))
          .toBeInTheDocument();
        expect(mockShowToast).not.toHaveBeenCalled();
        expect(screen.getByText(selectionOnGroup(10))).toBeInTheDocument();
        expect(screen.getByText(keyboardRequest(null))).toBeInTheDocument();
      });

      it('treats a 404 as success: no toast, and selection moves off the vanished course group', async () => {
        axiosMock.onDelete(courseGroupUrl).reply(404);
        const reads = mockGroupsReads(twoCoursesWithCriteriaResponse, afterDeletingCourseGroup1Response);
        await renderWithSelectionOnGroup10();

        await deleteAndRefetch('Request remove course group 1', reads);

        expect(await screen.findByText(selectionOn(20, gte70PercentRuleKey))).toBeInTheDocument();
        expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 20, selectionMoved: true })))
          .toBeInTheDocument();
        expect(mockShowToast).not.toHaveBeenCalled();
      });
    });

    describe('when the deleted group held no selection', () => {
      it('requests keyboard focus on its nearest surviving neighbor and leaves selection unset', async () => {
        axiosMock.onDelete(deleteUrl).reply(200, {});
        const reads = mockGroupsReads(threeGroupsWithCriteriaResponse, afterDeletingGroup10OfThreeResponse);
        renderProvider();
        await waitForSuccess();

        await deleteAndRefetch('Delete group 10', reads);

        expect(await screen.findByText(keyboardRequest({ kind: 'group', groupId: 11, selectionMoved: false })))
          .toBeInTheDocument();
        expect(noSelection()).toBeInTheDocument();
      });

      it('requests keyboard focus on the neighbor and keeps the placeholder group selected', async () => {
        axiosMock.onDelete(deleteUrl).reply(200, {});
        const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, afterDeletingGroup10Response);
        renderProvider();
        await waitForSuccess();
        await click('Add placeholder group under course A');

        await deleteAndRefetch('Delete group 10', reads);

        expect(await screen.findByText(keyboardRequest({ kind: 'group', groupId: 11, selectionMoved: false })))
          .toBeInTheDocument();
        expect(screen.getByText('Selection: group null, rule none')).toBeInTheDocument();
      });

      it('requests the empty state when the delete leaves no group', async () => {
        axiosMock.onDelete(deleteUrl).reply(200, {});
        const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, noGroupsResponse);
        renderProvider();
        await waitForSuccess();

        await deleteAndRefetch('Delete group 10', reads);

        expect(await screen.findByText(keyboardRequest({ kind: 'empty' }))).toBeInTheDocument();
        expect(noSelection()).toBeInTheDocument();
      });
    });

    it('selects the first rule box of a new course group once its outline loads, and requests keyboard focus', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, {});
      const reads = mockGroupsReads(singleGroupResponse, {
        groups: twoCoursesResponse.groups.filter((item) => item.id !== 1 && item.id !== 10),
        criteria: [criterion(902, 'sub-b', 20)],
      });
      renderProvider();
      expect(await screen.findByText(selectionOnGroup(10))).toBeInTheDocument();

      await deleteAndRefetch('Delete group 10', reads);

      expect(await screen.findByText(selectionOn(20, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 20, selectionMoved: true })))
        .toBeInTheDocument();
    });

    it('drops a pending new course group when a search lists other courses before its outline loads', async () => {
      const otherCourseResponse = {
        groups: [group(500, null, null, 0), group(3, 500, courseOther, 0), group(30, 3, null, 0)],
        criteria: [criterion(930, 'other-sub', 30)],
        criteriaCount: 1,
        totalCriteriaCount: 1,
      };
      let defaultScopeReads = 0;
      axiosMock.onGet(groupsUrl).reply((config) => {
        if (config.params.course_keys === courseOther) {
          return [200, otherCourseResponse];
        }
        defaultScopeReads += 1;
        return [
          200,
          defaultScopeReads === 1 ? singleGroupResponse : {
            groups: twoCoursesResponse.groups.filter((item) => item.id !== 1 && item.id !== 10),
            criteria: [criterion(902, 'sub-b', 20)],
          },
        ];
      });
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onGet(courseBOutlineUrl).reply(() => new Promise(() => {}));
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseOther)).reply(200, outlineFixture);
      axiosMock.onDelete(deleteUrl).reply(200, {});
      renderProvider();
      expect(await screen.findByText(selectionOnGroup(10))).toBeInTheDocument();

      await requestAndConfirm('Delete group 10');
      await waitFor(() => expect(defaultScopeReads).toBe(2));
      await screen.findByText('Deleting: false');
      await click('Search for another course');
      await waitFor(() => expect(screen.getByText('Status: success')).toBeInTheDocument());
      await flushEffects();

      expect(noSelection()).toBeInTheDocument();
      expect(screen.queryByText(keyboardRequest({ kind: 'group', groupId: 30, selectionMoved: true })))
        .not.toBeInTheDocument();
    });

    it('clears selection and requests the empty state when only a new course the author cannot access remains', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, {});
      const reads = mockGroupsReads(singleGroupResponse, {
        groups: twoCoursesResponse.groups.filter((item) => item.id !== 1 && item.id !== 10),
        criteria: [],
      });
      axiosMock.onGet(courseBOutlineUrl).reply(403);
      renderProvider();
      expect(await screen.findByText(selectionOnGroup(10))).toBeInTheDocument();

      await deleteAndRefetch('Delete group 10', reads);

      expect(await screen.findByText(keyboardRequest({ kind: 'empty' }))).toBeInTheDocument();
      expect(noSelection()).toBeInTheDocument();
    });
  });

  describe('deleting a rule box', () => {
    const deleteUrlOf = (criterionId: number) => apiUrls.deleteCompetencyCriterion(tagId, criterionId);
    const sentDeleteUrls = () => axiosMock.history.delete.map((request) => request.url);
    const groupsReads = () => axiosMock.history.get.filter((request) => request.url === groupsUrl);
    const keyboardRequest = (request: object | null) => `Keyboard request: ${JSON.stringify(request)}`;
    // An unmatched URL answers 404, which counts as removed, so every DELETE is mocked and the sent URLs asserted.
    const mockDeletes = (...criterionIds: number[]) => {
      criterionIds.forEach((id) => {
        axiosMock.onDelete(deleteUrlOf(id)).reply(200, { id, archived: false });
      });
    };

    /** `mockHeldGroupsRefetch`, plus the profile and course A outline reads. */
    const mockGroupsReads = (initial: object, refetched: object) => {
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      return mockHeldGroupsRefetch(axiosMock, tagId, initial, refetched);
    };

    const renderLoaded = async () => {
      renderProvider();
      await waitForSuccess();
      await waitFor(() => expect(accessibleCourses()).toHaveTextContent(courseA));
    };

    /** Requests the removal behind `name` and confirms it, then lets the held refetch land and the delete settle. */
    const clickAndSettle = async (name: string, reads: { release: () => void; }) => {
      await requestAndConfirm(name);
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      await act(async () => {
        reads.release();
      });
      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
    };

    it('sends exactly the box\'s criteria in order, refetches once, and leaves the other boxes alone', async () => {
      // Start: group 10 holds a 70% box (901, 905, 906) and an 80% box (903).
      // Remove: the 70% box.
      // After: only the 80% box (903) is left. Selection is not checked here.
      mockDeletes(...criterionIdsIn70PercentRuleBox);
      const reads = mockGroupsReads(
        threeCriteriaInOneRuleBoxResponse,
        responseWithoutCriteria(threeCriteriaInOneRuleBoxResponse, criterionIdsIn70PercentRuleBox),
      );
      await renderLoaded();

      await clickAndSettle('Delete the 70% rule box in group 10', reads);

      expect(sentDeleteUrls()).toEqual(criterionIdsIn70PercentRuleBox.map(deleteUrlOf));
      expect(groupsReads()).toHaveLength(2);
      expect(screen.getByText(criterionIdsShown(criterionIdsIn80PercentRuleBox))).toBeInTheDocument();
      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('does not send content that shows up at the same score during the run, and keeps that box selected', async () => {
      // Start: group 10 holds a 70% box (901, 905) and an 80% box (903), and the 70% box is selected.
      // During the run: another session removes 901 and 905 and adds criterion 908 at 70%.
      // Remove: the 70% box, which showed 901 and 905 when it was clicked.
      // After: the 70% box holds 908, which was never deleted, and is still selected. The 80% box (903) is untouched.
      const criterionIdsInBoxWhenClicked = [901, 905];
      const criterionIdAddedByAnotherSession = 908;
      const responseWhenClicked: CompetencyCriteriaGroupsResponse = {
        ...singleGroupResponse,
        criteria: [
          ...criterionIdsInBoxWhenClicked.map((id) => criterionInGroupAtScore(id, 10, null)),
          ...criterionIdsIn80PercentRuleBox.map((id) => criterionInGroupAtScore(id, 10, 80)),
        ],
      };
      const responseAfterAnotherSessionAddedACriterion: CompetencyCriteriaGroupsResponse = {
        ...singleGroupResponse,
        criteria: [
          criterionInGroupAtScore(criterionIdAddedByAnotherSession, 10, null),
          ...criterionIdsIn80PercentRuleBox.map((id) => criterionInGroupAtScore(id, 10, 80)),
        ],
      };
      mockDeletes(...criterionIdsInBoxWhenClicked);
      const reads = mockGroupsReads(responseWhenClicked, responseAfterAnotherSessionAddedACriterion);
      await renderLoaded();
      await click('Select rule box 10 gte');

      await clickAndSettle('Delete the 70% rule box in group 10', reads);

      expect(sentDeleteUrls()).toEqual(criterionIdsInBoxWhenClicked.map(deleteUrlOf));
      expect(screen.getByText(criterionIdsShown([criterionIdAddedByAnotherSession, ...criterionIdsIn80PercentRuleBox])))
        .toBeInTheDocument();
      expect(screen.getByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();
    });

    it('leaves the dialog closed for criterion ids the group no longer has', async () => {
      // Start: group 10 holds a 70% box (901, 905, 906) and an 80% box (903).
      // Request: removing criterion 999, which group 10 does not hold.
      // After: no dialog opened, nothing was sent and nothing was refetched.
      mockGroupsReads(threeCriteriaInOneRuleBoxResponse, threeCriteriaInOneRuleBoxResponse);
      await renderLoaded();

      await click('Delete rule box with ids 999');

      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(axiosMock.history.delete).toHaveLength(0);
      expect(screen.getByText('Deleting: false')).toBeInTheDocument();
      expect(groupsReads()).toHaveLength(1);
    });

    it.each([
      {
        // Group 10's boxes: 70% (removed, selected), 80%, 90%. Nothing is above the removed box, so the box below
        // (80%) is selected.
        name: 'the first of three boxes',
        initial: threeRuleBoxesInGroup10Response,
        selectAction: 'Select rule box 10 gte',
        deleteAction: 'Delete the 70% rule box in group 10',
        removedCriterionId: criterionIdIn70PercentRuleBoxOfGroup10,
        expectedSelectionKey: gte80PercentRuleKey,
      },
      {
        // Group 10's boxes: 70%, 80%, 90% (removed, selected), 95%. The box above (80%) is selected. It is neither
        // the group's first box nor the box below (95%).
        name: 'the third of four boxes',
        initial: fourRuleBoxesInGroup10Response,
        selectAction: 'Select the 90% rule box in group 10',
        deleteAction: 'Delete the 90% rule box in group 10',
        removedCriterionId: criterionIdIn90PercentRuleBoxOfGroup10,
        expectedSelectionKey: gte80PercentRuleKey,
      },
    ])('moves selection to the box above, else below, when $name was selected and removed', async (
      { initial, selectAction, deleteAction, removedCriterionId, expectedSelectionKey },
    ) => {
      mockDeletes(removedCriterionId);
      const reads = mockGroupsReads(initial, responseWithoutCriteria(initial, [removedCriterionId]));
      await renderLoaded();
      await click(selectAction);

      await clickAndSettle(deleteAction, reads);

      expect(sentDeleteUrls()).toEqual([deleteUrlOf(removedCriterionId)]);
      expect(screen.getByText(selectionOn(10, expectedSelectionKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 10, selectionMoved: false })))
        .toBeInTheDocument();
    });

    it.each([
      {
        selected: 'on another box of the same group',
        selectAction: 'Select rule box 10 gte',
        selectionText: selectionOn(10, gte70PercentRuleKey),
        keyboardGroupId: 10,
      },
      {
        selected: 'in another group',
        selectAction: 'Select group 11',
        selectionText: selectionOn(11, gte70PercentRuleKey),
        keyboardGroupId: 11,
      },
      { selected: 'nothing', selectAction: null, selectionText: 'Selection: none', keyboardGroupId: 10 },
    ])('keeps the selection ($selected) and asks group $keyboardGroupId to take keyboard focus', async (
      { selectAction, selectionText, keyboardGroupId },
    ) => {
      // Start: group 10 holds a 70% box (901), an 80% box (903) and a 90% box (904), and group 11 a 70% box (902).
      //   Per case, the selection is on group 10's 70% box, on group 11, or nothing.
      // Remove: group 10's 80% box, which is never the selected one.
      // After: group 10 holds its 70% and 90% boxes, and the selection is unchanged.
      mockDeletes(criterionIdIn80PercentRuleBoxOfGroup10);
      const reads = mockGroupsReads(
        threeRuleBoxesInGroup10Response,
        responseWithoutCriteria(threeRuleBoxesInGroup10Response, [criterionIdIn80PercentRuleBoxOfGroup10]),
      );
      await renderLoaded();
      if (selectAction !== null) {
        await click(selectAction);
      }
      expect(screen.getByText(selectionText)).toBeInTheDocument();

      await clickAndSettle('Delete the 80% rule box in group 10', reads);

      expect(screen.getByText(selectionText)).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: keyboardGroupId, selectionMoved: false })))
        .toBeInTheDocument();
    });

    it('selects the neighbor group\'s first box when the last box takes its group away', async () => {
      // Start: group 10 holds a 70% box (901) and group 11 holds a 70% box (902). Group 10 is selected.
      // Remove: group 10's only box, so group 10 goes too.
      // After: group 11 and its 70% box are selected.
      mockDeletes(criterionIdIn70PercentRuleBoxOfGroup10);
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, afterDeletingGroup10Response);
      await renderLoaded();
      await click('Select group 10');

      await clickAndSettle('Delete the 70% rule box in group 10', reads);

      expect(screen.getByText(selectionOn(11, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 11, selectionMoved: true })))
        .toBeInTheDocument();
    });

    it('selects the group above, with its first box, when the last box takes its own group away', async () => {
      // Start: group 10 holds a 70% box (901) and group 11 holds a 70% box (902). Group 11 is selected.
      // Remove: group 11's only box, so group 11 goes too.
      // After: group 10 and its 70% box are selected.
      mockDeletes(criterionIdIn70PercentRuleBoxOfGroup11);
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, {
        groups: twoGroupsWithCriteriaResponse.groups.filter((group) => group.id !== 11),
        criteria: twoGroupsWithCriteriaResponse.criteria.filter((item) => item.groupId !== 11),
      });
      await renderLoaded();
      await click('Select group 11');

      await clickAndSettle('Delete the 70% rule box in group 11', reads);

      expect(screen.getByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 10, selectionMoved: true })))
        .toBeInTheDocument();
    });

    it('follows the selection move, not the vanished group, when another author deleted the selected group meanwhile', async () => {
      // Start: group 10 holds a 70% box (901), an 80% box (903) and a 90% box (904), and group 11 a 70% box (902).
      //   Group 11 is selected.
      // During the run: another author deletes group 11.
      // Remove: group 10's 80% box.
      // After: group 10 holds its 70% and 90% boxes, and group 10 is selected, because the selection moved off the
      // vanished group 11.
      mockDeletes(criterionIdIn80PercentRuleBoxOfGroup10);
      const reads = mockGroupsReads(threeRuleBoxesInGroup10Response, {
        groups: threeRuleBoxesInGroup10Response.groups.filter((group) => group.id !== 11),
        criteria: responseWithoutCriteria(
          threeRuleBoxesInGroup10Response,
          [criterionIdIn80PercentRuleBoxOfGroup10, criterionIdIn70PercentRuleBoxOfGroup11],
        ).criteria,
      });
      await renderLoaded();
      await click('Select group 11');

      await clickAndSettle('Delete the 80% rule box in group 10', reads);

      expect(screen.getByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 10, selectionMoved: true })))
        .toBeInTheDocument();
    });

    it('selects the other section\'s group when the last box takes its whole section away', async () => {
      // Start: course A's group 10 holds a 70% box (901) and course B's group 20 holds a 70% box (902).
      //   Group 20 is selected.
      // Remove: group 20's only box, so group 20 and course B's section go too.
      // After: group 10 and its 70% box are selected.
      const criterionIdInGroup20 = 902;
      mockDeletes(criterionIdInGroup20);
      axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      const reads = mockGroupsReads(twoCoursesWithCriteriaResponse, {
        groups: twoCoursesWithCriteriaResponse.groups.filter((group) => group.id !== 2 && group.id !== 20),
        criteria: twoCoursesWithCriteriaResponse.criteria.filter((item) => item.groupId === 10),
      });
      await renderLoaded();
      await waitFor(() => expect(accessibleCourses()).toHaveTextContent(courseB));
      await click('Select group 20');

      await clickAndSettle('Delete the 70% rule box in group 20', reads);

      expect(screen.getByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 10, selectionMoved: true })))
        .toBeInTheDocument();
    });

    it.each([
      { selected: 'its group', setUp: async () => {} },
      { selected: 'nothing', setUp: clearSelectionByAddingAndDiscardingPlaceholderRuleBox },
    ])('requests the empty state when the last box on the page goes and $selected was selected', async (
      { setUp },
    ) => {
      // Start: group 10 is the only group, and holds one 70% box (criterion 900). Per case, group 10 is selected
      //   or nothing is.
      // Remove: that box, so group 10 and the page's last group go too.
      // After: nothing is selected, and the empty state takes keyboard focus.
      const criterionIdInOnlyRuleBox = 900;
      mockDeletes(criterionIdInOnlyRuleBox);
      const reads = mockGroupsReads(singleGroupResponse, noGroupsResponse);
      renderProvider();
      expect(await screen.findByText(selectionOnGroup(10))).toBeInTheDocument();
      await setUp();

      await clickAndSettle('Delete the 70% rule box in group 10', reads);

      expect(noSelection()).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'empty' }))).toBeInTheDocument();
    });

    it('moves a selected placeholder rule box out of the group that vanished', async () => {
      // Start: group 10 holds a 70% box (901) and group 11 holds a 70% box (902). A placeholder rule box in group 10
      //   is selected.
      // Remove: group 10's only saved box, so group 10 goes too, and the placeholder with it.
      // After: group 11 and its 70% box are selected, and there is no placeholder.
      mockDeletes(criterionIdIn70PercentRuleBoxOfGroup10);
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, afterDeletingGroup10Response);
      await renderLoaded();
      await click('Add placeholder rule box in group 10');
      expect(screen.getByText('Has placeholder: true')).toBeInTheDocument();

      await clickAndSettle('Delete the 70% rule box in group 10', reads);

      expect(screen.getByText(selectionOn(11, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText('Has placeholder: false')).toBeInTheDocument();
    });

    it('moves a selected placeholder group out of the section that vanished', async () => {
      // Start: course A's group 10 holds a 70% box (901) and course B's group 20 holds a 70% box (902). A
      //   placeholder group under course A is selected.
      // Remove: group 10's only box, so group 10 and course A's section go too, and the placeholder with them.
      // After: group 20 and its 70% box are selected, and there is no placeholder.
      mockDeletes(criterionIdIn70PercentRuleBoxOfGroup10);
      axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      const reads = mockGroupsReads(twoCoursesWithCriteriaResponse, {
        groups: twoCoursesWithCriteriaResponse.groups.filter((group) => group.id !== 1 && group.id !== 10),
        criteria: twoCoursesWithCriteriaResponse.criteria.filter((item) => item.groupId === 20),
      });
      await renderLoaded();
      await waitFor(() => expect(accessibleCourses()).toHaveTextContent(courseB));
      await click('Add placeholder group under course A');
      expect(screen.getByText('Has placeholder: true')).toBeInTheDocument();

      await clickAndSettle('Delete the 70% rule box in group 10', reads);

      expect(screen.getByText(selectionOn(20, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText('Has placeholder: false')).toBeInTheDocument();
    });

    it('stops at a failure partway, keeps the dialog open as partly removed, and keeps the selection', async () => {
      // Start: group 10 holds a 70% box (901, 905, 906) and an 80% box (903), and the 70% box is selected.
      // Remove: the 70% box, but 905 answers 500, so 906 is never sent.
      // After: 901 is gone. 905, 906 and the 80% box (903) are left, and the 70% box is still selected.
      const [firstCriterion, failingCriterion, thirdCriterion] = criterionIdsIn70PercentRuleBox;
      mockDeletes(firstCriterion);
      axiosMock.onDelete(deleteUrlOf(failingCriterion)).reply(500);
      const reads = mockGroupsReads(
        threeCriteriaInOneRuleBoxResponse,
        responseWithoutCriteria(threeCriteriaInOneRuleBoxResponse, [firstCriterion]),
      );
      await renderLoaded();
      await click('Select rule box 10 gte');

      await clickAndSettle('Delete the 70% rule box in group 10', reads);

      expect(sentDeleteUrls()).toEqual([deleteUrlOf(firstCriterion), deleteUrlOf(failingCriterion)]);
      expect(await screen.findByText(pendingRemoval('{"kind":"ruleBox","failure":"partly-removed"}')))
        .toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(screen.getByText(criterionIdsShown([failingCriterion, thirdCriterion, ...criterionIdsIn80PercentRuleBox])))
        .toBeInTheDocument();
      expect(screen.getByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest(null))).toBeInTheDocument();
    });

    it('keeps the dialog open as nothing removed when the first request fails', async () => {
      // Start: group 10 holds a 70% box (901, 905, 906) and an 80% box (903).
      // Remove: the 70% box, but 901 answers 500, so nothing is removed and no other delete is sent.
      // After: all four criteria are still there.
      const [failingFirstCriterion] = criterionIdsIn70PercentRuleBox;
      const allCriterionIds = [...criterionIdsIn70PercentRuleBox, ...criterionIdsIn80PercentRuleBox];
      axiosMock.onDelete(deleteUrlOf(failingFirstCriterion)).reply(500);
      const reads = mockGroupsReads(threeCriteriaInOneRuleBoxResponse, threeCriteriaInOneRuleBoxResponse);
      await renderLoaded();

      await clickAndSettle('Delete the 70% rule box in group 10', reads);

      expect(sentDeleteUrls()).toEqual([deleteUrlOf(failingFirstCriterion)]);
      expect(await screen.findByText(pendingRemoval('{"kind":"ruleBox","failure":"nothing-removed"}')))
        .toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(screen.getByText(criterionIdsShown(allCriterionIds))).toBeInTheDocument();
    });

    it('keeps the dialog open as partly removed when the refetch after a partial failure fails too', async () => {
      // Start: group 10 holds a 70% box (901, 905, 906) and an 80% box (903).
      // Remove: the 70% box, but 905 answers 500, and then the refetch answers 500 too.
      // After: the panel still shows the criteria from before the delete, with the refresh-error alert above them, and
      // the dialog reports a partial failure from the error's count of removed criteria, not from that stale data.
      const [firstCriterion, failingCriterion] = criterionIdsIn70PercentRuleBox;
      const allCriterionIds = [...criterionIdsIn70PercentRuleBox, ...criterionIdsIn80PercentRuleBox];
      mockDeletes(firstCriterion);
      axiosMock.onDelete(deleteUrlOf(failingCriterion)).reply(500);
      axiosMock.onGet(groupsUrl).replyOnce(200, threeCriteriaInOneRuleBoxResponse);
      axiosMock.onGet(groupsUrl).reply(500);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      await renderLoaded();

      await requestAndConfirm('Delete the 70% rule box in group 10');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();

      expect(sentDeleteUrls()).toEqual([deleteUrlOf(firstCriterion), deleteUrlOf(failingCriterion)]);
      expect(await screen.findByText(pendingRemoval('{"kind":"ruleBox","failure":"partly-removed"}')))
        .toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(screen.getByText(criterionIdsShown(allCriterionIds))).toBeInTheDocument();
      expect(screen.getByText('Groups refresh error: true')).toBeInTheDocument();
    });

    it('counts a 404 in the middle as removed: every criterion is tried, no toast, the box is gone', async () => {
      // Start: group 10 holds a 70% box (901, 905, 906) and an 80% box (903), and the 70% box is selected.
      // Remove: the 70% box. 905 answers 404, which counts as removed, so 906 is still sent.
      // After: only the 80% box (903) is left, and it is selected, because the removed box had no box above.
      const [firstCriterion, missingCriterion, thirdCriterion] = criterionIdsIn70PercentRuleBox;
      mockDeletes(firstCriterion, thirdCriterion);
      axiosMock.onDelete(deleteUrlOf(missingCriterion)).reply(404);
      const reads = mockGroupsReads(
        threeCriteriaInOneRuleBoxResponse,
        responseWithoutCriteria(threeCriteriaInOneRuleBoxResponse, criterionIdsIn70PercentRuleBox),
      );
      await renderLoaded();
      await click('Select rule box 10 gte');

      await clickAndSettle('Delete the 70% rule box in group 10', reads);

      expect(sentDeleteUrls()).toEqual(criterionIdsIn70PercentRuleBox.map(deleteUrlOf));
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(screen.getByText(criterionIdsShown(criterionIdsIn80PercentRuleBox))).toBeInTheDocument();
      expect(screen.getByText(selectionOn(10, gte80PercentRuleKey))).toBeInTheDocument();
    });

    it('drops a group delete made in the same tick as a rule box delete, so only the rule box is deleted', async () => {
      // Start: group 10 holds a 70% box (901), an 80% box (903) and a 90% box (904), and group 11 a 70% box (902).
      // Remove: group 10's 70% box, and ask to remove group 11 and confirm it in the same click.
      // After: only the 70% box's criterion (901) was sent for deletion, and group 11 was not deleted.
      mockDeletes(criterionIdIn70PercentRuleBoxOfGroup10);
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 11)).reply(200, {});
      const reads = mockGroupsReads(
        threeRuleBoxesInGroup10Response,
        responseWithoutCriteria(threeRuleBoxesInGroup10Response, [criterionIdIn70PercentRuleBoxOfGroup10]),
      );
      await renderLoaded();
      await click('Delete the 70% rule box in group 10');

      await click('Confirm removal, then request removing group 11 and confirm it, in one tick');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      await act(async () => {
        reads.release();
      });
      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();

      expect(sentDeleteUrls()).toEqual([deleteUrlOf(criterionIdIn70PercentRuleBoxOfGroup10)]);
      expect(groupsReads()).toHaveLength(2);
    });

    it('drops a second call made while the first is still deleting, so one run is sent', async () => {
      // Start: group 10 holds a 70% box (901, 905, 906) and an 80% box (903).
      // Remove: the 70% box, then ask to remove it again while the first run is still deleting.
      // After: one run of three deletes was sent, and no toast was shown.
      mockDeletes(...criterionIdsIn70PercentRuleBox);
      const reads = mockGroupsReads(
        threeCriteriaInOneRuleBoxResponse,
        responseWithoutCriteria(threeCriteriaInOneRuleBoxResponse, criterionIdsIn70PercentRuleBox),
      );
      await renderLoaded();
      await requestAndConfirm('Delete the 70% rule box in group 10');
      expect(await screen.findByText('Deleting: true')).toBeInTheDocument();

      await requestAndConfirm('Delete the 70% rule box in group 10');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      await act(async () => {
        reads.release();
      });

      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
      expect(sentDeleteUrls()).toEqual(criterionIdsIn70PercentRuleBox.map(deleteUrlOf));
      expect(mockShowToast).not.toHaveBeenCalled();
    });
  });

  describe('removing an association', () => {
    const deleteUrl = apiUrls.deleteCompetencyCriterion(tagId, 901);
    const groupsReads = () => axiosMock.history.get.filter((request) => request.url === groupsUrl);
    const keyboardRequest = (request: object | null) => `Keyboard request: ${JSON.stringify(request)}`;

    /** Serves `initial` once, then `refetched` (held until `release` is called) for every later GET. */
    const mockGroupsReads = (initial: object, refetched: object) => {
      const control = { release: () => {} };
      axiosMock.onGet(groupsUrl).replyOnce(200, initial);
      axiosMock.onGet(groupsUrl).reply(() => (
        new Promise((resolve) => {
          control.release = () => resolve([200, refetched]);
        })
      ));
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      return control;
    };

    const clickAndSettle = async (name: string, reads: { release: () => void; }) => {
      await requestAndConfirm(name);
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      await act(async () => {
        reads.release();
      });
      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
    };

    it('keeps the group and its other criteria, and asks the group box to take focus without expanding', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, { id: 901 });
      const reads = mockGroupsReads(twoCriteriaInGroupResponse, afterRemovingSubAResponse);
      renderProvider();
      await waitForSuccess();
      await click('Select group 10');

      await requestAndConfirm('Remove sub-a chip');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      // The delete itself has resolved, but the refetch has not.
      expect(screen.getByText('Deleting: true')).toBeInTheDocument();
      expect(screen.getByText(pendingRemoval('{"kind":"association","failure":null}'))).toBeInTheDocument();
      await act(async () => {
        reads.release();
      });

      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 10, selectionMoved: false })))
        .toBeInTheDocument();
      expect(screen.getByText('Criterion ids: [903]')).toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('moves selection off a vanished rule box to the box that remains', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, { id: 901 });
      const reads = mockGroupsReads(twoCriteriaInGroupResponse, afterRemovingSubAResponse);
      renderProvider();
      await waitForSuccess();
      await click('Select rule box 10 gte');
      expect(screen.getByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();

      await clickAndSettle('Remove sub-a chip', reads);

      expect(await screen.findByText(selectionOn(10, 'grade:gte:0.8:percent'))).toBeInTheDocument();
    });

    it('selects the neighbor group when the removal cascades the group away', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, { id: 901 });
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, afterDeletingGroup10Response);
      renderProvider();
      await waitForSuccess();
      await click('Select group 10');

      await clickAndSettle('Remove sub-a chip', reads);

      expect(screen.getByText(selectionOn(11, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 11, selectionMoved: true })))
        .toBeInTheDocument();
    });

    it('requests the empty state when the removal cascades away the last group', async () => {
      axiosMock.onDelete(apiUrls.deleteCompetencyCriterion(tagId, 900)).reply(200, { id: 900 });
      const reads = mockGroupsReads(singleGroupResponse, noGroupsResponse);
      renderProvider();
      await waitForSuccess();
      await click('Select group 10');

      await clickAndSettle('Remove existing-sub chip', reads);

      expect(screen.getByText(keyboardRequest({ kind: 'empty' }))).toBeInTheDocument();
    });

    it('treats a 404 as success when the refetch no longer has the criterion: no failure', async () => {
      axiosMock.onDelete(deleteUrl).reply(404);
      const reads = mockGroupsReads(twoCriteriaInGroupResponse, afterRemovingSubAResponse);
      renderProvider();
      await waitForSuccess();
      await click('Select group 10');
      expect(screen.getByText('Criterion ids: [901,903]')).toBeInTheDocument();

      await clickAndSettle('Remove sub-a chip', reads);

      expect(mockShowToast).not.toHaveBeenCalled();
      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(screen.getByText('Criterion ids: [903]')).toBeInTheDocument();
      expect(screen.getByText(keyboardRequest({ kind: 'group', groupId: 10, selectionMoved: false })))
        .toBeInTheDocument();
    });

    it('treats a 404 as success even when the refetch still has the criterion: no failure', async () => {
      axiosMock.onDelete(deleteUrl).reply(404);
      const reads = mockGroupsReads(twoCriteriaInGroupResponse, twoCriteriaInGroupResponse);
      renderProvider();
      await waitForSuccess();

      await clickAndSettle('Remove sub-a chip', reads);

      expect(mockShowToast).not.toHaveBeenCalled();
      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(screen.getByText('Criterion ids: [901,903]')).toBeInTheDocument();
    });

    it.each(['Remove sub-a chip', 'Remove sub-a from browse'])(
      'keeps the dialog open on a failure from "%s" and requests no keyboard focus, since the association is still there',
      async (requestName) => {
        axiosMock.onDelete(deleteUrl).reply(500);
        const reads = mockGroupsReads(twoCriteriaInGroupResponse, twoCriteriaInGroupResponse);
        renderProvider();
        await waitForSuccess();
        await click('Select group 10');

        await clickAndSettle(requestName, reads);

        expect(await screen.findByText(pendingRemoval('{"kind":"association","failure":"nothing-removed"}')))
          .toBeInTheDocument();
        expect(mockShowToast).not.toHaveBeenCalled();
        expect(screen.getByText('Criterion ids: [901,903]')).toBeInTheDocument();
        expect(screen.getByText(keyboardRequest(null))).toBeInTheDocument();
      },
    );

    it('deletes the criterion with the given id when another group holds one for the same subsection', async () => {
      // This page cannot create that data, but the backend allows it for a different explicit group, so the delete
      // must be keyed by criterion id and not by subsection.
      const urlOf902 = apiUrls.deleteCompetencyCriterion(tagId, 902);
      axiosMock.onDelete(urlOf902).reply(200, { id: 902 });
      const sameSubsectionInTwoGroups = {
        ...twoGroupsResponse,
        criteria: [criterion(901, 'sub-a', 10), criterion(902, 'sub-a', 11)],
      };
      const reads = mockGroupsReads(sameSubsectionInTwoGroups, {
        ...sameSubsectionInTwoGroups,
        criteria: sameSubsectionInTwoGroups.criteria.slice(0, 1),
      });
      renderProvider();
      await waitForSuccess();

      await clickAndSettle('Remove criterion 902', reads);

      expect(axiosMock.history.delete).toHaveLength(1);
      expect(axiosMock.history.delete[0].url).toEqual(urlOf902);
      expect(screen.getByText('Criterion ids: [901]')).toBeInTheDocument();
    });

    it('drops a group delete started while a removal is pending', async () => {
      const deleteGate = deferred();
      axiosMock.onDelete(deleteUrl).reply(() => deleteGate.released.then(() => [200, { id: 901 }]));
      mockGroupsReads(twoCriteriaInGroupResponse, afterRemovingSubAResponse);
      renderProvider();
      await waitForSuccess();
      await requestAndConfirm('Remove sub-a chip');
      await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));

      await requestAndConfirm('Delete group 10');

      expect(axiosMock.history.delete).toHaveLength(1);
    });

    describe('when the cached groups change while a removal is pending', () => {
      /** Serves the groups with `sub-a` until the DELETE has been answered, and without it afterwards. */
      const mockGroupsReadsAroundDelete = (deleteGate: ReturnType<typeof deferred>, deleteStatus = 200) => {
        let isRemoved = false;
        axiosMock.onDelete(deleteUrl).reply(() => (
          deleteGate.released.then(() => {
            isRemoved = deleteStatus === 200;
            return [deleteStatus, { id: 901 }];
          })
        ));
        axiosMock.onGet(groupsUrl).reply(
          () => [200, isRemoved ? afterRemovingSubAResponse : twoCriteriaInGroupResponse],
        );
        axiosMock.onGet(otherGroupsUrl).reply(200, otherSingleGroupResponse);
        axiosMock.onGet(profileUrl).reply(200, profileResponse);
        axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
        axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      };

      it('shows no toast when the author searches the course list during the removal', async () => {
        const deleteGate = deferred();
        mockGroupsReadsAroundDelete(deleteGate);
        renderProvider();
        await waitForSuccess();
        await requestAndConfirm('Remove sub-a chip');
        await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));

        await click('Search for course B');
        await screen.findByText(`Listed course keys: ${JSON.stringify([courseB])}`);
        await act(async () => {
          deleteGate.release();
        });

        expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
        expect(await screen.findByText('Criterion ids: [903]')).toBeInTheDocument();
        expect(mockShowToast).not.toHaveBeenCalled();
      });

      it('shows no toast, and requests no focus, when the author switches competency during the removal', async () => {
        const deleteGate = deferred();
        mockGroupsReadsAroundDelete(deleteGate);
        const { rerender } = renderProvider();
        await waitForSuccess();
        await requestAndConfirm('Remove sub-a from browse');
        await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));

        rerender(providerFor(otherTagId));
        await screen.findByText(selectionOnGroup(30));
        expect(screen.getByText('Deleting: false')).toBeInTheDocument();
        await act(async () => {
          deleteGate.release();
        });
        await flushEffects();

        expect(screen.getByText(keyboardRequest(null))).toBeInTheDocument();
        expect(mockShowToast).not.toHaveBeenCalled();
        rerender(providerFor(tagId));
        expect(await screen.findByText('Criterion ids: [903]')).toBeInTheDocument();
      });

      it('leaves a dialog opened in the new competency open when the earlier removal finishes', async () => {
        const deleteGate = deferred();
        mockGroupsReadsAroundDelete(deleteGate);
        const { rerender } = renderProvider();
        await waitForSuccess();
        await requestAndConfirm('Remove sub-a chip');
        await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
        await click('Cancel removal');
        rerender(providerFor(otherTagId));
        await screen.findByText(selectionOnGroup(30));
        await click('Delete group 30');
        expect(screen.getByText(pendingRemoval('{"kind":"ruleGroup","failure":null}'))).toBeInTheDocument();

        await act(async () => {
          deleteGate.release();
        });
        await flushEffects(50);

        expect(screen.getByText(pendingRemoval('{"kind":"ruleGroup","failure":null}'))).toBeInTheDocument();
        expect(axiosMock.history.delete).toHaveLength(1);
        expect(mockShowToast).not.toHaveBeenCalled();
      });

      it('shows no toast when the refetch after the removal fails', async () => {
        axiosMock.onDelete(deleteUrl).reply(200, { id: 901 });
        axiosMock.onGet(groupsUrl).replyOnce(200, twoCriteriaInGroupResponse).onGet(groupsUrl).reply(500);
        axiosMock.onGet(profileUrl).reply(200, profileResponse);
        axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
        renderProvider();
        await waitForSuccess();

        await requestAndConfirm('Remove sub-a chip');

        await waitFor(() => expect(groupsReads()).toHaveLength(2));
        expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
        expect(screen.getByText('Status: success')).toBeInTheDocument();
        expect(screen.getByText('Groups refresh error: true')).toBeInTheDocument();
        expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
        expect(mockShowToast).not.toHaveBeenCalled();
      });
    });

    it('requests keyboard focus for the subsection row when the removal came from the content panel', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, { id: 901 });
      const reads = mockGroupsReads(twoCriteriaInGroupResponse, afterRemovingSubAResponse);
      renderProvider();
      await waitForSuccess();
      await click('Select group 10');

      await clickAndSettle('Remove sub-a from browse', reads);

      expect(screen.getByText(keyboardRequest({ kind: 'subsection', objectId: 'sub-a' }))).toBeInTheDocument();
    });

    it('blocks a group removal request while a removal is in flight', async () => {
      axiosMock.onDelete(deleteUrl).reply(200, { id: 901 });
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, afterDeletingGroup10Response);
      renderProvider();
      await waitForSuccess();

      await requestAndConfirm('Remove sub-a chip');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      await click('Request remove group 11');
      expect(screen.getByText(pendingRemoval('{"kind":"association","failure":null}'))).toBeInTheDocument();
      await act(async () => {
        reads.release();
      });
      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();

      expect(axiosMock.history.delete).toHaveLength(1);
      expect(axiosMock.history.delete[0].url).toEqual(deleteUrl);
    });
  });

  describe('a delete that settles after the competency changed', () => {
    it.each([
      { deleteAction: 'Delete group 10' },
      { deleteAction: 'Remove sub-a chip' },
      { deleteAction: 'Delete the 70% rule box in group 10' },
    ])('leaves the new competency\'s selection and keyboard focus alone ($deleteAction)', async ({ deleteAction }) => {
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 10)).reply(200, {});
      axiosMock.onDelete(apiUrls.deleteCompetencyCriterion(tagId, 901)).reply(200, { id: 901, archived: false });
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      const reads = mockHeldGroupsRefetch(
        axiosMock,
        tagId,
        twoGroupsWithCriteriaResponse,
        afterDeletingGroup10Response,
      );
      axiosMock.onGet(otherGroupsUrl).reply(200, courseBGroupsResponse);
      const { rerender } = renderProvider();
      await waitForSuccess();
      await requestAndConfirm(deleteAction);
      await waitFor(() => expect(axiosMock.history.get.filter((request) => request.url === groupsUrl)).toHaveLength(2));

      rerender(providerFor(otherTagId));
      await waitForSuccess();
      await click('Select group 20');
      expect(screen.getByText(selectionOnGroup(20))).toBeInTheDocument();
      await act(async () => {
        reads.release();
      });

      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
      expect(screen.getByText(selectionOnGroup(20))).toBeInTheDocument();
      expect(screen.getByText('Keyboard request: null')).toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it.each([
      {
        name: 'a rule box',
        requestName: 'Delete the 70% rule box in group 10',
        mockDelete: () => axiosMock.onDelete(apiUrls.deleteCompetencyCriterion(tagId, 901)).reply(500),
      },
      {
        name: 'a criterion',
        requestName: 'Remove sub-a chip',
        mockDelete: () => axiosMock.onDelete(apiUrls.deleteCompetencyCriterion(tagId, 901)).reply(500),
      },
      {
        name: 'a group',
        requestName: 'Delete group 10',
        mockDelete: () => axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 10)).reply(500),
      },
    ])('shows no failure toast for $name delete that fails after the switch', async ({ requestName, mockDelete }) => {
      mockDelete();
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      const reads = mockHeldGroupsRefetch(
        axiosMock,
        tagId,
        twoGroupsWithCriteriaResponse,
        twoGroupsWithCriteriaResponse,
      );
      axiosMock.onGet(otherGroupsUrl).reply(200, courseBGroupsResponse);
      const { rerender } = renderProvider();
      await waitForSuccess();
      await requestAndConfirm(requestName);
      await waitFor(() => expect(axiosMock.history.get.filter((request) => request.url === groupsUrl)).toHaveLength(2));
      expect(axiosMock.history.delete).toHaveLength(1);

      rerender(providerFor(otherTagId));
      await waitForSuccess();
      await act(async () => {
        reads.release();
      });
      await flushEffects();

      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
    });
  });

  describe('requestRemoval, confirmRemoval, cancelRemoval', () => {
    const deleteUrlOf = (criterionId: number) => apiUrls.deleteCompetencyCriterion(tagId, criterionId);
    const sentDeleteUrls = () => axiosMock.history.delete.map((request) => request.url);
    const groupsReads = () => axiosMock.history.get.filter((request) => request.url === groupsUrl);
    const mockDeletes = (...criterionIds: number[]) => {
      criterionIds.forEach((id) => {
        axiosMock.onDelete(deleteUrlOf(id)).reply(200, { id, archived: false });
      });
    };
    const sentWrites = () => (
      axiosMock.history.delete.length + axiosMock.history.patch.length + axiosMock.history.post.length
    );
    const summary = () =>
      JSON.parse(
        screen.getByText(/^Pending summary: /).textContent?.replace(/^Pending summary: /, '') ?? 'null',
      );
    const namedOutline = buildOutlineIndex({
      sections: [{
        id: 'section-1',
        displayName: 'Section 1',
        children: [
          { id: 'sub-901', displayName: 'Quiz 901' },
          { id: 'sub-905', displayName: 'Quiz 905' },
          { id: 'sub-906', displayName: 'Quiz 906' },
          { id: 'sub-903', displayName: 'Quiz 903' },
        ],
      }],
    });

    /** `mockHeldGroupsRefetch`, plus the profile and course A outline reads. */
    const mockGroupsReads = (initial: object, refetched: object) => {
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      return mockHeldGroupsRefetch(axiosMock, tagId, initial, refetched);
    };

    const renderLoaded = async () => {
      renderProvider();
      await waitForSuccess();
      await waitFor(() => expect(accessibleCourses()).toHaveTextContent(courseA));
    };

    it('opens the confirmation with the names read from the course outline, and sends nothing', async () => {
      mockGroupsReads(threeCriteriaInOneRuleBoxResponse, threeCriteriaInOneRuleBoxResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, namedOutline);
      await renderLoaded();

      await click('Delete the 70% rule box in group 10');

      expect(screen.getByText(pendingRemoval('{"kind":"ruleBox","failure":null}'))).toBeInTheDocument();
      expect(summary()).toEqual({
        kind: RemovalTargetKind.RuleBox,
        contentNames: ['Quiz 901', 'Quiz 905', 'Quiz 906'],
        otherRuleCount: 1,
        leavesCourseWithoutAssociations: false,
      });
      expect(sentWrites()).toBe(0);
    });

    it('describes a whole course group by its association count and course name', async () => {
      mockGroupsReads(threeCriteriaInOneRuleBoxResponse, threeCriteriaInOneRuleBoxResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, namedOutline);
      await renderLoaded();

      await click('Request remove course group 1');

      expect(summary()).toEqual({
        kind: RemovalTargetKind.CourseGroup,
        associationCount: 4,
        courseName: 'Test Course',
      });
      expect(sentWrites()).toBe(0);
    });

    it('removes a course group, with its refetch, once confirmed', async () => {
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 1)).reply(200, {});
      const reads = mockGroupsReads(threeCriteriaInOneRuleBoxResponse, noGroupsResponse);
      await renderLoaded();

      await requestAndConfirm('Request remove course group 1');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));
      await act(async () => {
        reads.release();
      });

      expect(await screen.findByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(sentDeleteUrls()).toEqual([apiUrls.competencyCriteriaGroup(tagId, 1)]);
    });

    it('closes the confirmation on cancel without sending anything', async () => {
      mockGroupsReads(threeCriteriaInOneRuleBoxResponse, threeCriteriaInOneRuleBoxResponse);
      await renderLoaded();
      await click('Remove sub-a chip');
      expect(screen.getByText(/^Pending removal: .*"kind":"association"/)).toBeInTheDocument();

      await click('Cancel removal');

      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(sentWrites()).toBe(0);
    });

    it('sends nothing when confirmed with no removal pending', async () => {
      mockGroupsReads(threeCriteriaInOneRuleBoxResponse, threeCriteriaInOneRuleBoxResponse);
      await renderLoaded();

      await click('Confirm removal');

      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(sentWrites()).toBe(0);
    });

    it('stays closed, and toasts the failure, when the author cancels while the request runs and then it fails', async () => {
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 10)).reply(500);
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, twoGroupsWithCriteriaResponse);
      await renderLoaded();
      await requestAndConfirm('Delete group 10');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));

      await click('Cancel removal');
      await act(async () => {
        reads.release();
      });

      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      await waitFor(() => {
        expectToast('There was a problem with the removal you confirmed. Please try again.', ErrorIcon);
      });
    });

    /** One removal of each kind: the control that requests it, the groups before and after it, and its deletes. */
    const removalKinds = [
      {
        name: 'a rule group',
        requestName: 'Delete group 10',
        kind: RemovalTargetKind.RuleGroup,
        initial: twoGroupsWithCriteriaResponse,
        refetched: afterDeletingGroup10Response,
        mock: () => axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 10)).reply(200, {}),
        urls: [apiUrls.competencyCriteriaGroup(tagId, 10)],
      },
      {
        name: 'an association',
        requestName: 'Remove sub-a chip',
        kind: RemovalTargetKind.Association,
        initial: twoCriteriaInGroupResponse,
        refetched: afterRemovingSubAResponse,
        mock: () => mockDeletes(901),
        urls: [deleteUrlOf(901)],
      },
      {
        name: 'a rule box',
        requestName: 'Delete the 70% rule box in group 10',
        kind: RemovalTargetKind.RuleBox,
        initial: threeCriteriaInOneRuleBoxResponse,
        refetched: responseWithoutCriteria(threeCriteriaInOneRuleBoxResponse, [901, 905, 906]),
        mock: () => mockDeletes(901, 905, 906),
        urls: [deleteUrlOf(901), deleteUrlOf(905), deleteUrlOf(906)],
      },
    ];

    it.each(removalKinds)(
      'sends one request for $name confirmed again while deleting, and keeps the dialog open and the page blocked until the refetch lands',
      async ({ requestName, kind, initial, refetched, mock, urls }) => {
        mock();
        const reads = mockGroupsReads(initial, refetched);
        await renderLoaded();

        await requestAndConfirm(requestName);
        expect(await screen.findByText('Deleting: true')).toBeInTheDocument();
        await click('Confirm removal');
        await waitFor(() => expect(groupsReads()).toHaveLength(2));
        await click('Request remove group 11');

        expect(screen.getByText('Deleting: true')).toBeInTheDocument();
        expect(screen.getByText(pendingRemoval(`{"kind":"${kind}","failure":null}`))).toBeInTheDocument();
        await act(async () => {
          reads.release();
        });

        expect(await screen.findByText(pendingRemoval('closed'))).toBeInTheDocument();
        expect(sentDeleteUrls()).toEqual(urls);
      },
    );

    it.each(removalKinds)(
      'sends one request for $name confirmed twice in one tick, and keeps the dialog open until the refetch lands',
      async ({ requestName, kind, initial, refetched, mock, urls }) => {
        mock();
        const reads = mockGroupsReads(initial, refetched);
        await renderLoaded();
        await click(requestName);

        await click('Confirm removal twice in one tick');
        await waitFor(() => expect(groupsReads()).toHaveLength(2));

        // The dropped second call must not close the dialog as if its own delete had succeeded.
        expect(screen.getByText(pendingRemoval(`{"kind":"${kind}","failure":null}`))).toBeInTheDocument();
        await act(async () => {
          reads.release();
        });
        expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
        expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
        expect(sentDeleteUrls()).toEqual(urls);
        expect(groupsReads()).toHaveLength(2);
      },
    );

    it.each(removalKinds)(
      'opens no dialog for $name requested while an association is being created, so no delete is sent',
      async ({ requestName, initial, refetched, mock }) => {
        mock();
        axiosMock.onPost(createUrl).reply(() => new Promise(() => {}));
        mockGroupsReads(initial, refetched);
        await renderLoaded();
        await click('Associate in course A');
        await screen.findByText('Associating: true');

        await requestAndConfirm(requestName);

        expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
        expect(sentDeleteUrls()).toEqual([]);
        expect(mockShowToast).not.toHaveBeenCalled();
      },
    );

    it.each(removalKinds)(
      'drops a confirm for $name made while an association is being created, and keeps the dialog open',
      async ({ requestName, kind, initial, refetched, mock }) => {
        mock();
        axiosMock.onPost(createUrl).reply(() => new Promise(() => {}));
        mockGroupsReads(initial, refetched);
        await renderLoaded();
        await click(requestName);
        await click('Associate in course A');
        await screen.findByText('Associating: true');

        await click('Confirm removal');

        expect(sentDeleteUrls()).toEqual([]);
        expect(screen.getByText(pendingRemoval(`{"kind":"${kind}","failure":null}`))).toBeInTheDocument();
        expect(mockShowToast).not.toHaveBeenCalled();
      },
    );

    it('closes the dialog, as a success, when a group DELETE answers 404 while the refetch still lists the group', async () => {
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 10)).reply(404);
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, twoGroupsWithCriteriaResponse);
      await renderLoaded();
      await requestAndConfirm('Delete group 10');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));

      await act(async () => {
        reads.release();
      });

      expect(await screen.findByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('clears the dialog\'s failure while a retry runs', async () => {
      const retryGate = deferred();
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 10)).replyOnce(500);
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 10))
        .reply(() => retryGate.released.then(() => [200, {}]));
      axiosMock.onGet(groupsUrl).reply(200, twoGroupsWithCriteriaResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      await renderLoaded();
      await requestAndConfirm('Delete group 10');
      expect(await screen.findByText(pendingRemoval('{"kind":"ruleGroup","failure":"nothing-removed"}')))
        .toBeInTheDocument();
      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();

      await click('Confirm removal');

      expect(await screen.findByText('Deleting: true')).toBeInTheDocument();
      expect(screen.getByText(pendingRemoval('{"kind":"ruleGroup","failure":null}'))).toBeInTheDocument();
      await act(async () => {
        retryGate.release();
      });
      expect(await screen.findByText(pendingRemoval('closed'))).toBeInTheDocument();
    });

    it('closes the dialog when a group DELETE fails but the refetch no longer has the group', async () => {
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 10)).reply(500);
      const reads = mockGroupsReads(twoGroupsWithCriteriaResponse, afterDeletingGroup10Response);
      await renderLoaded();
      await requestAndConfirm('Delete group 10');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));

      await act(async () => {
        reads.release();
      });

      expect(await screen.findByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('closes the dialog when a rule box DELETE fails but the refetch has none of its criteria left', async () => {
      mockDeletes(901, 905);
      axiosMock.onDelete(deleteUrlOf(906)).reply(500);
      const reads = mockGroupsReads(
        threeCriteriaInOneRuleBoxResponse,
        responseWithoutCriteria(threeCriteriaInOneRuleBoxResponse, [901, 905, 906]),
      );
      await renderLoaded();
      await requestAndConfirm('Delete the 70% rule box in group 10');
      await waitFor(() => expect(groupsReads()).toHaveLength(2));

      await act(async () => {
        reads.release();
      });

      expect(await screen.findByText(pendingRemoval('closed'))).toBeInTheDocument();
    });

    it('closes an open dialog when the competency changes', async () => {
      mockGroupsReads(threeCriteriaInOneRuleBoxResponse, threeCriteriaInOneRuleBoxResponse);
      axiosMock.onGet(otherGroupsUrl).reply(200, noGroupsResponse);
      const { rerender } = renderProvider();
      await waitFor(() => expect(accessibleCourses()).toHaveTextContent(courseA));
      await click('Request remove course group 1');
      expect(screen.getByText(/^Pending removal: .*"kind":"courseGroup"/)).toBeInTheDocument();

      rerender(providerFor(otherTagId));

      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
    });

    it('closes an open dialog when the listed courses change, and a later confirm sends nothing', async () => {
      axiosMock.onGet(groupsUrl).reply(200, threeCriteriaInOneRuleBoxResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      mockDeletes(901);
      await renderLoaded();
      await click('Remove sub-a chip');
      expect(screen.getByText(pendingRemoval('{"kind":"association","failure":null}'))).toBeInTheDocument();

      await click('Search for course B');
      await screen.findByText(`Listed course keys: ${JSON.stringify([courseB])}`);

      expect(screen.getByText(pendingRemoval('closed'))).toBeInTheDocument();
      await click('Confirm removal');
      await flushEffects();
      expect(sentDeleteUrls()).toEqual([]);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('recomputes the last-association warning from the refetched data after a failure', async () => {
      mockDeletes(901);
      axiosMock.onDelete(deleteUrlOf(905)).reply(500);
      axiosMock.onGet(groupsUrl).replyOnce(200, threeCriteriaInOneRuleBoxResponse);
      // Another author removed the 80% box meanwhile, so what is left is all the course has.
      axiosMock.onGet(groupsUrl).reply(200, responseWithoutCriteria(threeCriteriaInOneRuleBoxResponse, [901, 903]));
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, namedOutline);
      await renderLoaded();

      await click('Delete the 70% rule box in group 10');
      expect(summary().leavesCourseWithoutAssociations).toBe(false);
      await click('Confirm removal');

      expect(await screen.findByText(pendingRemoval('{"kind":"ruleBox","failure":"partly-removed"}')))
        .toBeInTheDocument();
      expect(summary().leavesCourseWithoutAssociations).toBe(true);
    });

    it('keeps the last-association warning, and names only what is left, when the refetch after a partial failure fails too', async () => {
      // Start: group 10 holds a 70% box (901, 905, 906), which is all the course has.
      // Remove: the 70% box. 901 is deleted, 905 answers 500, and the refetch answers 500 too, so the cached groups
      //   still list 901.
      // After: the dialog still warns that the course is left without associations, names only 905 and 906, and a
      //   retry sends only those two.
      const onlyTheBoxResponse = responseWithoutCriteria(threeCriteriaInOneRuleBoxResponse, [903]);
      mockDeletes(901, 906);
      axiosMock.onDelete(deleteUrlOf(905)).replyOnce(500);
      axiosMock.onDelete(deleteUrlOf(905)).reply(200, { id: 905, archived: false });
      axiosMock.onGet(groupsUrl).replyOnce(200, onlyTheBoxResponse);
      axiosMock.onGet(groupsUrl).reply(500);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, namedOutline);
      await renderLoaded();

      await click('Delete the 70% rule box in group 10');
      expect(summary().leavesCourseWithoutAssociations).toBe(true);
      await click('Confirm removal');

      expect(await screen.findByText(pendingRemoval('{"kind":"ruleBox","failure":"partly-removed"}')))
        .toBeInTheDocument();
      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();
      expect(summary().leavesCourseWithoutAssociations).toBe(true);
      expect(summary().contentNames).toEqual(['Quiz 905', 'Quiz 906']);

      await click('Confirm removal');
      await waitFor(() => expect(sentDeleteUrls()).toHaveLength(4));
      expect(sentDeleteUrls()).toEqual([deleteUrlOf(901), deleteUrlOf(905), deleteUrlOf(905), deleteUrlOf(906)]);
    });

    it('lets a retry send only what is left after a partial failure', async () => {
      mockDeletes(901, 906);
      axiosMock.onDelete(deleteUrlOf(905)).replyOnce(500);
      axiosMock.onDelete(deleteUrlOf(905)).reply(200, { id: 905, archived: false });
      axiosMock.onGet(groupsUrl).replyOnce(200, threeCriteriaInOneRuleBoxResponse);
      axiosMock.onGet(groupsUrl).replyOnce(200, responseWithoutCriteria(threeCriteriaInOneRuleBoxResponse, [901]));
      axiosMock.onGet(groupsUrl)
        .reply(200, responseWithoutCriteria(threeCriteriaInOneRuleBoxResponse, [901, 905, 906]));
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, namedOutline);
      await renderLoaded();

      await requestAndConfirm('Delete the 70% rule box in group 10');
      expect(await screen.findByText(pendingRemoval('{"kind":"ruleBox","failure":"partly-removed"}')))
        .toBeInTheDocument();
      expect(summary().contentNames).toEqual(['Quiz 905', 'Quiz 906']);
      expect(screen.getByText('Deleting: false')).toBeInTheDocument();

      await click('Confirm removal');
      expect(await screen.findByText(pendingRemoval('closed'))).toBeInTheDocument();
      expect(await screen.findByText('Deleting: false')).toBeInTheDocument();

      expect(sentDeleteUrls()).toEqual([deleteUrlOf(901), deleteUrlOf(905), deleteUrlOf(905), deleteUrlOf(906)]);
      expect(screen.getByText('Criterion ids: [903]')).toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
    });
  });

  describe('discardPlaceholderGroup', () => {
    it('sends no request, and selects the last saved group of the placeholder\'s course with a keyboard request', async () => {
      axiosMock.onGet(groupsUrl).reply(200, twoGroupsWithCriteriaResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();
      await click('Add placeholder group under course A');
      expect(screen.getByText('Selection: group null, rule none')).toBeInTheDocument();

      await click('Discard placeholder group');

      expect(screen.getByText(selectionOn(11, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText('Has placeholder: false')).toBeInTheDocument();
      expect(screen.getByText('Deleting: false')).toBeInTheDocument();
      expect(screen.getByText('Associating: false')).toBeInTheDocument();
      expect(screen.getByText('Keyboard request: {"kind":"group","groupId":11,"selectionMoved":true}'))
        .toBeInTheDocument();
      expect(axiosMock.history.delete).toHaveLength(0);
      expect(axiosMock.history.patch).toHaveLength(0);
      expect(axiosMock.history.post).toHaveLength(0);
    });

    it('clears selection, with no keyboard request, when the placeholder\'s course group is gone', async () => {
      axiosMock.onGet(groupsUrl).reply(200, {
        groups: singleGroupResponse.groups.filter((item) => item.id !== 10 && item.id !== 1),
        criteria: [],
      });
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();
      await click('Add placeholder group under course A');

      await click('Discard placeholder group');

      expect(noSelection()).toBeInTheDocument();
      expect(screen.getByText('Keyboard request: null')).toBeInTheDocument();
    });
  });

  describe('discardPlaceholderRuleBox', () => {
    const renderLoaded = async (response: CompetencyCriteriaGroupsResponse) => {
      axiosMock.onGet(groupsUrl).reply(200, response);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();
    };

    const renderWithPlaceholderRuleBox = async (response: CompetencyCriteriaGroupsResponse) => {
      await renderLoaded(response);
      await click('Add placeholder rule box in group 10');
      expect(screen.getByText(selectionOn(10, null))).toBeInTheDocument();
      expect(screen.getByText('Has placeholder: true')).toBeInTheDocument();
    };

    it('sends no request, and selects the group\'s last saved box with a keyboard request', async () => {
      await renderWithPlaceholderRuleBox(twoCriteriaInGroupResponse);

      await click('Discard placeholder rule box');

      expect(screen.getByText(selectionOn(10, gte80PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText('Has placeholder: false')).toBeInTheDocument();
      expect(screen.getByText('Keyboard request: {"kind":"group","groupId":10,"selectionMoved":true}'))
        .toBeInTheDocument();
      expect(axiosMock.history.delete).toHaveLength(0);
      expect(axiosMock.history.patch).toHaveLength(0);
      expect(axiosMock.history.post).toHaveLength(0);
    });

    it('does not carry the discarded placeholder\'s chosen score into the next placeholder rule box', async () => {
      await renderWithPlaceholderRuleBox(twoCriteriaInGroupResponse);
      await click('Set placeholder score');
      expect(screen.getByText(/"rulePayload":\{"op":"gte","value":0.85/)).toBeInTheDocument();

      await click('Discard placeholder rule box');
      await click('Add placeholder rule box in group 10');

      expect(screen.getByText(
        'Placeholder: {"parentRuleGroupId":null,"logicOperator":"OR","rulePayload":null,"justAdded":true}',
      )).toBeInTheDocument();
    });

    it('clears a duplicate rejection along with the placeholder', async () => {
      await renderWithPlaceholderRuleBox(twoCriteriaInGroupResponse);
      // The untouched placeholder's default score duplicates the group's saved default box.
      await click('Associate in course A');
      expect(screen.getByText('Duplicate rejected: true')).toBeInTheDocument();

      await click('Discard placeholder rule box');

      expect(screen.getByText('Has placeholder: false')).toBeInTheDocument();
      expect(screen.getByText('Duplicate rejected: false')).toBeInTheDocument();
    });

    it('clears selection when the group has no saved box to return to', async () => {
      // The API cannot create a saved group with no criteria, so this data is only a way to cover the fallback.
      await renderWithPlaceholderRuleBox(twoGroupsResponse);

      await click('Discard placeholder rule box');

      expect(noSelection()).toBeInTheDocument();
      expect(screen.getByText('Has placeholder: false')).toBeInTheDocument();
    });

    it('does nothing when no placeholder rule box is selected', async () => {
      await renderLoaded(twoCriteriaInGroupResponse);
      await click('Select rule box 10 gte');

      await click('Discard placeholder rule box');

      expect(screen.getByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();
      expect(screen.getByText('Keyboard request: null')).toBeInTheDocument();
    });
  });

  describe('associateSubsection', () => {
    it('sends the selected group\'s id and rule when the selection is a group belonging to the clicked subsection\'s course', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(201, createdCriterion(10, gteRule));
      renderProvider();
      await waitForSuccess();

      await click('Select rule box 10 gte');
      await click('Associate in course A');

      await expectSinglePost({
        object_id: 'new-sub',
        group_id: 10,
        rule_type_override: 'grade',
        rule_payload_override: gteRule,
      });
    });

    it('omits group_id and rule fields when selection is unset and the course has no groups', async () => {
      axiosMock.onGet(groupsUrl).reply(200, noGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onPost(createUrl).reply(201, createdCriterion(20));
      renderProvider();
      await waitForSuccess();

      await click('Associate in course A');

      await expectSinglePost({ object_id: 'new-sub' });
    });

    describe('when selection is not on the clicked subsection\'s course, and the course has groups', () => {
      beforeEach(() => {
        axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
        axiosMock.onGet(profileUrl).reply(200, profileResponse);
        axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
        axiosMock.onGet(courseBOutlineUrl).reply(200, outlineFixture);
      });

      it('targets the course\'s last group and rule box when nothing is selected, and selects them', async () => {
        axiosMock.onPost(createUrl).reply(201, createdCriterion(21, eqRule));
        renderProvider();
        await waitForSuccess();
        noSelection();

        await click('Associate in course B');

        await expectSinglePost({
          object_id: 'new-sub',
          group_id: 21,
          rule_type_override: 'grade',
          rule_payload_override: eqRule,
        });
        expect(screen.getByText(selectionOn(21, eqKey))).toBeInTheDocument();
      });

      it('targets the course\'s last group when selection is on another course\'s group', async () => {
        axiosMock.onPost(createUrl).reply(201, createdCriterion(10));
        renderProvider();
        await waitForSuccess();
        await click('Select group 21');

        await click('Associate in course A');

        await expectSinglePost({ object_id: 'new-sub', group_id: 10 });
        expect(screen.getByText(selectionOn(10, null))).toBeInTheDocument();
      });

      it('targets the course\'s last group when the selected group no longer exists in the tree', async () => {
        axiosMock.onPost(createUrl).reply(201, createdCriterion(21, eqRule));
        renderProvider();
        await waitForSuccess();
        await click('Select rule box 999 gte');

        await click('Associate in course B');

        await expectSinglePost({
          object_id: 'new-sub',
          group_id: 21,
          rule_type_override: 'grade',
          rule_payload_override: eqRule,
        });
      });
    });

    it('omits group_id and rule fields when selection is a group belonging to a different course', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(201, createdCriterion(20));
      renderProvider();
      await waitForSuccess();

      await click('Select rule box 10 gte');
      await click('Associate in another course');

      await expectSinglePost({ object_id: 'new-sub' });
    });

    it('returns early with an informational toast, sending no request, for an already-associated subsection', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      renderProvider();
      await waitForSuccess();

      await click('Associate duplicate');

      expectToast('This content is already associated with this competency.', InfoOutline);
      await flushEffects();
      expect(axiosMock.history.post).toHaveLength(0);
    });

    it('selects the response\'s group and rule after a successful create, not a stale local read', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      // Group 999 is not in the local tree, so a lookup against it would yield no rule key.
      axiosMock.onPost(createUrl).reply(201, createdCriterion(999, eqRule));
      renderProvider();
      await waitForSuccess();

      await click('Associate in course A');

      expect(await screen.findByText(selectionOn(999, eqKey))).toBeInTheDocument();
    });

    it('flags a groups refresh error when the refetch after a successful create fails', async () => {
      axiosMock.onGet(groupsUrl).replyOnce(200, singleGroupResponse).onGet(groupsUrl).reply(500);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(201, createdCriterion(10));
      renderProvider();
      await waitForSuccess();
      expect(screen.getByText('Groups refresh error: false')).toBeInTheDocument();

      await click('Associate in course A');

      expect(await screen.findByText('Groups refresh error: true')).toBeInTheDocument();
      expect(screen.getByText('Status: success')).toBeInTheDocument();
    });

    it.each([
      ['the competency changed', [otherTagId]],
      ['leaving and returning to the competency', [otherTagId, tagId]],
    ])('ignores a create response that arrives after %s', async (_description, visits) => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(otherGroupsUrl).reply(200, noGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      const createGate = deferred();
      axiosMock.onPost(createUrl).reply(() => createGate.released.then(() => [201, createdCriterion(777)]));
      const { rerender } = renderProvider();
      await waitForSuccess();
      await click('Associate in course A');
      await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));

      visits.forEach((id) => rerender(providerFor(id)));
      await waitForSuccess();
      await click('Select rule box 999 gte');
      await act(async () => {
        createGate.release();
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });
      });

      expect(screen.getByText(selectionOnGroup(999))).toBeInTheDocument();
    });

    it('handles the result of every create when several are started before the first one settles', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).replyOnce(500).onPost(createUrl).replyOnce(201, createdCriterion(888));
      renderProvider();
      await waitForSuccess();

      await click('Associate two in one tick');

      await waitFor(() => expectToast(createFailedMessage, ErrorIcon));
      await screen.findByText(selectionOnGroup(888));
      expect(axiosMock.history.post).toHaveLength(2);
    });

    it('reports a create in flight through isAssociating', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(() => new Promise(() => {}));
      renderProvider();
      await waitForSuccess();

      await click('Associate in course A');

      await screen.findByText('Associating: true');
    });

    it('reports a create in flight only for the competency it was started in', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(otherGroupsUrl).reply(200, noGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(() => new Promise(() => {}));
      const { rerender } = renderProvider();
      await waitForSuccess();
      await click('Associate in course A');
      await screen.findByText('Associating: true');

      rerender(providerFor(otherTagId));
      await waitForSuccess();
      expect(screen.getByText('Associating: false')).toBeInTheDocument();

      rerender(providerFor(tagId));
      await waitForSuccess();
      expect(screen.getByText('Associating: true')).toBeInTheDocument();
    });

    it('shows a specific toast when the create request 400s with a tag_id field error', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(400, {
        tag_id: ['A parent or child competency already has criteria in this course.'],
      });
      renderProvider();
      await waitForSuccess();

      await click('Associate in course A');

      await waitFor(() => {
        expectToast(
          'This competency can\'t be associated with this content because a parent or child '
            + 'competency already has criteria in this course.',
          ErrorIcon,
        );
      });
    });

    it('shows the generic toast for a 400 that is not a tag_id field error', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(400, { object_id: ['This field is required.'] });
      renderProvider();
      await waitForSuccess();

      await click('Associate in course A');

      await waitFor(() => expectToast(createFailedMessage, ErrorIcon));
    });
  });

  describe('updateGroupOperator', () => {
    it('sends the operator, with no toast, on success', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPatch(updateGroupOperatorUrl).reply(200, {
        id: 10,
        parent_id: 1,
        tag_id: tagId,
        course_key: null,
        name: 'group',
        ordering: 0,
        logic_operator: 'OR',
      });
      renderProvider();
      await waitForSuccess();

      await click('Update group operator');

      await waitFor(() => expect(axiosMock.history.patch).toHaveLength(1));
      expect(axiosMock.history.patch[0].url).toEqual(updateGroupOperatorUrl);
      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({ logic_operator: 'OR' });
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('shows a failure toast on rejection', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPatch(updateGroupOperatorUrl).reply(500);
      renderProvider();
      await waitForSuccess();

      await click('Update group operator');

      await waitFor(() => {
        expectToast('There was a problem updating this group\'s logic. Please try again.', ErrorIcon);
      });
    });
  });

  describe('updateRuleScore', () => {
    it('sends the batch payload and selects the rule box keyed from the response on success', async () => {
      // The refetch after the save returns the edited rule, as the server would.
      let groupsReply = singleGroupResponse;
      axiosMock.onGet(groupsUrl).reply(() => [200, groupsReply]);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPatch(updateRuleScoreUrl).reply(() => {
        groupsReply = {
          ...singleGroupResponse,
          criteria: [criterion(900, 'existing-sub', 10, {
            ruleProfileId: null,
            ruleTypeOverride: 'grade',
            rulePayloadOverride: { op: 'gte', value: 0.8, scale: 'percent' },
          })],
        };
        return [200, [
          {
            id: 900,
            object_id: 'existing-sub',
            group_id: 10,
            rule_profile_id: null,
            rule_type_override: 'grade',
            rule_payload_override: { op: 'gte', value: 0.8, scale: 'percent' },
          },
        ]];
      });
      renderProvider();
      await waitForSuccess();

      await click('Update rule score');

      await waitFor(() => expect(axiosMock.history.patch).toHaveLength(1));
      expect(axiosMock.history.patch[0].url).toEqual(updateRuleScoreUrl);
      // Criterion 900 has no override, so the rule type comes from the system default profile.
      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
        criterion_ids: [900],
        rule_type_override: 'grade',
        rule_payload_override: { op: 'gte', value: 0.8, scale: 'percent' },
      });
      expect(await screen.findByText(selectionOn(10, 'grade:gte:0.8:percent'))).toBeInTheDocument();
    });

    it('shows a failure toast on rejection, without changing selection', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(courseAOutlineUrl).reply(200, outlineFixture);
      axiosMock.onPatch(updateRuleScoreUrl).reply(500);
      renderProvider();
      expect(await screen.findByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();

      await click('Update rule score');

      await waitFor(() => {
        expectToast('There was a problem updating this rule\'s score. Please try again.', ErrorIcon);
      });
      expect(screen.getByText(selectionOn(10, gte70PercentRuleKey))).toBeInTheDocument();
    });
  });
});
