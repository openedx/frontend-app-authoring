import { initializeMocks, render, type RouteOptions } from '@src/testUtils';
import { apiUrls } from '../data/api';
import { CompetencyManagementPage } from '.';

const taxonomyId = 1;

const route: RouteOptions = {
  path: '/taxonomy/:taxonomyId/competencies',
  params: { taxonomyId: `${taxonomyId}` },
};

const taxonomyResponse = {
  id: taxonomyId,
  name: 'Test taxonomy',
  description: 'This is a description',
  taxonomy_type: 'competency',
  read_only: false,
  can_change_taxonomy: true,
  can_delete_taxonomy: true,
};

describe('<CompetencyManagementPage />', () => {
  let axiosMock;

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('shows the spinner before the query is complete', () => {
    // Use an unresolved promise to keep the Loading visible
    axiosMock.onGet(apiUrls.taxonomy(taxonomyId)).reply(() => new Promise(() => {}));

    const { getByRole } = render(<CompetencyManagementPage />, route);

    expect(getByRole('status').textContent).toEqual('Loading...');
  });

  it('shows the connection error component if no taxonomy is returned', async () => {
    // Use an empty response to trigger the error. Returning an error does not
    // work because the query will retry.
    axiosMock.onGet(apiUrls.taxonomy(taxonomyId)).reply(200);

    const { findByTestId } = render(<CompetencyManagementPage />, route);

    expect(await findByTestId('connectionErrorAlert')).toBeInTheDocument();
  });

  it('shows the taxonomy name as the title, under a breadcrumb back to the list', async () => {
    axiosMock.onGet(apiUrls.taxonomy(taxonomyId)).reply(200, taxonomyResponse);

    const { findByRole, getByRole, queryByRole } = render(<CompetencyManagementPage />, route);

    expect(await findByRole('heading')).toHaveTextContent('Test taxonomy');
    expect(getByRole('link', { name: 'Taxonomies' })).toHaveAttribute('href', '/taxonomies/');
    // The taxonomy name is the breadcrumb's active step, so it is text rather than a link
    expect(queryByRole('link', { name: 'Test taxonomy' })).not.toBeInTheDocument();
  });
});
