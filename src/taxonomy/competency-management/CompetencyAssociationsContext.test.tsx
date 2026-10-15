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
const updateGroupOperatorUrl = apiUrls.updateCompetencyCriteriaGroup(tagId, 10);
const updateRuleScoreUrl = apiUrls.updateCompetencyCriteriaRule(10);

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

/** The competency's root group (id 500, instance-wide, never rendered),
 * one course-level group (courseA, id 1) holding one leaf group (id 10)
 * with one criterion (`existing-sub`, no override - resolves through the
 * default profile above).
 */
const singleGroupResponse: CompetencyCriteriaGroupsResponse = {
  groups: [
    {
      id: 500,
      parentId: null,
      tagId,
      courseKey: null,
      name: 'root',
      ordering: 0,
      logicOperator: 'AND',
      archived: false,
    },
    {
      id: 1,
      parentId: 500,
      tagId,
      courseKey: courseA,
      name: 'course',
      ordering: 0,
      logicOperator: 'AND',
      archived: false,
    },
    { id: 10, parentId: 1, tagId, courseKey: null, name: 'leaf', ordering: 0, logicOperator: 'AND', archived: false },
  ],
  criteria: [
    {
      id: 900,
      objectId: 'existing-sub',
      groupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    },
  ],
};

/** Same course-level group, but two leaf groups (10 and 11) - so "exactly
 * one bottom-tier group" is false.
 */
const twoGroupsResponse: CompetencyCriteriaGroupsResponse = {
  groups: [
    {
      id: 500,
      parentId: null,
      tagId,
      courseKey: null,
      name: 'root',
      ordering: 0,
      logicOperator: 'AND',
      archived: false,
    },
    {
      id: 1,
      parentId: 500,
      tagId,
      courseKey: courseA,
      name: 'course',
      ordering: 0,
      logicOperator: 'AND',
      archived: false,
    },
    { id: 10, parentId: 1, tagId, courseKey: null, name: 'leaf', ordering: 0, logicOperator: 'AND', archived: false },
    { id: 11, parentId: 1, tagId, courseKey: null, name: 'leaf', ordering: 1, logicOperator: 'AND', archived: false },
  ],
  criteria: [],
};

const noGroupsResponse: CompetencyCriteriaGroupsResponse = { groups: [], criteria: [] };

/** Two course-level groups under the same root: courseA (id 1, leaf group
 * 10) and courseB (id 2, leaf group 20) - used to prove a course whose own
 * outline fetch fails is excluded from `accessibleCourseGroups` while a
 * sibling course whose outline succeeds is not.
 */
const twoCoursesResponse: CompetencyCriteriaGroupsResponse = {
  groups: [
    {
      id: 500,
      parentId: null,
      tagId,
      courseKey: null,
      name: 'root',
      ordering: 0,
      logicOperator: 'AND',
      archived: false,
    },
    {
      id: 1,
      parentId: 500,
      tagId,
      courseKey: courseA,
      name: 'course',
      ordering: 0,
      logicOperator: 'AND',
      archived: false,
    },
    { id: 10, parentId: 1, tagId, courseKey: null, name: 'leaf', ordering: 0, logicOperator: 'AND', archived: false },
    {
      id: 2,
      parentId: 500,
      tagId,
      courseKey: courseB,
      name: 'course',
      ordering: 1,
      logicOperator: 'AND',
      archived: false,
    },
    { id: 20, parentId: 2, tagId, courseKey: null, name: 'leaf', ordering: 0, logicOperator: 'AND', archived: false },
  ],
  criteria: [],
};

/** courseA (id 1, leaf 10) and courseB (id 2) with two leaves listed out of
 * order: 21 (ordering 1, two rule boxes) and 20 (ordering 0). The last group
 * by `ordering` is 21, and its last rule box is the `eq` override.
 */
const courseBGroupsResponse: CompetencyCriteriaGroupsResponse = {
  groups: [
    ...twoCoursesResponse.groups.filter((group) => group.id !== 20),
    { id: 21, parentId: 2, tagId, courseKey: null, name: 'leaf', ordering: 1, logicOperator: 'AND', archived: false },
    { id: 20, parentId: 2, tagId, courseKey: null, name: 'leaf', ordering: 0, logicOperator: 'AND', archived: false },
  ],
  criteria: [
    { id: 910, objectId: 'b-sub-1', groupId: 21, ruleProfileId: 1, ruleTypeOverride: null, rulePayloadOverride: null },
    {
      id: 911,
      objectId: 'b-sub-2',
      groupId: 21,
      ruleProfileId: null,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'eq', value: 1, scale: 'percent' },
    },
  ],
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
      <button type="button" onClick={() => ctx.focusGroup(20)}>focus-group-20</button>
      <button type="button" onClick={() => ctx.focusRuleBox(10, 'grade:gte:0.7:percent')}>focus-rulebox-10</button>
      <button type="button" onClick={() => ctx.notifyCourseExpanded(courseB)}>expand-course-b</button>
      <button type="button" onClick={() => ctx.associateSubsection('new-sub', courseA)}>associate-course-a</button>
      <button type="button" onClick={() => ctx.associateSubsection('new-sub', courseB)}>associate-course-b</button>
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
      <button type="button" onClick={() => ctx.updateGroupOperator(10, 'OR')}>update-group-operator</button>
      <button
        type="button"
        onClick={() => {
          // Caught only to silence an unhandled-rejection warning; irrelevant to this consumer.
          ctx.updateRuleScore(10, [900], { op: 'gte', value: 0.8, scale: 'percent' }).catch(() => {});
        }}
      >
        update-rule-score
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

  describe('notifyCourseExpanded focus', () => {
    const renderWithCourseB = async () => {
      axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(200, outlineFixture);
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('profile-status')).toHaveTextContent('profile-success'));
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));
    };

    it('moves focus from another course\'s group to the expanded course\'s last group and last rule box', async () => {
      await renderWithCourseB();
      fireEvent.click(screen.getByText('focus-group-10'));

      fireEvent.click(screen.getByText('expand-course-b'));
      const expected = JSON.stringify({ groupId: 21, ruleKey: 'grade:eq:1:percent' });
      expect(screen.getByTestId('focus')).toHaveTextContent(expected);

      fireEvent.click(screen.getByText('focus-group-10'));
      fireEvent.click(screen.getByText('expand-course-b'));
      expect(screen.getByTestId('focus')).toHaveTextContent(expected);
    });

    it('moves focus when nothing is focused', async () => {
      await renderWithCourseB();

      fireEvent.click(screen.getByText('expand-course-b'));

      expect(screen.getByTestId('focus')).toHaveTextContent('"groupId":21');
    });

    it('leaves focus unchanged when the expanded course has no groups', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('profile-status')).toHaveTextContent('profile-success'));
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));
      fireEvent.click(screen.getByText('focus-group-10'));

      fireEvent.click(screen.getByText('expand-course-b'));

      expect(screen.getByTestId('focus')).toHaveTextContent('"groupId":10');
    });

    it('leaves focus unchanged when it is already on a group of the expanded course', async () => {
      await renderWithCourseB();
      fireEvent.click(screen.getByText('focus-group-20'));
      const before = screen.getByTestId('focus').textContent;

      fireEvent.click(screen.getByText('expand-course-b'));

      expect(before).toContain('"groupId":20');
      expect(screen.getByTestId('focus')).toHaveTextContent(before as string);
    });

    it('associates a subsection of the expanded course into the group that expansion focused', async () => {
      await renderWithCourseB();
      axiosMock.onPost(createUrl).reply(201, {
        id: 920,
        group_id: 21,
        rule_profile_id: null,
        rule_type_override: 'grade',
        rule_payload_override: { op: 'eq', value: 1, scale: 'percent' },
        object_tag_id: tagId,
      });
      fireEvent.click(screen.getByText('focus-group-10'));
      fireEvent.click(screen.getByText('expand-course-b'));

      fireEvent.click(screen.getByText('associate-course-b'));

      await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        object_id: 'new-sub',
        group_id: 21,
        rule_type_override: 'grade',
        rule_payload_override: { op: 'eq', value: 1, scale: 'percent' },
      });
    });
  });

  describe('associateSubsection', () => {
    it('sends the focused group\'s id and rule when the focus is a group belonging to the clicked subsection\'s course', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(201, {
        id: 901,
        group_id: 10,
        rule_profile_id: null,
        rule_type_override: 'grade',
        rule_payload_override: { op: 'gte', value: 0.7, scale: 'percent' },
        object_tag_id: tagId,
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
        group_id: 20,
        rule_profile_id: 1,
        rule_type_override: null,
        rule_payload_override: null,
        object_tag_id: tagId,
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
        group_id: 20,
        rule_profile_id: 1,
        rule_type_override: null,
        rule_payload_override: null,
        object_tag_id: tagId,
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
        group_id: 999,
        rule_profile_id: null,
        rule_type_override: 'grade',
        rule_payload_override: { op: 'eq', value: 1, scale: 'percent' },
        object_tag_id: tagId,
      });
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

      fireEvent.click(screen.getByText('associate-course-a'));

      await waitFor(() => {
        expect(screen.getByTestId('focus')).toHaveTextContent('"groupId":999');
      });
      expect(screen.getByTestId('focus')).toHaveTextContent('"ruleKey":"grade:eq:1:percent"');
    });

    it('shows a specific toast when the create request 400s with a tag_id field error', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(400, {
        tag_id: ['A parent or child competency already has criteria in this course.'],
      });
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

      fireEvent.click(screen.getByText('associate-course-a'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'This competency can\'t be associated with this content because a parent or child '
            + 'competency already has criteria in this course.',
        );
      });
    });

    it('shows the generic toast for a 400 that is not a tag_id field error', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      axiosMock.onPost(createUrl).reply(400, { object_id: ['This field is required.'] });
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

      fireEvent.click(screen.getByText('associate-course-a'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('There was a problem creating this association. Please try again.');
      });
    });
  });

  describe('updateGroupOperator', () => {
    it('sends the new operator, with no toast, on success', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      axiosMock.onPatch(updateGroupOperatorUrl).reply(200, {
        id: 10,
        parent_id: 1,
        tag_id: tagId,
        course_key: null,
        name: 'leaf',
        ordering: 0,
        logic_operator: 'OR',
        archived: false,
      });
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

      fireEvent.click(screen.getByText('update-group-operator'));

      await waitFor(() => expect(axiosMock.history.patch).toHaveLength(1));
      expect(axiosMock.history.patch[0].url).toEqual(updateGroupOperatorUrl);
      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({ logic_operator: 'OR' });
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('shows a failure toast on rejection', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      axiosMock.onPatch(updateGroupOperatorUrl).reply(500);
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

      fireEvent.click(screen.getByText('update-group-operator'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'There was a problem updating this group\'s logic. Please try again.',
        );
      });
    });
  });

  describe('updateRuleScore', () => {
    it(
      'sends the batch payload and derives the new focus key from the response\'s own values, not the '
        + 'request\'s, on success',
      async () => {
        axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
        axiosMock.onGet(profileUrl).reply(200, profileResponse);
        axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
        // The request (below) sends an explicit override of 0.8; the mocked response simulates
        // the backend's "reset to default" behavior instead, reassigning the criterion to the
        // shared default profile (0.7) with both override fields cleared. An implementation that
        // (incorrectly) derived the new focus key from the request would compute 0.8's key here.
        axiosMock.onPatch(updateRuleScoreUrl).reply(200, [
          {
            id: 900,
            object_id: 'existing-sub',
            group_id: 10,
            rule_profile_id: 1,
            rule_type_override: null,
            rule_payload_override: null,
          },
        ]);
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('groups-status')).toHaveTextContent('groups-success'));

        fireEvent.click(screen.getByText('update-rule-score'));

        await waitFor(() => expect(axiosMock.history.patch).toHaveLength(1));
        expect(axiosMock.history.patch[0].url).toEqual(updateRuleScoreUrl);
        expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
          criterion_ids: [900],
          rule_type_override: 'grade',
          rule_payload_override: { op: 'gte', value: 0.8, scale: 'percent' },
        });

        await waitFor(() => {
          expect(screen.getByTestId('focus')).toHaveTextContent('"groupId":10');
        });
        expect(screen.getByTestId('focus')).toHaveTextContent('"ruleKey":"grade:gte:0.7:percent"');
      },
    );

    it('shows a failure toast on rejection, without changing focus', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(profileUrl).reply(200, profileResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineFixture);
      axiosMock.onPatch(updateRuleScoreUrl).reply(500);
      renderProvider();
      await waitFor(() => {
        expect(screen.getByTestId('focus')).toHaveTextContent('"ruleKey":"grade:gte:0.7:percent"');
      });

      fireEvent.click(screen.getByText('update-rule-score'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'There was a problem updating this rule\'s score. Please try again.',
        );
      });
      expect(screen.getByTestId('focus')).toHaveTextContent('"ruleKey":"grade:gte:0.7:percent"');
    });
  });
});
