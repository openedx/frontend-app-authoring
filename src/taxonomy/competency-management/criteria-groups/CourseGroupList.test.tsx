import { initializeMocks, render, screen } from '@src/testUtils';
import { buildMockCompetencyAssociationsContextValue, MockCompetencyAssociationsProvider } from '../__mocks__';
import type { CompetencyCriteriaGroupsResponse, CompetencyRuleProfile } from '../data/types';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
import CourseGroupList from './CourseGroupList';

const systemDefaultProfile: CompetencyRuleProfile = {
  id: 1,
  scopeType: 'system_default',
  ruleType: 'grade',
  rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
  archived: false,
};

const emptyGroupsResponse: CompetencyCriteriaGroupsResponse = { groups: [], criteria: [] };

const populatedGroupsResponse: CompetencyCriteriaGroupsResponse = {
  groups: [
    {
      id: 100,
      parentId: null,
      tagId: 42,
      courseKey: null,
      name: 'root',
      ordering: 0,
      logicOperator: 'AND',
    },
    {
      id: 1,
      parentId: 100,
      tagId: 42,
      courseKey: 'course-v1:OrgX+CS101+2024',
      name: 'course',
      ordering: 0,
      logicOperator: 'AND',
    },
  ],
  criteria: [],
};

const renderList = (contextOverrides: Parameters<typeof buildMockCompetencyAssociationsContextValue>[0] = {}) => (
  render(
    <MockCompetencyAssociationsProvider value={contextOverrides}>
      <CourseGroupList />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<CourseGroupList />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders a loading state, not the empty state, while the status is pending', () => {
    renderList({ status: 'pending' });
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('No content associated.')).not.toBeInTheDocument();
  });

  it('renders a failed state, not the empty state, when the status is error', () => {
    renderList({ status: 'error', error: new Error('boom') });
    expect(screen.getByText('There was a problem loading this competency\'s associations. Please try again.'))
      .toBeInTheDocument();
    expect(screen.queryByText('No content associated.')).not.toBeInTheDocument();
  });

  it('renders the empty state when accessibleCourseGroups is empty, not throwing', () => {
    renderList({
      groupsIndex: buildCompetencyCriteriaGroupsIndex(emptyGroupsResponse),
      systemDefaultProfile,
      accessibleCourseGroups: [],
    });
    expect(screen.getByText('No content associated.')).toBeInTheDocument();
    expect(screen.getByText('Make content selections to associate this competency with course content.'))
      .toBeInTheDocument();
  });

  it(
    'renders the empty state when every course-level group is inaccessible, even though the raw '
      + 'groups response has one - accessibleCourseGroups decides this, not the raw response\'s own count',
    () => {
      renderList({
        groupsIndex: buildCompetencyCriteriaGroupsIndex(populatedGroupsResponse),
        systemDefaultProfile,
        // The one course-level group didn't pass the outline-accessibility
        // check, so it must render identically to no associations at all.
        accessibleCourseGroups: [],
      });
      expect(screen.getByText('No content associated.')).toBeInTheDocument();
    },
  );

  it('renders course group sections for every accessible course-level group', async () => {
    const groupsIndex = buildCompetencyCriteriaGroupsIndex(populatedGroupsResponse);
    renderList({
      groupsIndex,
      systemDefaultProfile,
      accessibleCourseGroups: groupsIndex.courseGroups,
    });
    expect(screen.queryByText('No content associated.')).not.toBeInTheDocument();
    // The outline isn't mocked here, so it degrades to the raw course id via
    // its defensive fallback - enough to prove a real `CourseGroupSection`
    // was mounted.
    expect(await screen.findByText('course-v1:OrgX+CS101+2024')).toBeInTheDocument();
  });
});
