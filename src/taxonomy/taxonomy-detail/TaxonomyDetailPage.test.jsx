import React, { useMemo } from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { render } from '@testing-library/react';

import { useTaxonomyDetailData } from './data/api';
import initializeStore from '../../store';
import TaxonomyDetailPage from './TaxonomyDetailPage';
import { TaxonomyContext } from '../common/context';

let store;
const mockNavigate = jest.fn();
const mockMutate = jest.fn();
const mockSetToastMessage = jest.fn();

jest.mock('./data/api', () => ({
  useTaxonomyDetailData: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    taxonomyId: '1',
  }),
  useNavigate: () => mockNavigate,
}));
jest.mock('../data/apiHooks', () => ({
  useDeleteTaxonomy: () => mockMutate,
}));

jest.mock('./TaxonomyDetailSideCard', () => jest.fn(() => <>Mock TaxonomyDetailSideCard</>));
jest.mock('../tag-list/TagListTable', () => jest.fn(() => <>Mock TagListTable</>));

const RootWrapper = () => {
  const context = useMemo(() => ({
    toastMessage: null,
    setToastMessage: mockSetToastMessage,
  }), []);

  return (
    <AppProvider store={store}>
      <IntlProvider locale="en" messages={{}}>
        <TaxonomyContext.Provider value={context}>
          <TaxonomyDetailPage />
        </TaxonomyContext.Provider>
      </IntlProvider>
    </AppProvider>
  );
};

describe('<TaxonomyDetailPage />', async () => {
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

  it('shows the spinner before the query is complete', async () => {
    useTaxonomyDetailData.mockReturnValue({
      isFetched: false,
    });
    const { getByRole } = render(<RootWrapper />);
    const spinner = getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows the connector error component if got some error', async () => {
    useTaxonomyDetailData.mockReturnValue({
      isFetched: true,
      isError: true,
    });
    const { getByTestId } = render(<RootWrapper />);
    expect(getByTestId('connectionErrorAlert')).toBeInTheDocument();
  });

  it('should render page and page title correctly', async () => {
    useTaxonomyDetailData.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
      data: {
        id: 1,
        name: 'Test taxonomy',
        description: 'This is a description',
        systemDefined: true,
      },
    });
    const { getByRole } = render(<RootWrapper />);
    expect(getByRole('heading')).toHaveTextContent('Test taxonomy');
  });

  it('should show system defined badge', async () => {
    useTaxonomyDetailData.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
      data: {
        id: 1,
        name: 'Test taxonomy',
        description: 'This is a description',
        systemDefined: true,
      },
    });
    const { getByText } = render(<RootWrapper />);
    expect(getByText('System-level')).toBeInTheDocument();
  });

  it('should not show system defined badge', async () => {
    useTaxonomyDetailData.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
      data: {
        id: 1,
        name: 'Test taxonomy',
        description: 'This is a description',
        systemDefined: false,
      },
    });
    const { queryByText } = render(<RootWrapper />);
    expect(queryByText('System-level')).not.toBeInTheDocument();
  });
});
