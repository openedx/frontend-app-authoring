import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import type { Store } from 'redux';

import { ToastProvider } from '../../generic/toast-context';
import { type CollectionHit } from '../../search-manager';
import initializeStore from '../../store';
import CollectionCard from './CollectionCard';

let store: Store;
let axiosMock: MockAdapter;

const CollectionHitSample: CollectionHit = {
  id: '1',
  type: 'collection',
  contextKey: 'lb:org1:Demo_Course',
  org: 'org1',
  breadcrumbs: [{ displayName: 'Demo Lib' }],
  displayName: 'Collection Display Name',
  description: 'Collection description',
  formatted: {
    displayName: 'Collection Display Formated Name',
    description: 'Collection description',
  },
  created: 1722434322294,
  modified: 1722434322294,
  accessId: 1,
  tags: {},
};

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <ToastProvider>
        <CollectionCard
          collectionHit={CollectionHitSample}
        />
      </ToastProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<CollectionCard />', () => {
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
    axiosMock.restore();
  });

  it('should render the card with title and description', () => {
    const { getByText } = render(<RootWrapper />);

    expect(getByText('Collection Display Formated Name')).toBeInTheDocument();
    expect(getByText('Collection description')).toBeInTheDocument();
  });
});
