/* istanbul ignore file */
/* eslint-disable react/require-default-props */
/* eslint-disable react/prop-types */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * Helper functions for writing tests.
 */
import React from 'react';
import { AxiosError } from 'axios';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import initializeReduxStore from './store';

/** @deprecated */
let reduxStore;
let queryClient;
let axiosMock: MockAdapter;

export interface RouteOptions {
  /** The URL path, like '/libraries/:libraryId' */
  path?: string;
  /** The URL parameters, like {libraryId: 'lib:org:123'} */
  params?: Record<string, string>;
}

const RouterAndRoute: React.FC<RouteOptions> = ({ children, path = '/', params = {} }) => {
  if (Object.entries(params).length > 0 || path !== '/') {
    // Substitute the params into the URL so '/library/:libraryId' becomes '/library/lib:org:123'
    let pathWithParams = path;
    for (const [key, value] of Object.entries(params)) {
      pathWithParams = pathWithParams.replaceAll(`:${key}`, value);
    }
    if (pathWithParams.endsWith('/*')) {
      // Some routes (that contain child routes) need to end with /* in the <Route> but not in the router
      pathWithParams = pathWithParams.substring(0, pathWithParams.length - 1);
    }
    return (
      <MemoryRouter initialEntries={[pathWithParams]}>
        <Routes>
          <Route path={path} element={children} />
        </Routes>
      </MemoryRouter>
    );
  }
  return (
    <MemoryRouter>{children}</MemoryRouter>
  );
};

function makeWrapper({ ...routeArgs }: RouteOptions) {
  const AllTheProviders = ({ children }) => (
    <AppProvider store={reduxStore} wrapWithRouter={false}>
      <IntlProvider locale="en" messages={{}}>
        <QueryClientProvider client={queryClient}>
          <RouterAndRoute {...routeArgs}>
            {children}
          </RouterAndRoute>
        </QueryClientProvider>
      </IntlProvider>
    </AppProvider>
  );
  return AllTheProviders;
}

/**
 * Same as render() from `@testing-library/react` but this one provides all the
 * wrappers our React components need to render properly.
 */
function customRender(ui: React.ReactElement, options: RouteOptions = {}): RenderResult {
  return render(ui, { wrapper: makeWrapper(options) });
}

const defaultUser = {
  userId: 3,
  username: 'abc123',
  administrator: true,
  roles: [],
};

export function initializeMocks({ user = defaultUser } = {}) {
  initializeMockApp({
    authenticatedUser: user,
  });
  reduxStore = initializeReduxStore();
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  axiosMock = new MockAdapter(getAuthenticatedHttpClient());

  return {
    reduxStore,
    axiosMock,
  };
}

export * from '@testing-library/react';
export { customRender as render };

/** Simulate a real Axios error (such as we'd see in response to a 404) */
export function createAxiosError({ code, message, path }: { code: number, message: string, path: string }) {
  const request = { path };
  const config = {};
  const error = new AxiosError(
    `Mocked request failed with status code ${code}`,
    AxiosError.ERR_BAD_RESPONSE,
    config,
    request,
    {
      status: code,
      data: { detail: message },
      statusText: 'error',
      config,
      headers: {},
    },
  );
  return error;
}
