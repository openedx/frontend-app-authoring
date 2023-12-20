import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { render } from '@testing-library/react';

import { useTaxonomyDetailDataResponse, useTaxonomyDetailDataStatus } from '../data/apiHooks';
import initializeStore from '../../store';
import TaxonomyDetailPage from './TaxonomyDetailPage';

let store;
const mockNavigate = jest.fn();
const mockMutate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    taxonomyId: '1',
  }),
  useNavigate: () => mockNavigate,
}));
jest.mock('../data/apiHooks', () => ({
  ...jest.requireActual('../data/apiHooks'),
  useDeleteTaxonomy: () => mockMutate,
  useTaxonomyDetailDataResponse: jest.fn(),
  useTaxonomyDetailDataStatus: jest.fn(),
}));

jest.mock('./TaxonomyDetailSideCard', () => jest.fn(() => <>Mock TaxonomyDetailSideCard</>));
jest.mock('../tag-list/TagListTable', () => jest.fn(() => <>Mock TagListTable</>));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <TaxonomyDetailPage />
    </IntlProvider>
  </AppProvider>
);

describe('<TaxonomyDetailPage />', () => {
  beforeEach(() => {
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

  it('shows the spinner before the query is complete', () => {
    useTaxonomyDetailDataStatus.mockReturnValue({
      isFetched: false,
    });
    const { getByRole } = render(<RootWrapper />);
    const spinner = getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows the connector error component if got some error', async () => {
    useTaxonomyDetailDataStatus.mockReturnValue({
      isFetched: true,
      isError: true,
    });
    const { getByTestId } = render(<RootWrapper />);

    expect(getByTestId('connectionErrorAlert')).toBeInTheDocument();
  });

  it('should render page and page title correctly', () => {
    useTaxonomyDetailDataStatus.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
    });
    useTaxonomyDetailDataResponse.mockReturnValue({
      id: 1,
      name: 'Test taxonomy',
      description: 'This is a description',
    });
    const { getByRole } = render(<RootWrapper />);
    expect(getByRole('heading')).toHaveTextContent('Test taxonomy');
  });

  it('should show system defined badge', async () => {
    useTaxonomyDetailDataStatus.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
    });
    useTaxonomyDetailDataResponse.mockReturnValue({
      id: 1,
      name: 'Test taxonomy',
      description: 'This is a description',
      systemDefined: true,
    });
    const { getByText } = render(<RootWrapper />);
    expect(getByText('System-level')).toBeInTheDocument();
  });
});
