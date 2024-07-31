import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import LibraryInfo from './LibraryInfo';
import { ToastProvider } from '../../generic/toast-context';
import { ContentLibrary, getCommitLibraryChangesUrl } from '../data/api';
import initializeStore from '../../store';
import { convertToDateFromString } from '../../utils';

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
          <LibraryInfo library={data} />
        </ToastProvider>
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<LibraryInfo />', () => {
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

  it('should render Library info sidebar', () => {
    render(<RootWrapper data={libraryData} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();
    expect(screen.getByText('July 22, 2024')).toBeInTheDocument();
    expect(screen.getByText('staff')).toBeInTheDocument();
    expect(screen.getByText(libraryData.org)).toBeInTheDocument();
    expect(screen.getByText('July 20, 2024')).toBeInTheDocument();
    expect(screen.getByText('June 26, 2024')).toBeInTheDocument();
  });

  it('should render draft library info sidebar', () => {
    const data = {
      ...libraryData,
      lastPublished: convertToDateFromString('2024-07-26') as Date,
    };

    render(<RootWrapper data={data} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.queryByText('(Never Published)')).not.toBeInTheDocument();
    expect(screen.getByText('July 22, 2024')).toBeInTheDocument();
    expect(screen.getByText('staff')).toBeInTheDocument();
  });

  it('should render published library info sidebar', () => {
    const data = {
      ...libraryData,
      lastPublished: convertToDateFromString('2024-07-26') as Date,
      hasUnpublishedChanges: false,
    };

    render(<RootWrapper data={data} />);
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('July 26, 2024')).toBeInTheDocument();
    expect(screen.getByText('staff')).toBeInTheDocument();
  });

  it('should publish library', async () => {
    const url = getCommitLibraryChangesUrl(libraryData.id);
    axiosMock.onPost(url).reply(200);
    render(<RootWrapper data={libraryData} />);

    const publishButton = screen.getByRole('button', { name: /publish/i });
    fireEvent.click(publishButton);

    expect(await screen.findByText('Library published successfully')).toBeInTheDocument();

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(url));
  });

  it('should show error on publish library', async () => {
    const url = getCommitLibraryChangesUrl(libraryData.id);
    axiosMock.onPost(url).reply(500);
    render(<RootWrapper data={libraryData} />);

    const publishButton = screen.getByRole('button', { name: /publish/i });
    fireEvent.click(publishButton);

    expect(await screen.findByText('There was an error publishing the library.')).toBeInTheDocument();

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(url));
  });

  it('should discard changes', async () => {
    const url = getCommitLibraryChangesUrl(libraryData.id);
    axiosMock.onDelete(url).reply(200);

    render(<RootWrapper data={libraryData} />);
    const discardButton = screen.getByRole('button', { name: /discard changes/i });
    fireEvent.click(discardButton);

    expect(await screen.findByText('Library changes reverted successfully')).toBeInTheDocument();

    await waitFor(() => expect(axiosMock.history.delete[0].url).toEqual(url));
  });

  it('should show error on discard changes', async () => {
    const url = getCommitLibraryChangesUrl(libraryData.id);
    axiosMock.onDelete(url).reply(500);

    render(<RootWrapper data={libraryData} />);
    const discardButton = screen.getByRole('button', { name: /discard changes/i });
    fireEvent.click(discardButton);

    expect(await screen.findByText('There was an error reverting changes in the library.')).toBeInTheDocument();

    await waitFor(() => expect(axiosMock.history.delete[0].url).toEqual(url));
  });
});
