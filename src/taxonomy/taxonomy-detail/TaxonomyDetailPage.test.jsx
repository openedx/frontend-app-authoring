import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { fireEvent, render } from '@testing-library/react';

import { useTaxonomyDetailData } from './data/api';
import initializeStore from '../../store';
import TaxonomyDetailPage from './TaxonomyDetailPage';

let store;

jest.mock('./data/api', () => ({
  useTaxonomyDetailData: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    taxonomyId: '1',
  }),
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
        systemDefined: false,
      },
    });
    const { getByRole } = render(<RootWrapper />);
    expect(getByRole('heading')).toHaveTextContent('Test taxonomy');
  });

  it('should open export modal on export menu click', () => {
    useTaxonomyDetailData.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
      data: {
        id: 1,
        name: 'Test taxonomy',
        description: 'This is a description',
      },
    });

    const { getByRole, getByText } = render(<RootWrapper />);

    // Modal closed
    expect(() => getByText('Select format to export')).toThrow();

    // Click on export menu
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByText('Export'));

    // Modal opened
    expect(getByText('Select format to export')).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(() => getByText('Select format to export')).toThrow();
  });
});
