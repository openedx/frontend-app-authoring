import React from 'react';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { Store } from 'redux';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../store';
import SearchModal from './SearchModal';
import { getContentSearchConfigUrl } from '../search-manager/data/api';

let store: Store;
let axiosMock: MockAdapter;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <SearchModal courseId="" isOpen onClose={() => undefined} />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<SearchModal />', () => {
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should render the search ui if the config is loaded', async () => {
    axiosMock.onGet(getContentSearchConfigUrl()).replyOnce(200, {
      url: 'https://meilisearch.example.com',
      index: 'test-index',
      apiKey: 'test-api-key',
    });
    const { findByText } = render(<RootWrapper />);
    expect(await findByText('Start searching to find content')).toBeInTheDocument();
  });

  it('should render the error message if the api call throws', async () => {
    axiosMock.onGet(getContentSearchConfigUrl()).networkError();
    const { findByText } = render(<RootWrapper />);
    expect(await findByText('An error occurred. Unable to load search results.')).toBeInTheDocument();
  });
});
