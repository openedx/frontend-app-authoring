import { initializeMocks, render, screen } from '@src/testUtils';
import { CompetencyAssociationsProvider } from '../CompetencyAssociationsContext';
import { apiUrls } from '../data/api';
import CriteriaAssociationsSection from './CriteriaAssociationsSection';

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

const tagId = 42;
const competencyName = 'Data Literacy';

const renderSection = () => (
  render(
    <CompetencyAssociationsProvider tagId={tagId} competencyExternalId="CCRS-1.3">
      <CriteriaAssociationsSection competencyName={competencyName} />
    </CompetencyAssociationsProvider>,
  )
);

describe('<CriteriaAssociationsSection />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('renders the associations header and the "Demonstrate Mastery For" line for the given competency', () => {
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(() => new Promise(() => {}));
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(() => new Promise(() => {}));
    renderSection();

    expect(screen.getByText('Competency Criteria Associations')).toBeInTheDocument();
    expect(screen.getByText('Demonstrate Mastery For Data Literacy')).toBeInTheDocument();
  });

  it('renders the empty-associations state once both queries resolve with no groups', async () => {
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, { groups: [], criteria: [] });
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, {
      id: 1,
      rule_type: 'grade',
      rule_payload: { op: 'gte', value: 0.7, scale: 'percent' },
    });
    renderSection();

    expect(await screen.findByText('No content associated.')).toBeInTheDocument();
  });

  it('renders a failed state when the groups request fails', async () => {
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(500);
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, {
      id: 1,
      rule_type: 'grade',
      rule_payload: { op: 'gte', value: 0.7, scale: 'percent' },
    });
    renderSection();

    expect(await screen.findByText('There was a problem loading this competency\'s associations. Please try again.'))
      .toBeInTheDocument();
  });
});
