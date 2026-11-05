import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import { initializeMocks, render, screen } from '@src/testUtils';
import {
  buildMockCompetencyAssociationsContextValue,
  courseA,
  courseB,
  MockCompetencyAssociationsProvider,
  twoCoursesResponse,
} from '../__mocks__';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
import CourseGroupList from './CourseGroupList';

const renderList = (contextOverrides: Parameters<typeof buildMockCompetencyAssociationsContextValue>[0] = {}) => (
  render(
    <MockCompetencyAssociationsProvider value={contextOverrides}>
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
    expect(screen.queryByText('No content associated.')).not.toBeInTheDocument();
  });

  it('renders a failed state, not the empty state, when the status is error', () => {
    renderList({ status: 'error', error: new Error('boom') });
    expect(screen.getByText('There was a problem loading this competency\'s associations. Please try again.'))
      .toBeInTheDocument();
    expect(screen.queryByText('No content associated.')).not.toBeInTheDocument();
  });

  it('renders the empty state when no course group is accessible, whatever the groups index holds', () => {
    renderList({
      groupsIndex: buildCompetencyCriteriaGroupsIndex(twoCoursesResponse),
      accessibleCourseGroups: [],
    });
    expect(screen.getByText('No content associated.')).toBeInTheDocument();
    expect(screen.getByText('Make content selections to associate this competency with course content.'))
      .toBeInTheDocument();
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
    expect(screen.queryByText('No content associated.')).not.toBeInTheDocument();
  });
});
