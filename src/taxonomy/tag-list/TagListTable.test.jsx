import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { render } from '@testing-library/react';

import { useTagListData } from './data/api';
import initializeStore from '../../store';
import TagListTable from './TagListTable';

let store;

jest.mock('./data/api', () => ({
  useTagListData: jest.fn(),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <TagListTable taxonomyId="1" />
    </IntlProvider>
  </AppProvider>
);

describe('<TagListPage />', async () => {
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
    useTagListData.mockReturnValue({
      isLoading: true,
      isFetched: false,
    });
    const { getByRole } = render(<RootWrapper />);
    const spinner = getByRole('status');
    expect(spinner.textContent).toEqual('loading');
  });

  it('should render page correctly', async () => {
    useTagListData.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
      data: {
        count: 3,
        numPages: 1,
        results: [
          { value: 'Tag 1' },
          { value: 'Tag 2' },
          { value: 'Tag 3' },
        ],
      },
    });
    const { getAllByRole } = render(<RootWrapper />);
    const rows = getAllByRole('row');
    expect(rows.length).toBe(3 + 1); // 3 items plus header
  });
});
