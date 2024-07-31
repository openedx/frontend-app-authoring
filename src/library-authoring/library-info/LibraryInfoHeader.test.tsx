import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { convertToDateFromString } from '../../utils';
import { ContentLibrary, getContentLibraryApiUrl } from '../data/api';
import initializeStore from '../../store';
import { ToastProvider } from '../../generic/toast-context';
import LibraryInfoHeader from './LibraryInfoHeader';

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
  lastDraftCreated: convertToDateFromString('2024-07-22') as Date,
  publishedBy: 'staff',
  lastDraftCreatedBy: 'staff',
  allowLti: false,
  allowPublicLearning: false,
  allowPublicRead: false,
  hasUnpublishedChanges: true,
  hasUnpublishedDeletes: false,
  canEditLibrary: true,
  license: '',
  created: convertToDateFromString('2024-06-26') as Date,
  updated: convertToDateFromString('2024-07-20') as Date,
};

interface WrapperProps {
  data: ContentLibrary,
}

const RootWrapper = ({ data } : WrapperProps) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <LibraryInfoHeader library={data} />
        </ToastProvider>
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<LibraryInfoHeader />', () => {
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

  it('should render Library info Header', () => {
    render(<RootWrapper data={libraryData} />);

    expect(screen.getByText(libraryData.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit library name/i })).toBeInTheDocument();
  });

  it('should not render edit title button without permission', () => {
    const data = {
      ...libraryData,
      canEditLibrary: false,
    };

    render(<RootWrapper data={data} />);

    expect(screen.queryByRole('button', { name: /edit library name/i })).not.toBeInTheDocument();
  });

  it('should edit library title', async () => {
    const url = getContentLibraryApiUrl(libraryData.id);
    axiosMock.onPatch(url).reply(200);
    render(<RootWrapper data={libraryData} />);

    const editTitleButton = screen.getByRole('button', { name: /edit library name/i });
    fireEvent.click(editTitleButton);

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    fireEvent.change(textBox, { target: { value: 'New Library Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(await screen.findByText('Library updated successfully')).toBeInTheDocument();

    await waitFor(() => expect(axiosMock.history.patch[0].url).toEqual(url));
  });

  it('should show error on edit library tittle', async () => {
    const url = getContentLibraryApiUrl(libraryData.id);
    axiosMock.onPatch(url).reply(500);
    render(<RootWrapper data={libraryData} />);

    const editTitleButton = screen.getByRole('button', { name: /edit library name/i });
    fireEvent.click(editTitleButton);

    const textBox = screen.getByRole('textbox', { name: /title input/i });

    fireEvent.change(textBox, { target: { value: 'New Library Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(await screen.findByText('There was an error updating the library')).toBeInTheDocument();

    await waitFor(() => expect(axiosMock.history.patch[0].url).toEqual(url));
  });
});
