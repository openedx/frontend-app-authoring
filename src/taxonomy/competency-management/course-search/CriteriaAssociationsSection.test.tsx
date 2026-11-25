import {
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '@src/testUtils';
import { buildCourseListResponse, byTextContent, courseListUrl, defaultProfileResponse } from '../__mocks__';
import { CompetencyAssociationsProvider, useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { CompetencyTreeNode } from '../CompetencyTree';
import { apiUrls } from '../data/api';
import CriteriaAssociationsSection from './CriteriaAssociationsSection';

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

const tagId = 42;
const competency: CompetencyTreeNode = { id: String(tagId), value: 'Data Literacy', externalId: null };

/** Shows when the profile query has landed, so a test can tell the course list or groups query alone is holding the list back. */
const ProfileLoadedProbe = () => {
  const { systemDefaultProfile } = useCompetencyAssociations();
  return systemDefaultProfile ? <span>profile loaded</span> : null;
};

const renderSection = () => (
  render(
    <CompetencyAssociationsProvider tagId={tagId} competencyName={competency.value} competencyExternalId="CCRS-1.3">
      <ProfileLoadedProbe />
      <CriteriaAssociationsSection competency={competency} />
    </CompetencyAssociationsProvider>,
  )
);

const noGroupsResponse = { groups: [], criteria: [], criteria_count: 0, total_criteria_count: 0 };

describe('<CriteriaAssociationsSection />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock.onGet(courseListUrl()).reply(200, buildCourseListResponse([]));
  });

  it('renders the associations header and the "Demonstrate Mastery For" line for the given competency', () => {
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(() => new Promise(() => {}));
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(() => new Promise(() => {}));
    renderSection();

    expect(screen.getByText('Competency Criteria Associations')).toBeInTheDocument();
    const masteryLine = screen.getByText(
      (_, element) =>
        element?.classList.contains('course-search-browse__associations-mastery') === true
        && element.textContent === 'Demonstrate Mastery For Data Literacy',
    );
    expect(within(masteryLine).getByText('Data Literacy')).toBeInTheDocument();
  });

  it('renders the empty-associations state once both queries resolve with no groups', async () => {
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, noGroupsResponse);
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, defaultProfileResponse);
    renderSection();

    expect(await screen.findByText(byTextContent('No content associated with Data Literacy yet.'))).toBeInTheDocument();
  });

  it('keeps loading, sends no groups request, and shows no empty state until the course list has loaded', async () => {
    axiosMock.onGet(courseListUrl()).reply(() => new Promise(() => {}));
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, noGroupsResponse);
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, defaultProfileResponse);
    renderSection();

    // Only the unlisted courses hold the list back once the profile has landed.
    expect(await screen.findByText('profile loaded')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(byTextContent('No content associated with Data Literacy yet.'))).not.toBeInTheDocument();
    expect(axiosMock.history.get.filter((req) => req.url === apiUrls.competencyCriteriaGroups(tagId))).toHaveLength(0);
  });

  it('shows only the header lines, and no spinner, once the course list has failed', async () => {
    axiosMock.onGet(courseListUrl()).reply(500);
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, noGroupsResponse);
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, defaultProfileResponse);
    renderSection();

    expect(await screen.findByText('profile loaded')).toBeInTheDocument();
    await waitFor(() => {
      expect(axiosMock.history.get.some((req) => req.url === courseListUrl())).toBe(true);
    });
    expect(screen.getByText('Data Literacy', { selector: '.font-weight-bold' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(byTextContent('No content associated with Data Literacy yet.'))).not.toBeInTheDocument();
    expect(axiosMock.history.get.filter((req) => req.url === apiUrls.competencyCriteriaGroups(tagId))).toHaveLength(0);
  });

  it('renders a failed state when the groups request fails', async () => {
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(500);
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, defaultProfileResponse);
    renderSection();

    expect(await screen.findByText('There was a problem loading this competency\'s associations. Please try again.'))
      .toBeInTheDocument();
  });
});
