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
import { LibraryProvider } from '../common/context';
import { ToastProvider } from '../../generic/toast-context';
import { ContentLibrary, getCommitLibraryChangesUrl } from '../data/api';
import initializeStore from '../../store';

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
  data: ContentLibrary,
}

const RootWrapper = ({ data } : WrapperProps) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <LibraryProvider libraryId={data.id}>
            <LibraryInfo library={data} />
          </LibraryProvider>
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

  it('should render Library info in draft state without user', () => {
    const data = {
      ...libraryData,
      lastDraftCreatedBy: null,
    };

    render(<RootWrapper data={data} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();
    expect(screen.getByText('July 22, 2024')).toBeInTheDocument();
    expect(screen.queryByText('staff')).not.toBeInTheDocument();
  });

  it('should render Library creation date if last draft created date is null', () => {
    const data = {
      ...libraryData,
      lastDraftCreated: null,
    };

    render(<RootWrapper data={data} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();
    expect(screen.getAllByText('June 26, 2024')[0]).toBeInTheDocument();
    expect(screen.getAllByText('June 26, 2024')[1]).toBeInTheDocument();
  });

  it('should render library info in draft state without date', () => {
    const data = {
      ...libraryData,
      lastDraftCreated: null,
      created: null,
    };

    render(<RootWrapper data={data} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();
  });

  it('should render draft library info sidebar', () => {
    const data = {
      ...libraryData,
      lastPublished: '2024-07-26',
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
      lastPublished: '2024-07-26',
      hasUnpublishedChanges: false,
    };

    render(<RootWrapper data={data} />);
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('July 26, 2024')).toBeInTheDocument();
    expect(screen.getByText('staff')).toBeInTheDocument();
  });

  it('should render published library info without user', () => {
    const data = {
      ...libraryData,
      lastPublished: '2024-07-26',
      hasUnpublishedChanges: false,
      publishedBy: null,
    };

    render(<RootWrapper data={data} />);
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('July 26, 2024')).toBeInTheDocument();
    expect(screen.queryByText('staff')).not.toBeInTheDocument();
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

  it('discard changes btn should be disabled for new libraries', async () => {
    render(<RootWrapper data={{ ...libraryData, lastPublished: null, numBlocks: 0 }} />);
    const discardButton = screen.getByRole('button', { name: /discard changes/i });

    expect(discardButton).toBeDisabled();
  });

  it('publish and discard changes btns should be enabled for new libraries if components are added', async () => {
    render(<RootWrapper data={{ ...libraryData, lastPublished: null, numBlocks: 2 }} />);
    const publishButton = screen.getByRole('button', { name: /publish/i });
    const discardButton = screen.getByRole('button', { name: /discard changes/i });

    expect(publishButton).not.toBeDisabled();
    expect(discardButton).not.toBeDisabled();
  });

  it('publish and discard changes btns should be absent for users who cannot edit the library', async () => {
    const data = {
      ...libraryData,
      lastPublished: null,
      numBlocks: 2,
      canEditLibrary: false,
    };
    render(<RootWrapper data={data} />);
    const publishButton = screen.queryByRole('button', { name: /publish/i });
    const discardButton = screen.queryByRole('button', { name: /discard changes/i });

    expect(publishButton).not.toBeInTheDocument();
    expect(discardButton).not.toBeInTheDocument();
  });
});
