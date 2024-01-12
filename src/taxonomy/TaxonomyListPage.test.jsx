import React from 'react';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../store';
import { getTaxonomyTemplateApiUrl } from './data/api';
import TaxonomyListPage from './TaxonomyListPage';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from './data/apiHooks';
import { importTaxonomy } from './import-tags';
import { TaxonomyContext } from './common/context';

let store;
let axiosMock;

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
const organizations = ['Org 1', 'Org 2'];

jest.mock('./data/apiHooks', () => ({
  ...jest.requireActual('./data/apiHooks'),
  useTaxonomyListDataResponse: jest.fn(),
  useIsTaxonomyListDataLoaded: jest.fn(),
}));

jest.mock('./import-tags', () => ({
  importTaxonomy: jest.fn(),
}));

const context = {
  toastMessage: null,
  setToastMessage: jest.fn(),
};

const queryClient = new QueryClient();

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <TaxonomyContext.Provider value={context}>
          <TaxonomyListPage intl={injectIntl} />
        </TaxonomyContext.Provider>
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<TaxonomyListPage />', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(organizationsListUrl).reply(200, organizations);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render page and page title correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText('Taxonomies')).toBeInTheDocument();
  });

  it('shows the spinner before the query is complete', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(false);
    await act(async () => {
      const { getByRole } = render(<RootWrapper />);
      const spinner = getByRole('status');
      expect(spinner.textContent).toEqual('Loading');
    });
  });

  it('shows the data table after the query is complete', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
      results: taxonomies,
      canAddTaxonomy: false,
    });
    await act(async () => {
      const { getByTestId } = render(<RootWrapper />);
      expect(getByTestId('taxonomy-card-1')).toBeInTheDocument();
    });
  });

  it.each(['CSV', 'JSON'])('downloads the taxonomy template %s', async (fileFormat) => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
      results: taxonomies,
      canAddTaxonomy: false,
    });
    const { findByRole } = render(<RootWrapper />);
    const templateMenu = await findByRole('button', { name: 'Download template' });
    fireEvent.click(templateMenu);
    const templateButton = await findByRole('link', { name: `${fileFormat} template` });
    fireEvent.click(templateButton);

    expect(templateButton.href).toBe(getTaxonomyTemplateApiUrl(fileFormat.toLowerCase()));
  });

  it('disables the import taxonomy button if not permitted', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
      results: [],
      canAddTaxonomy: false,
    });

    const { getByRole } = render(<RootWrapper />);
    const importButton = getByRole('button', { name: 'Import' });
    expect(importButton).toBeDisabled();
  });

  it('calls the import taxonomy action when the import button is clicked', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
      results: [],
      canAddTaxonomy: true,
    });

    const { getByRole } = render(<RootWrapper />);
    const importButton = getByRole('button', { name: 'Import' });
    expect(importButton).not.toBeDisabled();
    fireEvent.click(importButton);
    expect(importTaxonomy).toHaveBeenCalled();
  });

  it('should show all "All taxonomies", "Unassigned" and org names in taxonomy org filter', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
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
    } = render(<RootWrapper />);

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
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
      results: taxonomies,
      canAddTaxonomy: false,
    });

    const { getByRole } = render(<RootWrapper />);

    // Open the taxonomies org filter select menu
    const taxonomiesFilterSelectMenu = await getByRole('button', { name: 'All taxonomies' });
    fireEvent.click(taxonomiesFilterSelectMenu);

    // Check that the 'Unassigned' option is correctly called
    fireEvent.click(getByRole('link', { name: 'Unassigned' }));

    expect(useTaxonomyListDataResponse).toBeCalledWith('Unassigned');

    // Open the taxonomies org filter select menu again
    fireEvent.click(taxonomiesFilterSelectMenu);

    // Check that the 'Org 1' option is correctly called
    fireEvent.click(getByRole('link', { name: 'Org 1' }));
    expect(useTaxonomyListDataResponse).toBeCalledWith('Org 1');

    // Open the taxonomies org filter select menu again
    fireEvent.click(taxonomiesFilterSelectMenu);

    // Check that the 'Org 2' option is correctly called
    fireEvent.click(getByRole('link', { name: 'Org 2' }));
    expect(useTaxonomyListDataResponse).toBeCalledWith('Org 2');

    // Open the taxonomies org filter select menu again
    fireEvent.click(taxonomiesFilterSelectMenu);

    // Check that the 'All' option is correctly called, it should show as
    // 'All' rather than 'All taxonomies' in the select menu since its not selected
    fireEvent.click(getByRole('link', { name: 'All' }));
    expect(useTaxonomyListDataResponse).toBeCalledWith('All taxonomies');
  });
});
