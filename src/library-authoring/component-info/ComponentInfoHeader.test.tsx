/* eslint-disable react/require-default-props */
import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import { ContentLibrary, getXBlockFieldsApiUrl } from '../data/api';
import initializeStore from '../../store';
import { ToastProvider } from '../../generic/toast-context';
import ComponentInfoHeader from './ComponentInfoHeader';

let store;
let axiosMock;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const libraryData: ContentLibrary = {
  id: 'lib:org1:lib1',
  type: 'complex',
  org: 'org1',
  slug: 'lib1',
  title: 'lib1',
  description: 'lib1',
  numBlocks: 2,
  version: 0,
  lastPublished: null,
  lastDraftCreated: '2024-07-22',
  publishedBy: 'staff',
  lastDraftCreatedBy: 'staff',
  allowLti: false,
  allowPublicLearning: false,
  allowPublicRead: false,
  hasUnpublishedChanges: true,
  hasUnpublishedDeletes: false,
  canEditLibrary: true,
  license: '',
  created: '2024-06-26',
  updated: '2024-07-20',
};

interface WrapperProps {
  library?: ContentLibrary,
}

const usageKey = 'lb:org1:library:html:a1fa8bdd-dc67-4976-9bf5-0ea75a9bca3d';
const xBlockFields = {
  display_name: 'Test HTML Block',
  metadata: {
    display_name: 'Test HTML Block',
  },
};

const RootWrapper = ({ library } : WrapperProps) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ComponentInfoHeader library={library || libraryData} usageKey={usageKey} />
        </ToastProvider>
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<ComponentInfoHeader />', () => {
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
    axiosMock.onGet(getXBlockFieldsApiUrl(usageKey)).reply(200, xBlockFields);
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
  });

  it('should render component info Header', async () => {
    render(<RootWrapper />);

    expect(await screen.findByText('Test HTML Block')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit component name/i })).toBeInTheDocument();
  });

  it('should not render edit title button without permission', () => {
    const library = {
      ...libraryData,
      canEditLibrary: false,
    };

    render(<RootWrapper library={library} />);

    expect(screen.queryByRole('button', { name: /edit component name/i })).not.toBeInTheDocument();
  });

  it('should edit component title', async () => {
    const url = getXBlockFieldsApiUrl(usageKey);
    axiosMock.onPost(url).reply(200);
    render(<RootWrapper />);

    fireEvent.click(screen.getByRole('button', { name: /edit component name/i }));

    const textBox = screen.getByRole('textbox', { name: /display name input/i });

    fireEvent.change(textBox, { target: { value: 'New component name' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(textBox).not.toBeInTheDocument();

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
      expect(axiosMock.history.post[0].url).toEqual(url);
      expect(axiosMock.history.post[0].data).toStrictEqual(JSON.stringify({
        metadata: { display_name: 'New component name' },
      }));
      expect(screen.getByText('Component updated successfully.')).toBeInTheDocument();
    });
  });

  it('should close edit library title on press Escape', async () => {
    const url = getXBlockFieldsApiUrl(usageKey);
    axiosMock.onPost(url).reply(200);
    render(<RootWrapper />);

    fireEvent.click(screen.getByRole('button', { name: /edit component name/i }));

    const textBox = screen.getByRole('textbox', { name: /display name input/i });

    fireEvent.change(textBox, { target: { value: 'New component name' } });
    fireEvent.keyDown(textBox, { key: 'Escape', code: 'Escape', charCode: 27 });

    expect(textBox).not.toBeInTheDocument();

    await waitFor(() => expect(axiosMock.history.post.length).toEqual(0));
  });

  it('should show error on edit library tittle', async () => {
    const url = getXBlockFieldsApiUrl(usageKey);
    axiosMock.onPatch(url).reply(500);

    render(<RootWrapper />);

    fireEvent.click(screen.getByRole('button', { name: /edit component name/i }));

    const textBox = screen.getByRole('textbox', { name: /display name input/i });

    fireEvent.change(textBox, { target: { value: 'New component name' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
      expect(axiosMock.history.post[0].url).toEqual(url);
      expect(axiosMock.history.post[0].data).toStrictEqual(JSON.stringify({
        metadata: { display_name: 'New component name' },
      }));

      expect(screen.getByText('There was an error updating the component.')).toBeInTheDocument();
    });
  });
});
