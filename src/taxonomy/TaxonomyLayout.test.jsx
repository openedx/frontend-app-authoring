import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { render } from '@testing-library/react';

import initializeStore from '../store';
import TaxonomyLayout from './TaxonomyLayout';

let store;

jest.mock('../header', () => jest.fn(() => <div data-testid="mock-header" />));
jest.mock('@edx/frontend-component-footer', () => ({
  StudioFooter: jest.fn(() => <div data-testid="mock-footer" />),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: jest.fn(() => <div data-testid="mock-content" />),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <TaxonomyLayout />
    </IntlProvider>
  </AppProvider>
);

describe('<TaxonomyLayout />', async () => {
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

  it('should render page correctly', async () => {
    const { getByTestId } = render(<RootWrapper />);
    expect(getByTestId('mock-header')).toBeInTheDocument();
    expect(getByTestId('mock-content')).toBeInTheDocument();
    expect(getByTestId('mock-footer')).toBeInTheDocument();
  });
});
