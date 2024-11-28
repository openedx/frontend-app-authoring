import type MockAdapter from 'axios-mock-adapter';
import {
  fireEvent,
  initializeMocks,
  render as baseRender,
  waitFor,
} from '../testUtils';

import { apiUrls } from './data/api';
import { TaxonomyListPage } from './TaxonomyListPage';
import { TaxonomyContext } from './common/context';

const taxonomies = [{
  id: 1,
  name: 'Taxonomy',
  description: 'This is a description',
  showSystemBadge: false,
  canChangeTaxonomy: true,
  canDeleteTaxonomy: true,
  tagsCount: 0,
}];
const organizationsListUrl = 'http://localhost:18010/organizations';
const listTaxonomiesUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/?enabled=true';
const listTaxonomiesUnassignedUrl = `${listTaxonomiesUrl}&unassigned=true`;
const listTaxonomiesOrg1Url = `${listTaxonomiesUrl}&org=Org+1`;
const listTaxonomiesOrg2Url = `${listTaxonomiesUrl}&org=Org+2`;
const organizations = ['Org 1', 'Org 2'];

const context = {
  toastMessage: null,
  setToastMessage: jest.fn(),
  alertProps: null,
  setAlertProps: jest.fn(),
};

const render = (ui: React.ReactElement) => baseRender(ui, {
  extraWrapper: ({ children }) => (
    <TaxonomyContext.Provider value={context}> { children } </TaxonomyContext.Provider>
  ),
});
let axiosMock: MockAdapter;

describe('<TaxonomyListPage />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    axiosMock.onGet(organizationsListUrl).reply(200, organizations);
  });

  it('should render page and page title correctly', () => {
    const { getByText } = render(<TaxonomyListPage />);
    expect(getByText('Taxonomies')).toBeInTheDocument();
  });

  it('shows the spinner before the query is complete', async () => {
    // Simulate an API request that times out:
    axiosMock.onGet(listTaxonomiesUrl).reply(200, new Promise(() => {}));
    const { getByRole } = render(<TaxonomyListPage />);
    const spinner = getByRole('status');
    expect(spinner.textContent).toEqual('Loading');
  });

  it('shows the data table after the query is complete', async () => {
    axiosMock.onGet(listTaxonomiesUrl).reply(200, { results: taxonomies, canAddTaxonomy: false });
    const { getByTestId, queryByText } = render(<TaxonomyListPage />);
    await waitFor(() => { expect(queryByText('Loading')).toEqual(null); });
    expect(getByTestId('taxonomy-card-1')).toBeInTheDocument();
  });

  it.each(['csv', 'json'] as const)('downloads the taxonomy template %s', async (fileFormat) => {
    axiosMock.onGet(listTaxonomiesUrl).reply(200, { results: taxonomies, canAddTaxonomy: false });
    const { findByRole, queryByText } = render(<TaxonomyListPage />);
    // Wait until data has been loaded and rendered:
    await waitFor(() => { expect(queryByText('Loading')).toEqual(null); });
    const templateMenu = await findByRole('button', { name: 'Download template' });
    fireEvent.click(templateMenu);
    const templateButton = await findByRole('link', { name: `${fileFormat.toUpperCase()} template` });
    fireEvent.click(templateButton);

    expect((templateButton as HTMLAnchorElement).href).toBe(apiUrls.taxonomyTemplate(fileFormat));
  });

  it('disables the import taxonomy button if not permitted', async () => {
    axiosMock.onGet(listTaxonomiesUrl).reply(200, { results: [], canAddTaxonomy: false });

    const { queryByText, getByRole } = render(<TaxonomyListPage />);
    // Wait until data has been loaded and rendered:
    await waitFor(() => { expect(queryByText('Loading')).toEqual(null); });
    const importButton = getByRole('button', { name: 'Import' });
    expect(importButton).toBeDisabled();
  });

  it('opens the import dialog modal when the import button is clicked', async () => {
    axiosMock.onGet(listTaxonomiesUrl).reply(200, { results: [], canAddTaxonomy: true });

    const { getByRole, getByText } = render(<TaxonomyListPage />);
    const importButton = getByRole('button', { name: 'Import' });
    // Once the API response is received and rendered, the Import button should be enabled:
    await waitFor(() => { expect(importButton).not.toBeDisabled(); });
    fireEvent.click(importButton);

    expect(getByText('Upload file')).toBeInTheDocument();
  });

  it('should show all "All taxonomies", "Unassigned" and org names in taxonomy org filter', async () => {
    axiosMock.onGet(listTaxonomiesUrl).reply(200, {
      results: [{
        id: 1,
        name: 'Taxonomy',
        description: 'This is a description',
        showSystemBadge: false,
        canChangeTaxonomy: false,
        canDeleteTaxonomy: false,
        tagsCount: 0,
      }],
      canAddTaxonomy: false,
    });

    const {
      getByTestId,
      getByText,
      getByRole,
      getAllByText,
      queryByText,
    } = render(<TaxonomyListPage />);
    // Wait until data has been loaded and rendered:
    await waitFor(() => { expect(queryByText('Loading')).toEqual(null); });

    expect(getByTestId('taxonomy-orgs-filter-selector')).toBeInTheDocument();
    // Check that the default filter is set to 'All taxonomies' when page is loaded
    expect(getByText('All taxonomies')).toBeInTheDocument();

    // Open the taxonomies org filter select menu
    fireEvent.click(getByRole('button', { name: 'All taxonomies' }));

    // Check that the select menu shows 'All taxonomies' option
    // along with the default selected one
    expect(getAllByText('All taxonomies').length).toBe(2);
    // Check that the select manu shows 'Unassigned' option
    expect(getByText('Unassigned')).toBeInTheDocument();
    // Check that the select menu shows the 'Org 1' option
    expect(getByText('Org 1')).toBeInTheDocument();
    // Check that the select menu shows the 'Org 2' option
    expect(getByText('Org 2')).toBeInTheDocument();
  });

  it('should fetch taxonomies with correct params for org filters', async () => {
    axiosMock.onGet(listTaxonomiesUrl).reply(200, { results: taxonomies, canAddTaxonomy: false });
    const defaults = {
      id: 1,
      showSystemBadge: false,
      canChangeTaxonomy: true,
      canDeleteTaxonomy: true,
      tagsCount: 0,
      description: 'Taxonomy description here',
    };
    axiosMock.onGet(listTaxonomiesUnassignedUrl).reply(200, {
      canAddTaxonomy: false,
      results: [{ name: 'Unassigned Taxonomy A', ...defaults }],
    });
    axiosMock.onGet(listTaxonomiesOrg1Url).reply(200, {
      canAddTaxonomy: false,
      results: [{ name: 'Org1 Taxonomy B', ...defaults }],
    });
    axiosMock.onGet(listTaxonomiesOrg2Url).reply(200, {
      canAddTaxonomy: false,
      results: [{ name: 'Org2 Taxonomy C', ...defaults }],
    });

    const {
      getByRole,
      getByText,
      queryByText,
      findByRole,
    } = render(<TaxonomyListPage />);

    // Open the taxonomies org filter select menu
    const taxonomiesFilterSelectMenu = await getByRole('button', { name: 'All taxonomies' });
    fireEvent.click(taxonomiesFilterSelectMenu);

    // Check that the 'Unassigned' option is correctly called
    fireEvent.click(await findByRole('link', { name: 'Unassigned' }));
    await waitFor(() => {
      expect(getByText('Unassigned Taxonomy A')).toBeInTheDocument();
    });

    // Open the taxonomies org filter select menu again
    fireEvent.click(taxonomiesFilterSelectMenu);

    // Check that the 'Org 1' option is correctly called
    fireEvent.click(getByRole('link', { name: 'Org 1' }));
    await waitFor(() => {
      expect(getByText('Org1 Taxonomy B')).toBeInTheDocument();
    });

    // Open the taxonomies org filter select menu again
    fireEvent.click(taxonomiesFilterSelectMenu);

    // Check that the 'Org 2' option is correctly called
    fireEvent.click(getByRole('link', { name: 'Org 2' }));
    await waitFor(() => {
      expect(queryByText('Org1 Taxonomy B')).not.toBeInTheDocument();
      expect(queryByText('Org2 Taxonomy C')).toBeInTheDocument();
    });

    // Open the taxonomies org filter select menu again
    fireEvent.click(taxonomiesFilterSelectMenu);

    // Check that the 'All' option is correctly called, it should show as
    // 'All' rather than 'All taxonomies' in the select menu since its not selected
    fireEvent.click(getByRole('link', { name: 'All' }));
    await waitFor(() => {
      expect(getByText(taxonomies[0].description)).toBeInTheDocument();
    });
  });
});
