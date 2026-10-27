import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import {
  initializeMocks,
  render,
  screen,
  within,
} from '@src/testUtils';
import {
  buildMockCompetencyAssociationsContextValue,
  byTextContent,
  courseA,
  courseB,
  criterion,
  MockCompetencyAssociationsProvider,
  twoCoursesResponse,
} from '../__mocks__';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
import CourseGroupList from './CourseGroupList';

const noAssociationsMessage = 'No content associated with Test Competency yet.';
const noAssociationsPromptMessage = 'Make content selections to create competency criteria associations.';
const outOfViewFirstSentence = 'No content associated with Test Competency in the courses listed here.';
const noAccessibleFirstSentence =
  'No content associated with Test Competency that you can open in the courses listed here.';

const renderList = (contextOverrides: Parameters<typeof buildMockCompetencyAssociationsContextValue>[0] = {}) => (
  render(
    <MockCompetencyAssociationsProvider value={{ competencyName: 'Test Competency', ...contextOverrides }}>
      <CourseGroupList />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<CourseGroupList />', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('renders a loading state, not the empty state, while the status is pending', () => {
    renderList({ status: 'pending' });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText(byTextContent(noAssociationsMessage))).not.toBeInTheDocument();
  });

  it('renders a failed state, not the empty state, when the status is error', () => {
    renderList({ status: 'error', error: new Error('boom') });
    expect(screen.getByText('There was a problem loading this competency\'s associations. Please try again.'))
      .toBeInTheDocument();
    expect(screen.queryByText(byTextContent(noAssociationsMessage))).not.toBeInTheDocument();
  });

  it('renders the empty state when no course group is accessible, whatever the groups index holds', () => {
    renderList({
      groupsIndex: buildCompetencyCriteriaGroupsIndex(twoCoursesResponse),
      accessibleCourseGroups: [],
    });
    expect(screen.getByText(byTextContent(noAssociationsMessage))).toBeInTheDocument();
    expect(screen.getByText(noAssociationsPromptMessage)).toBeInTheDocument();
  });

  it('renders one card per accessible course group and none for the others in the groups index', async () => {
    // Course A's outline resolves, so a card for it would render if the list did not filter it out.
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(
      200,
      buildOutlineIndex({
        overrides: { courseStructure: { displayName: 'Course A' } },
      }),
    );
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      buildOutlineIndex({
        overrides: { courseStructure: { displayName: 'Course B' } },
      }),
    );
    const groupsIndex = buildCompetencyCriteriaGroupsIndex(twoCoursesResponse);
    renderList({
      groupsIndex,
      accessibleCourseGroups: groupsIndex.courseGroups.filter((courseGroup) => courseGroup.courseKey === courseB),
    });

    expect(await screen.findByRole('heading', { name: 'From within Course B ...' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: /From within Course A/ })).not.toBeInTheDocument();
    expect(screen.queryByText(byTextContent(noAssociationsMessage))).not.toBeInTheDocument();
  });

  describe('the empty state when no associations are in the listed courses', () => {
    it('says "no content associated" only when the competency has no associations anywhere', () => {
      renderList({ accessibleCourseGroups: [], criteriaCounts: { criteriaCount: 0, totalCriteriaCount: 0 } });
      const firstLine = screen.getByText(byTextContent(noAssociationsMessage));
      expect(within(firstLine).getByText('Test Competency', { selector: 'strong' })).toBeInTheDocument();
      expect(screen.getByText(noAssociationsPromptMessage)).toBeInTheDocument();
    });

    it.each([
      // Some of the competency's criteria are in courses not listed.
      {
        criteriaCount: 0,
        totalCriteriaCount: 1,
        message: `${outOfViewFirstSentence} 1 association is in courses that are not listed.`,
      },
      {
        criteriaCount: 0,
        totalCriteriaCount: 3,
        message: `${outOfViewFirstSentence} 3 associations are in courses that are not listed.`,
      },
    ])(
      'says none are in the listed courses and how many are in other courses, never "no content associated", '
        + 'when $criteriaCount of $totalCriteriaCount associations are in them',
      ({ criteriaCount, totalCriteriaCount, message }) => {
        renderList({ accessibleCourseGroups: [], criteriaCounts: { criteriaCount, totalCriteriaCount } });
        const firstLine = screen.getByText(byTextContent(message));
        expect(within(firstLine).getByText('Test Competency', { selector: 'strong' })).toBeInTheDocument();
        expect(screen.getByText(noAssociationsPromptMessage)).toBeInTheDocument();
        expect(screen.queryByText(byTextContent(noAssociationsMessage))).not.toBeInTheDocument();
      },
    );

    it.each([
      // Some criteria are in listed courses the author cannot open, and the rest are in courses not listed.
      {
        criteriaCount: 1,
        totalCriteriaCount: 3,
        message: `${noAccessibleFirstSentence} 1 association is in listed courses you can't open, `
          + 'and 2 are in courses that are not listed.',
      },
      {
        criteriaCount: 2,
        totalCriteriaCount: 5,
        message: `${noAccessibleFirstSentence} 2 associations are in listed courses you can't open, `
          + 'and 3 are in courses that are not listed.',
      },
    ])(
      'says how many are in listed courses the author cannot open and how many are unlisted '
        + 'when $criteriaCount of $totalCriteriaCount associations are in the listed courses',
      ({ criteriaCount, totalCriteriaCount, message }) => {
        renderList({ accessibleCourseGroups: [], criteriaCounts: { criteriaCount, totalCriteriaCount } });
        const firstLine = screen.getByText(byTextContent(message));
        expect(within(firstLine).getByText('Test Competency', { selector: 'strong' })).toBeInTheDocument();
        expect(screen.getByText(noAssociationsPromptMessage)).toBeInTheDocument();
        expect(screen.queryByText(byTextContent(noAssociationsMessage))).not.toBeInTheDocument();
      },
    );

    it.each([
      // The listed courses hold every criterion, but the author can open none of those courses.
      { count: 1, message: `${noAccessibleFirstSentence} 1 association is in listed courses you can't open.` },
      { count: 2, message: `${noAccessibleFirstSentence} 2 associations are in listed courses you can't open.` },
    ])(
      'says the $count association(s) are in listed courses the author cannot open, not that they are unlisted',
      ({ count, message }) => {
        renderList({ accessibleCourseGroups: [], criteriaCounts: { criteriaCount: count, totalCriteriaCount: count } });
        const firstLine = screen.getByText(byTextContent(message));
        expect(within(firstLine).getByText('Test Competency', { selector: 'strong' })).toBeInTheDocument();
        expect(screen.getByText(noAssociationsPromptMessage)).toBeInTheDocument();
        expect(screen.queryByText(byTextContent(noAssociationsMessage))).not.toBeInTheDocument();
        expect(screen.queryByText(/not listed/)).not.toBeInTheDocument();
      },
    );

    it('shows a spinner, and neither empty state, while the course list reloads', () => {
      renderList({
        accessibleCourseGroups: [],
        criteriaCounts: { criteriaCount: 0, totalCriteriaCount: 3 },
        courseList: {
          courses: [],
          numPages: 2,
          isLoading: false,
          isPlaceholderData: true,
          isError: false,
          isSuccess: true,
        },
      });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText(/No content associated/)).not.toBeInTheDocument();
      expect(screen.queryByText(noAssociationsPromptMessage)).not.toBeInTheDocument();
    });

    it.each([
      { status: 'pending' as const },
      { status: 'error' as const },
    ])('shows no empty state while the status is $status', ({ status }) => {
      renderList({ status, accessibleCourseGroups: [], criteriaCounts: { criteriaCount: 1, totalCriteriaCount: 3 } });
      expect(
        screen.queryByText(
          byTextContent(`${outOfViewFirstSentence} 2 associations are in courses that are not listed.`),
        ),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(noAssociationsPromptMessage)).not.toBeInTheDocument();
    });

    it('shows the failed state, not an empty state, when the counts are missing', () => {
      renderList({ accessibleCourseGroups: [], criteriaCounts: undefined });
      expect(screen.getByText('There was a problem loading this competency\'s associations. Please try again.'))
        .toBeInTheDocument();
      expect(screen.queryByText(noAssociationsPromptMessage)).not.toBeInTheDocument();
    });
  });

  it('shows rule box menus only in the courses the author can edit', async () => {
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(
      200,
      buildOutlineIndex({ overrides: { courseStructure: { displayName: 'Course A' } } }),
    );
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      buildOutlineIndex({ overrides: { courseStructure: { displayName: 'Course B' } } }),
    );
    const groupsIndex = buildCompetencyCriteriaGroupsIndex({
      ...twoCoursesResponse,
      criteria: [criterion(901, 'sub-a', 10), criterion(902, 'sub-b', 20)],
    });
    renderList({
      groupsIndex,
      accessibleCourseGroups: groupsIndex.courseGroups,
      canEditCourse: (courseId) => courseId === courseB,
    });

    expect(await screen.findByRole('heading', { name: 'From within Course B ...' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'From within Course A ...' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /More actions for the rule with a score of/ })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /^More actions for rule group/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'More actions for Course B' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'More actions for Course A' })).not.toBeInTheDocument();
  });

  it('takes keyboard focus on the empty state when a request asks for it, then consumes the request', () => {
    const consumeKeyboardFocusRequest = jest.fn();
    renderList({
      accessibleCourseGroups: [],
      keyboardFocusRequest: { kind: 'empty' },
      consumeKeyboardFocusRequest,
    });

    expect(screen.getByText(byTextContent(noAssociationsMessage)).parentElement).toHaveFocus();
    expect(consumeKeyboardFocusRequest).toHaveBeenCalledTimes(1);
  });

  it('leaves the empty state unfocused without a request', () => {
    renderList({ accessibleCourseGroups: [] });

    expect(screen.getByText(byTextContent(noAssociationsMessage)).parentElement).not.toHaveFocus();
  });
});
