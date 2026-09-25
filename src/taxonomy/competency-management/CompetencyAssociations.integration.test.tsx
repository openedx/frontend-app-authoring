import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import type { Course } from '@src/studio-home/data/api';
import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from '@src/testUtils';
import {
  courseA,
  courseB,
  courseBGroupsResponse,
  criterion,
  defaultProfileResponse,
  mockScrollIntoView,
  singleGroupResponse,
  tagId,
  twoCoursesResponse,
} from './__mocks__';
import { CompetencyAssociationsProvider } from './CompetencyAssociationsContext';
import CourseRow from './course-search/CourseRow';
import { CourseGroupList } from './criteria-groups';
import { apiUrls } from './data/api';

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

const groupsUrl = apiUrls.competencyCriteriaGroups(tagId);
const profileUrl = apiUrls.defaultCompetencyRuleProfile();
const createUrl = apiUrls.createCompetencyCriterion(tagId);

const courseRow = (courseKey: string, displayName: string): Course => ({
  courseKey,
  displayName,
  lmsLink: null,
  number: 'CS102',
  org: 'OrgX',
  rerunLink: null,
  run: '2024',
  url: `/course/${courseKey}`,
});

const courseARow = courseRow(courseA, 'Course A');
const courseBRow = courseRow(courseB, 'Course B');

const outlineOf = (courseName: string, subsections: Record<string, string>) =>
  buildOutlineIndex({
    sections: [{
      id: `${courseName}-section`,
      displayName: 'Section 1',
      children: Object.entries(subsections).map(([id, displayName]) => ({
        id,
        displayName,
        overrides: { graded: true, usageKey: undefined },
      })),
    }],
    overrides: { courseStructure: { displayName: courseName } },
  });

const renderPanel = (rows: Course[] = [courseBRow]) =>
  render(
    <CompetencyAssociationsProvider tagId={tagId} competencyExternalId="CCRS-1.3">
      <CourseGroupList />
      {rows.map((row) => <CourseRow key={row.courseKey} course={row} />)}
    </CompetencyAssociationsProvider>,
  );

// The author can edit these courses, so a header and a rule box are divs around the editable controls, not buttons.
const groupHeaders = () => Array.from(document.querySelectorAll<HTMLElement>('.criteria-group-box__header'));
const ruleBoxControls = () => Array.from(document.querySelectorAll<HTMLElement>('.rule-box__control'));
const ruleBoxWithScore = (percent: string) => {
  const control = ruleBoxControls().find((candidate) => within(candidate).queryByDisplayValue(percent));
  if (!control) {
    throw new Error(`No rule box with a score of ${percent}`);
  }
  return control;
};
const currentStates = (elements: HTMLElement[]) => elements.map((element) => element.getAttribute('aria-current'));

describe('competency associations over the real provider', () => {
  const scrollIntoView = mockScrollIntoView();
  let user: ReturnType<typeof userEvent.setup>;
  let mockShowToast: ReturnType<typeof initializeMocks>['mockShowToast'];

  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
    user = userEvent.setup();
    axiosMock.onGet(profileUrl).reply(200, defaultProfileResponse);
  });

  it('expanding a course moves focus to its last group and last rule box, reopening its collapsed card', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      outlineOf('Course B', { 'b-sub-1': 'Homework 1', 'b-sub-2': 'Homework 2' }),
    );
    renderPanel();
    // Focus starts on course A's group, with the course B card collapsed.
    await screen.findAllByText(/^By completing/);
    await user.click(groupHeaders()[0]);
    expect(groupHeaders()[0]).toHaveAttribute('aria-current', 'true');
    await user.click(await screen.findByRole('button', { name: 'Collapse Course B' }));
    expect(screen.queryByText('Homework 1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand' }));

    // Course B's groups are 20 (ordering 0) and 21 (ordering 1). Group 21's last box is the `eq` override.
    const headers = groupHeaders();
    expect(currentStates(headers)).toEqual(['false', 'false', 'true']);
    const lastRuleBox = ruleBoxWithScore('100');
    expect(lastRuleBox).toHaveAttribute('aria-current', 'true');
    expect(ruleBoxWithScore('70')).toHaveAttribute('aria-current', 'false');
    expect(screen.getByRole('button', { name: 'Collapse Course B' })).toBeInTheDocument();
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(lastRuleBox.parentElement);
  });

  it('selecting a subsection in a course with no groups creates its group and rule box and focuses them', async () => {
    let groupsReply = singleGroupResponse;
    axiosMock.onGet(groupsUrl).reply(() => [200, groupsReply]);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(
      200,
      outlineOf('Course A', { 'existing-sub': 'Homework A' }),
    );
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      outlineOf('Course B', { 'b-sub-1': 'Homework 1' }),
    );
    axiosMock.onPost(createUrl).reply(() => {
      groupsReply = {
        ...twoCoursesResponse,
        criteria: [...singleGroupResponse.criteria, criterion(901, 'b-sub-1', 20)],
      };
      return [201, {
        id: 901,
        group_id: 20,
        rule_profile_id: 1,
        rule_type_override: null,
        rule_payload_override: null,
        object_tag_id: tagId,
      }];
    });
    renderPanel();
    // Course A's only group is auto-focused, so a missing `group_id` is not the focus-less default.
    expect(await screen.findByRole('heading', { name: 'From within Course A ...' })).toBeInTheDocument();
    expect(groupHeaders()).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Expand' }));
    await user.click(await screen.findByRole('button', { name: 'Expand' }));

    await user.click(await screen.findByRole('button', { name: 'Associate CCRS-1.3 with Homework 1' }));

    expect(await screen.findByRole('heading', { name: 'From within Course B ...' })).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ object_id: 'b-sub-1' });
    const headers = groupHeaders();
    expect(currentStates(headers)).toEqual(['false', 'true']);
    const ruleBoxes = ruleBoxControls();
    expect(currentStates(ruleBoxes)).toEqual(['false', 'true']);
    expect(scrollIntoView.mock.contexts).toContain(ruleBoxes[1].parentElement);
  });

  it('selecting a subsection in a course while focus is on another course adds to that course\'s last group', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(
      200,
      outlineOf('Course A', { 'a-sub-1': 'Homework A' }),
    );
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(200, outlineOf('Course B', {}));
    axiosMock.onPost(createUrl).reply(201, {
      id: 902,
      group_id: 10,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
      object_tag_id: tagId,
    });
    renderPanel([courseARow, courseBRow]);
    await screen.findAllByRole('heading', { name: /^From within Course/ });
    // Expanding course A and then course B leaves the focus on course B's last group.
    await user.click(screen.getAllByRole('button', { name: 'Expand' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Expand' })[1]);
    expect(currentStates(groupHeaders())).toEqual(['false', 'false', 'true']);
    await user.click(screen.getAllByRole('button', { name: 'Expand' })[0]);

    await user.click(await screen.findByRole('button', { name: 'Associate CCRS-1.3 with Homework A' }));

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ object_id: 'a-sub-1', group_id: 10 });
  });

  it('moves the focus when a second group header and then a second rule box are clicked', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      outlineOf('Course B', { 'b-sub-1': 'Homework 1', 'b-sub-2': 'Homework 2' }),
    );
    renderPanel();
    await screen.findByText('Homework 1');
    expect(currentStates(groupHeaders())).toEqual(['false', 'false', 'false']);

    await user.click(groupHeaders()[1]);

    expect(currentStates(groupHeaders())).toEqual(['false', 'true', 'false']);
    expect(currentStates(ruleBoxControls())).toEqual(['false', 'false']);

    await user.click(ruleBoxWithScore('100'));

    expect(currentStates(groupHeaders())).toEqual(['false', 'false', 'true']);
    expect(currentStates(ruleBoxControls())).toEqual(['false', 'true']);
  });

  it('shows the empty state when every course outline is refused with 403', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(403);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(403);
    renderPanel();

    expect(await screen.findByText('No content associated.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^From within Course/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/^By completing/)).not.toBeInTheDocument();
  });

  it('shows the failure toast and adds no chip when the create request fails', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      outlineOf('Course B', { 'b-sub-3': 'Homework 3' }),
    );
    axiosMock.onPost(createUrl).reply(500);
    renderPanel();
    await user.click(await screen.findByRole('button', { name: 'Expand' }));
    await user.click(await screen.findByRole('button', { name: 'Expand' }));

    await user.click(await screen.findByRole('button', { name: 'Associate CCRS-1.3 with Homework 3' }));

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        'There was a problem creating this association. Please try again.',
        undefined,
        undefined,
        expect.anything(),
      )
    );
    // The outline row is the only place the new subsection's name appears, so no chip was added for it.
    expect(screen.getAllByText('Homework 3')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Associate CCRS-1.3 with Homework 3' })).toBeEnabled();
  });
});
