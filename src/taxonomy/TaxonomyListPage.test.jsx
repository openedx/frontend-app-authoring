import React from 'react';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react';

import initializeStore from '../store';
import { getTaxonomyTemplateApiUrl } from './data/api';
import TaxonomyListPage from './TaxonomyListPage';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from './data/apiHooks';
import { importTaxonomy } from './import-tags';
import { TaxonomyContext } from './common/context';

let store;

const taxonomies = [{
  id: 1,
  name: 'Taxonomy',
  description: 'This is a description',
}];

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

describe('<TaxonomyListPage />', async () => {
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
    });
    await act(async () => {
      const { getByTestId } = render(<RootWrapper />);
      expect(getByTestId('taxonomy-card-1')).toBeInTheDocument();
    });
  });

  it.each(['CSV', 'JSON'])('downloads the taxonomy template %s', async (fileFormat) => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
      results: [{
        id: 1,
        name: 'Taxonomy',
        description: 'This is a description',
      }],
    });
    const { findByRole } = render(<RootWrapper />);
    const templateMenu = await findByRole('button', { name: 'Download template' });
    fireEvent.click(templateMenu);
    const templateButton = await findByRole('link', { name: `${fileFormat} template` });
    fireEvent.click(templateButton);

    expect(templateButton.href).toBe(getTaxonomyTemplateApiUrl(fileFormat.toLowerCase()));
  });

  it('calls the import taxonomy action when the import button is clicked', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
      results: [{
        id: 1,
        name: 'Taxonomy',
        description: 'This is a description',
      }],
    });
    await act(async () => {
      const { getByTestId } = render(<RootWrapper />);
      const importButton = getByTestId('taxonomy-import-button');
      expect(importButton).toBeInTheDocument();
      importButton.click();
      expect(importTaxonomy).toHaveBeenCalled();
    });
  });
});
