import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import type { Store } from 'redux';

import { ToastProvider } from '../../generic/toast-context';
import { getClipboardUrl } from '../../generic/data/api';
import { ContentHit } from '../../search-manager';
import initializeStore from '../../store';
import ComponentCard from './ComponentCard';

let store: Store;
let axiosMock: MockAdapter;

const contentHit: ContentHit = {
  id: '1',
  usageKey: 'lb:org1:demolib:html:a1fa8bdd-dc67-4976-9bf5-0ea75a9bca3d',
  type: 'library_block',
  blockId: 'a1fa8bdd-dc67-4976-9bf5-0ea75a9bca3d',
  contextKey: 'lb:org1:Demo_Course',
  org: 'org1',
  breadcrumbs: [{ displayName: 'Demo Lib' }],
  displayName: 'Text Display Name',
  formatted: {
    displayName: 'Text Display Formated Name',
    content: {
      htmlContent: 'This is a text: ID=1',
    },
  },
  tags: {
    level0: ['1', '2', '3'],
  },
  blockType: 'text',
  created: 1722434322294,
  modified: 1722434322294,
  lastPublished: null,
};

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <ToastProvider>
        <ComponentCard
          contentHit={contentHit}
          blockTypeDisplayName="text"
        />
      </ToastProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<ComponentCard />', () => {
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

    expect(getByText('Text Display Formated Name')).toBeInTheDocument();
    expect(getByText('This is a text: ID=1')).toBeInTheDocument();
  });

  it('should call the updateClipboard function when the copy button is clicked', async () => {
    axiosMock.onPost(getClipboardUrl()).reply(200, {});
    const { getByRole, getByTestId, getByText } = render(<RootWrapper />);

    // Open menu
    expect(getByTestId('component-card-menu-toggle')).toBeInTheDocument();
    fireEvent.click(getByTestId('component-card-menu-toggle'));

    // Click copy to clipboard
    expect(getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
    fireEvent.click(getByRole('button', { name: 'Copy to clipboard' }));

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(
      JSON.stringify({ usage_key: contentHit.usageKey }),
    );

    await waitFor(() => {
      expect(getByText('Component copied to clipboard')).toBeInTheDocument();
    });
  });

  it('should show error message if the api call fails', async () => {
    axiosMock.onPost(getClipboardUrl()).reply(400);
    const { getByRole, getByTestId, getByText } = render(<RootWrapper />);

    // Open menu
    expect(getByTestId('component-card-menu-toggle')).toBeInTheDocument();
    fireEvent.click(getByTestId('component-card-menu-toggle'));

    // Click copy to clipboard
    expect(getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
    fireEvent.click(getByRole('button', { name: 'Copy to clipboard' }));

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(
      JSON.stringify({ usage_key: contentHit.usageKey }),
    );

    await waitFor(() => {
      expect(getByText('Failed to copy component to clipboard')).toBeInTheDocument();
    });
  });
});
