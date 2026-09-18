import type { UseQueryResult } from '@tanstack/react-query';
import { initializeMocks, render, screen } from '@src/testUtils';
import { buildMockCompetencyAssociationsContextValue, MockCompetencyAssociationsProvider } from '../testHelpers';
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
      id: 1,
      parentId: null,
      depth: 1,
      ordering: 0,
      logicOperator: 'and',
      courseKey: 'course-v1:OrgX+CS101+2024',
    },
  ],
  criteria: [],
};

const buildQueryResult = <T,>(overrides: Partial<UseQueryResult<T>>): UseQueryResult<T> => ({
  isLoading: false,
  isError: false,
  data: undefined,
  ...overrides,
} as UseQueryResult<T>);

const loadingGroupsQuery = buildQueryResult<CompetencyCriteriaGroupsResponse>({ isLoading: true });
const loadedEmptyGroupsQuery = buildQueryResult<CompetencyCriteriaGroupsResponse>({ data: emptyGroupsResponse });
const loadedPopulatedGroupsQuery = buildQueryResult<CompetencyCriteriaGroupsResponse>({
  data: populatedGroupsResponse,
});
const erroredGroupsQuery = buildQueryResult<CompetencyCriteriaGroupsResponse>({ isError: true });

const loadingProfileQuery = buildQueryResult<CompetencyRuleProfile>({ isLoading: true });
const loadedProfileQuery = buildQueryResult<CompetencyRuleProfile>({ data: systemDefaultProfile });
const erroredProfileQuery = buildQueryResult<CompetencyRuleProfile>({ isError: true });

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

  it('renders a loading state while the groups query is still loading', () => {
    renderList({ groupsQuery: loadingGroupsQuery, profileQuery: loadedProfileQuery });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders a loading state while the default-rule-profile query is still loading, even if groups already loaded', () => {
    renderList({ groupsQuery: loadedEmptyGroupsQuery, profileQuery: loadingProfileQuery });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders a failed state when the groups query errors', () => {
    renderList({ groupsQuery: erroredGroupsQuery, profileQuery: loadedProfileQuery });
    expect(screen.getByText('There was a problem loading this competency\'s associations. Please try again.'))
      .toBeInTheDocument();
  });

  it('renders a failed state when the default-rule-profile query errors, even if groups already loaded', () => {
    renderList({
      groupsQuery: loadedEmptyGroupsQuery,
      profileQuery: erroredProfileQuery,
      index: buildCompetencyCriteriaGroupsIndex(emptyGroupsResponse),
    });
    expect(screen.getByText('There was a problem loading this competency\'s associations. Please try again.'))
      .toBeInTheDocument();
  });

  it('renders the empty state when accessibleCourseGroups is empty, not throwing', () => {
    renderList({
      groupsQuery: loadedEmptyGroupsQuery,
      profileQuery: loadedProfileQuery,
      index: buildCompetencyCriteriaGroupsIndex(emptyGroupsResponse),
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
        groupsQuery: loadedPopulatedGroupsQuery,
        profileQuery: loadedProfileQuery,
        index: buildCompetencyCriteriaGroupsIndex(populatedGroupsResponse),
        systemDefaultProfile,
        // The one course-level group in `populatedGroupsResponse` didn't
        // pass `CompetencyAssociationsContext`'s own outline-accessibility
        // check (see that context's own tests for how it's computed) - so
        // it must render identically to "no associations at all", per the
        // ticket's own "a competency whose associations are all in courses
        // I cannot see" acceptance criterion.
        accessibleCourseGroups: [],
      });
      expect(screen.getByText('No content associated.')).toBeInTheDocument();
    },
  );

  it('renders course group sections for every accessible course-level group', async () => {
    const index = buildCompetencyCriteriaGroupsIndex(populatedGroupsResponse);
    renderList({
      groupsQuery: loadedPopulatedGroupsQuery,
      profileQuery: loadedProfileQuery,
      index,
      systemDefaultProfile,
      accessibleCourseGroups: index.courseGroups,
    });
    expect(screen.queryByText('No content associated.')).not.toBeInTheDocument();
    // The course's outline isn't mocked here (out of scope for this
    // component's own tests - see `CourseGroupSection.test.tsx`), so its
    // own outline fetch fails and it degrades to the raw course id via its
    // own defensive fallback - this alone is enough to prove a real
    // `CourseGroupSection` was mounted for the one accessible course group.
    expect(await screen.findByText('course-v1:OrgX+CS101+2024')).toBeInTheDocument();
  });
});
