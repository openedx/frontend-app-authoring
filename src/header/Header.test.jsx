import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getConfig, setConfig, initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppContext, AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { Context as ResponsiveContext } from 'react-responsive';

import initializeStore from '../store';
import Header from './Header';

const mockPathname = '/foo-bar';
let axiosMock;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

beforeEach(() => {
  initializeMockApp({
    authenticatedUser: {
      userId: 3,
      username: 'abc123',
      administrator: true,
      roles: [],
    },
  });
  axiosMock = new MockAdapter(getAuthenticatedHttpClient());
});

const authenticatedUser = {
  userId: 3,
  username: 'abc123',
  administrator: true,
  roles: [],
  avatar: '/imges/test.png',
};

const appContextValue = {
  authenticatedUser,
  config: {
    LOGOUT_URL: process.env.LOGOUT_URL,
    LOGO_URL: process.env.LOGO_URL,
    SITE_NAME: process.env.SITE_NAME,
    STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
    LOGIN_URL: process.env.LOGIN_URL,
  },
};

const queryClient = new QueryClient();

const RootWrapper = () => (
  <AppProvider store={initializeStore()}>
    <AppContext.Provider value={appContextValue}>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en">
          <ResponsiveContext.Provider value={{ width: 780 }}>
            <Header />
          </ResponsiveContext.Provider>
        </IntlProvider>
      </QueryClientProvider>
    </AppContext.Provider>
  </AppProvider>
);

describe('<Header />', () => {
  test('if search flag enabled, show search button and open search modal when button clicked', async () => {
    setConfig({
      ...getConfig(),
      MEILISEARCH_ENABLED: 'true',
    });

    const { getByRole } = render(<RootWrapper />);
    screen.logTestingPlaygroundURL();
    await waitFor(() => {
      expect(getByRole('button', { name: 'Search content' })).toBeInTheDocument();
    });
    fireEvent.click(getByRole('button', { name: 'Search content' }));
  });

  test('doesnt show search button if flag disabled', async () => {
    setConfig({
      ...getConfig(),
      MEILISEARCH_ENABLED: 'false',
    });

    const { queryByRole } = render(<RootWrapper />);
    expect(queryByRole('button', { name: 'Search content' })).not.toBeInTheDocument();
  });
});
