import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import {
  fireEvent,
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import { CompetencyAssociationsProvider, useCompetencyAssociations } from './CompetencyAssociationsContext';
import { apiUrls } from './data/api';
import type { CompetencyCriteriaGroupsResponse } from './data/types';

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];
let mockShowToast: ReturnType<typeof initializeMocks>['mockShowToast'];

const tagId = 42;
const courseA = 'course-v1:OrgX+CS101+2024';
const courseB = 'course-v1:OrgX+CS102+2024';
const courseOther = 'course-v1:OrgX+CS999+2024';

const groupsUrl = apiUrls.competencyCriteriaGroups(tagId);
const profileUrl = apiUrls.defaultCompetencyRuleProfile();
const createUrl = apiUrls.createCompetencyCriterion(tagId);

/** `#773`'s real response envelope: a paginated list, not a single object -
 * see `CompetencyRuleProfileListResponse` in `./data/types`.
 */
const profileResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      scope_type: 'system_default',
      rule_type: 'grade',
      rule_payload: { op: 'gte', value: 0.7, scale: 'percent' },
      archived: false,
    },
  ],
};

/** One course-level group (courseA, id 1) holding one bottom-tier group
 * (id 10) with one criterion (`existing-sub`, no override - resolves
 * through the default profile above).
 */
const singleGroupResponse: CompetencyCriteriaGroupsResponse = {
  groups: [
    {
      id: 1,
      parentId: null,
      depth: 1,
      ordering: 0,
      logicOperator: 'and',
      courseKey: courseA,
    },
    { id: 10, parentId: 1, depth: 2, ordering: 0, logicOperator: 'and' },
  ],
  criteria: [
    {
      id: 900,
      objectId: 'existing-sub',
      competencyCriteriaGroupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    },
  ],
};

/** Same course-level group, but two bottom-tier groups (10 and 11) - so
 * "exactly one bottom-tier group" is false.
 */
const twoGroupsResponse: CompetencyCriteriaGroupsResponse = {
  groups: [
    {
      id: 1,
      parentId: null,
      depth: 1,
      ordering: 0,
      logicOperator: 'and',
      courseKey: courseA,
    },
    { id: 10, parentId: 1, depth: 2, ordering: 0, logicOperator: 'and' },
    { id: 11, parentId: 1, depth: 2, ordering: 1, logicOperator: 'and' },
  ],
  criteria: [],
};

const noGroupsResponse: CompetencyCriteriaGroupsResponse = { groups: [], criteria: [] };

/** Two course-level groups: courseA (id 1, bottom-tier group 10) and
 * courseB (id 2, bottom-tier group 20) - used to prove a course whose own
 * outline fetch fails is excluded from `accessibleCourseGroups` while a
 * sibling course whose outline succeeds is not.
 */
const twoCoursesResponse: CompetencyCriteriaGroupsResponse = {
  groups: [
    {
      id: 1,
      parentId: null,
      depth: 1,
      ordering: 0,
      logicOperator: 'and',
      courseKey: courseA,
    },
    { id: 10, parentId: 1, depth: 2, ordering: 0, logicOperator: 'and' },
    {
      id: 2,
      parentId: null,
      depth: 1,
      ordering: 1,
      logicOperator: 'and',
      courseKey: courseB,
    },
    { id: 20, parentId: 2, depth: 2, ordering: 0, logicOperator: 'and' },
  ],
  criteria: [],
};

const outlineFixture = buildOutlineIndex();

/** Exposes every context value/action as plain, clickable test hooks. */
const TestConsumer = () => {
  const ctx = useCompetencyAssociations();
  return (
    <div>
      <div data-testid="focus">{JSON.stringify(ctx.focus)}</div>
      <div data-testid="groups-status">{ctx.groupsQuery.isSuccess ? 'groups-success' : 'groups-pending'}</div>
      <div data-testid="profile-status">{ctx.profileQuery.isSuccess ? 'profile-success' : 'profile-pending'}</div>
      <div data-testid="accessible-course-group-ids">
        {ctx.accessibleCourseGroups.map((group) => group.courseKey).join(',')}
      </div>
      <button type="button" onClick={() => ctx.focusGroup(999)}>focus-999</button>
      <button type="button" onClick={() => ctx.focusGroup(10)}>focus-group-10</button>
      <button type="button" onClick={() => ctx.focusRuleBox(10, 'grade:gte:0.7:percent')}>focus-rulebox-10</button>
      <button type="button" onClick={() => ctx.notifyCourseExpanded(courseB)}>expand-course-b</button>
      <button type="button" onClick={() => ctx.associateSubsection('new-sub', courseA)}>associate-course-a</button>
      <button
        type="button"
        onClick={() => ctx.associateSubsection('new-sub', courseOther)}
      >
        associate-other-course
      </button>
      <button
        type="button"
        onClick={() => ctx.associateSubsection('existing-sub', courseA)}
      >
        associate-duplicate
      </button>
    </div>
  );
};

const renderProvider = () =>
  render(
    <CompetencyAssociationsProvider tagId={tagId} competencyExternalId="CCRS-1.3">
      <TestConsumer />
    </CompetencyAssociationsProvider>,
  );

describe('CompetencyAssociationsProvider', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
  });

  describe('initial focus', () => {
    it('focuses the sole bottom-tier group once the groups query and every visible course outline resolve', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      renderProvider();

      await waitFor(() => {
        expect(screen.getByTestId('focus')).toHaveTextContent('"groupId":10');
      });
      expect(screen.getByTestId('focus')).toHaveTextContent('"ruleKey":"grade:gte:0.7:percent"');
    });

    it('leaves focus unset when more than one bottom-tier group exists across visible course groups', async () => {
      axiosMock.onGet(groupsUrl).reply(200, twoGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      renderProvider();

      await waitFor(() => {
        expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success');
      });
      expect(screen.getByTestId('focus')).toHaveTextContent('null');
    });

    it('leaves focus unset when there are no visible course-level groups', async () => {
      axiosMock.onGet(groupsUrl).reply(200, noGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      renderProvider();

      await waitFor(() => {
        expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success');
      });
      expect(screen.getByTestId('focus')).toHaveTextContent('null');
    });

    it('a click beats a preceding auto-focus and is not reverted once the data resolves', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      renderProvider();

      // Click before anything has resolved - at this point `focus` is
      // still unset and the initial-focus effect hasn't run yet.
      fireEvent.click(screen.getByText('focus-999'));
      expect(screen.getByTestId('focus')).toHaveTextContent('"groupId":999');

      // Let the groups/profile/outline queries resolve - the sole
      // bottom-tier group (id 10) would otherwise be auto-focused.
      await waitFor(() => {
        expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success');
      });

      // The manual click's focus must survive - the auto-focus effect
      // still marks itself as having run, but skips writing anything
      // because focus was no longer unset by the time its gate resolved.
      expect(screen.getByTestId('focus')).toHaveTextContent('"groupId":999');
    });
  });

  describe('accessibleCourseGroups', () => {
    it('excludes a course-level group whose own outline fetch fails, keeping a sibling course\'s group', async () => {
      axiosMock.onGet(groupsUrl).reply(200, twoCoursesResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      // courseB's own outline fetch fails - e.g. a 403 on a course the
      // author can see via content search but can't read the outline of.
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(403);
      renderProvider();

      await waitFor(() => {
        expect(screen.getByTestId('accessible-course-group-ids')).toHaveTextContent(courseA);
      });
      // Not shown with a missing/blank/placeholder name instead - it's
      // excluded entirely, never included at all.
      expect(screen.getByTestId('accessible-course-group-ids')).not.toHaveTextContent(courseB);
    });

    it('excludes every course-level group when every course fails, leaving the list empty (same as no associations at all)', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(403);
      renderProvider();

      // Wait for the outline request itself to actually complete (not just
      // for the unrelated groups query), so this doesn't pass vacuously
      // before the failure has even been processed.
      await waitFor(() => {
        expect(axiosMock.history.get.some((req) => req.url === getCourseOutlineIndexApiUrl(courseA))).toBe(true);
      });
      await waitFor(() => {
        expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success');
      });
      expect(screen.getByTestId('accessible-course-group-ids')).toHaveTextContent('');
    });

    it('does not auto-focus a bottom-tier group that belongs to an inaccessible course', async () => {
      // A single course-level group with a single bottom-tier group - the
      // exact shape `'focuses the sole bottom-tier group...'` above proves
      // auto-focuses when the course IS accessible. Here, its own outline
      // fetch fails, so this bottom-tier group must not be eligible for
      // auto-focus at all, even though it's still the *only* one in the raw
      // `#681` response - counting the raw response instead of
      // `accessibleCourseGroups` was exactly the bug this test guards
      // against.
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(403);
      renderProvider();

      // Wait for the outline request itself to actually complete first, so
      // the assertions below don't pass vacuously before the failure has
      // even been processed.
      await waitFor(() => {
        expect(axiosMock.history.get.some((req) => req.url === getCourseOutlineIndexApiUrl(courseA))).toBe(true);
      });
      await waitFor(() => {
        expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success');
      });
      expect(screen.getByTestId('accessible-course-group-ids')).toHaveTextContent('');
      expect(screen.getByTestId('focus')).toHaveTextContent('null');
    });
  });

  it(
    'does not delay initial focus when an unrelated, still-loading course is expanded via notifyCourseExpanded',
    async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      // Course B has no group for this competency, and its own outline
      // never resolves - simulates the author expanding an unrelated
      // course in the content panel below while this competency's own
      // course (courseA) is still loading. `notifyCourseExpanded` feeds
      // `canEditCourse`'s course list, not the initial-focus gate, so this
      // must have no bearing on when focus fires.
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(() => new Promise(() => {}));
      renderProvider();

      fireEvent.click(screen.getByText('expand-course-b'));

      // The sole bottom-tier group (courseA's group 10) still auto-focuses
      // once courseA's own data resolves, unaffected by courseB's outline
      // never resolving.
      await waitFor(() => {
        expect(screen.getByTestId('focus')).toHaveTextContent('"groupId":10');
      });
    },
  );

  describe('associateSubsection', () => {
    it('sends the focused group\'s id and rule when the focus is a group belonging to the clicked subsection\'s course', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(201, {
        id: 901,
        object_id: 'new-sub',
        competency_criteria_group_id: 10,
        rule_profile_id: null,
        rule_type_override: 'grade',
        rule_payload_override: { op: 'gte', value: 0.7, scale: 'percent' },
      });
      renderProvider();
      // `associateSubsection` no-ops until the groups/profile queries have
      // resolved (matching real usage - the content panel only offers this
      // action once `CourseGroupList`'s own loading gate has passed).
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

      fireEvent.click(screen.getByText('focus-rulebox-10'));
      fireEvent.click(screen.getByText('associate-course-a'));

      await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        object_id: 'new-sub',
        group_id: 10,
        rule_type_override: 'grade',
        rule_payload_override: { op: 'gte', value: 0.7, scale: 'percent' },
      });
    });

    it('omits group_id and rule fields when focus is unset', async () => {
      axiosMock.onGet(groupsUrl).reply(200, noGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onPost(createUrl).reply(201, {
        id: 902,
        object_id: 'new-sub',
        competency_criteria_group_id: 20,
        rule_profile_id: 1,
        rule_type_override: null,
        rule_payload_override: null,
      });
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

      fireEvent.click(screen.getByText('associate-course-a'));

      await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ object_id: 'new-sub' });
    });

    it('omits group_id and rule fields when focus is a group belonging to a different course', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(201, {
        id: 903,
        object_id: 'new-sub',
        competency_criteria_group_id: 20,
        rule_profile_id: 1,
        rule_type_override: null,
        rule_payload_override: null,
      });
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

      fireEvent.click(screen.getByText('focus-rulebox-10')); // group 10 belongs to courseA
      fireEvent.click(screen.getByText('associate-other-course')); // clicked from courseOther

      await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ object_id: 'new-sub' });
    });

    it('returns early with an informational toast, sending no request, for an already-associated subsection', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

      fireEvent.click(screen.getByText('associate-duplicate'));

      expect(axiosMock.history.post).toHaveLength(0);
      expect(mockShowToast).toHaveBeenCalledWith('This content is already associated with this competency.');
    });

    it('focuses the response\'s group and rule after a successful create, not a stale local read', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      // Group 999 doesn't exist anywhere in the local tree - if focus were
      // derived via `lastRealRuleKeyIn` against the (stale, not-yet-refetched)
      // local index, it would find nothing and resolve a `null` rule key.
      axiosMock.onPost(createUrl).reply(201, {
        id: 904,
        object_id: 'new-sub',
        competency_criteria_group_id: 999,
        rule_profile_id: null,
        rule_type_override: 'grade',
        rule_payload_override: { op: 'eq', value: 1, scale: 'percent' },
      });
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

      fireEvent.click(screen.getByText('associate-course-a'));

      await waitFor(() => {
        expect(screen.getByTestId('focus')).toHaveTextContent('"groupId":999');
      });
      expect(screen.getByTestId('focus')).toHaveTextContent('"ruleKey":"grade:eq:1:percent"');
    });
  });
});
