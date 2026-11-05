import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import type { Course } from '@src/studio-home/data/api';
import {
  initializeMocks,
  render,
  screen,
  userEvent,
} from '@src/testUtils';
import {
  courseA,
  courseB,
  courseBGroupsResponse,
  criterion,
  defaultProfileResponse,
  singleGroupResponse,
  tagId,
  twoCoursesResponse,
} from './__mocks__';
import { CompetencyAssociationsProvider } from './CompetencyAssociationsContext';
import CourseRow from './course-search/CourseRow';
import { CourseGroupList } from './criteria-groups';
import { apiUrls } from './data/api';

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

const originalScrollIntoView = Element.prototype.scrollIntoView;

const groupsUrl = apiUrls.competencyCriteriaGroups(tagId);
const profileUrl = apiUrls.defaultCompetencyRuleProfile();
const createUrl = apiUrls.createCompetencyCriterion(tagId);

const courseBRow: Course = {
  courseKey: courseB,
  displayName: 'Course B',
  lmsLink: null,
  number: 'CS102',
  org: 'OrgX',
  rerunLink: null,
  run: '2024',
  url: `/course/${courseB}`,
};

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

const renderPanel = () =>
  render(
    <CompetencyAssociationsProvider tagId={tagId} competencyExternalId="CCRS-1.3">
      <CourseGroupList />
      <CourseRow course={courseBRow} />
    </CompetencyAssociationsProvider>,
  );

const groupHeaders = () => screen.getAllByRole('button', { name: 'By completing any of the following' });
const currentStates = (elements: HTMLElement[]) => elements.map((element) => element.getAttribute('aria-current'));

describe('competency associations over the real provider', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    user = userEvent.setup();
    Element.prototype.scrollIntoView = jest.fn();
    axiosMock.onGet(profileUrl).reply(200, defaultProfileResponse);
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
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
    await user.click((await screen.findAllByRole('button', { name: 'By completing any of the following' }))[0]);
    await user.click(await screen.findByRole('button', { name: 'Collapse Course B' }));
    expect(screen.queryByText('Homework 1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand' }));

    // Course B's groups are 20 (ordering 0) and 21 (ordering 1). Group 21's last box is the `eq` override.
    const headers = groupHeaders();
    expect(currentStates(headers)).toEqual(['false', 'false', 'true']);
    const lastRuleBox = screen.getByRole('button', { name: 'With a score of 100%' });
    expect(lastRuleBox).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: 'With a score of 70% or higher' })).toHaveAttribute(
      'aria-current',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Collapse Course B' })).toBeInTheDocument();
    expect(headers[2]).toBeVisible();
    expect(lastRuleBox).toBeVisible();
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
    const ruleBoxes = screen.getAllByRole('button', { name: 'With a score of 70% or higher' });
    expect(currentStates(ruleBoxes)).toEqual(['false', 'true']);
    expect(headers[1]).toBeVisible();
    expect(ruleBoxes[1]).toBeVisible();
  });
});
