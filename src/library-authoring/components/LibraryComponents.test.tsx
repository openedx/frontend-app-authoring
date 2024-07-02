import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import LibraryComponents from './LibraryComponents';

import initializeStore from '../../store';
import { libraryComponentsMock } from '../__mocks__';

const mockUseLibraryComponents = jest.fn();
const mockUseLibraryComponentCount = jest.fn();
const mockUseLibraryBlockTypes = jest.fn();
const mockFetchNextPage = jest.fn();
let store;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const data = {
  hits: [],
  isFetching: true,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: mockFetchNextPage,
};
const countData = {
  componentCount: 1,
  collectionCount: 0,
};
const blockTypeData = {
  data: [
    {
      blockType: 'html',
      displayName: 'Text',
    },
    {
      blockType: 'video',
      displayName: 'Video',
    },
    {
      blockType: 'problem',
      displayName: 'Problem',
    },
  ],
};

jest.mock('../data/apiHook', () => ({
  useLibraryComponents: () => mockUseLibraryComponents(),
  useLibraryComponentCount: () => mockUseLibraryComponentCount(),
  useLibraryBlockTypes: () => mockUseLibraryBlockTypes(),
}));

const RootWrapper = (props) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <LibraryComponents libraryId="1" filter={{ searchKeywords: '' }} {...props} />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<LibraryComponents />', () => {
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
    mockUseLibraryComponents.mockReturnValue(data);
    mockUseLibraryComponentCount.mockReturnValue(countData);
    mockUseLibraryBlockTypes.mockReturnValue(blockTypeData);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render empty state', async () => {
    mockUseLibraryComponentCount.mockReturnValueOnce({
      ...countData,
      componentCount: 0,
    });
    render(<RootWrapper />);
    expect(await screen.findByText(/you have not added any content to this library yet\./i));
  });

  it('should render loading', async () => {
    render(<RootWrapper />);
    expect((await screen.findAllByTestId('card-loading'))[0]).toBeInTheDocument();
  });

  it('should render components in full variant', async () => {
    mockUseLibraryComponents.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      isFetching: false,
    });
    render(<RootWrapper variant="full" />);

    expect(await screen.findByText('This is a text: ID=1')).toBeInTheDocument();
    expect(screen.getByText('This is a text: ID=2')).toBeInTheDocument();
    expect(screen.getByText('This is a video: ID=3')).toBeInTheDocument();
    expect(screen.getByText('This is a video: ID=4')).toBeInTheDocument();
    expect(screen.getByText('This is a problem: ID=5')).toBeInTheDocument();
    expect(screen.getByText('This is a problem: ID=6')).toBeInTheDocument();
  });

  it('should render components in preview variant', async () => {
    mockUseLibraryComponents.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      isFetching: false,
    });
    render(<RootWrapper variant="preview" />);

    expect(await screen.findByText('This is a text: ID=1')).toBeInTheDocument();
    expect(screen.getByText('This is a text: ID=2')).toBeInTheDocument();
    expect(screen.getByText('This is a video: ID=3')).toBeInTheDocument();
    expect(screen.getByText('This is a video: ID=4')).toBeInTheDocument();
    expect(screen.queryByText('This is a problem: ID=5')).not.toBeInTheDocument();
    expect(screen.queryByText('This is a problem: ID=6')).not.toBeInTheDocument();
  });

  it('should call `fetchNextPage` on scroll to bottom in full variant', async () => {
    mockUseLibraryComponents.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      isFetching: false,
      hasNextPage: true,
    });

    render(<RootWrapper variant="full" />);

    Object.defineProperty(window, 'innerHeight', { value: 800 });
    Object.defineProperty(document.body, 'scrollHeight', { value: 1600 });

    fireEvent.scroll(window, { target: { scrollY: 1000 } });

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('should not call `fetchNextPage` on croll to bottom in preview variant', async () => {
    mockUseLibraryComponents.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      isFetching: false,
      hasNextPage: true,
    });

    render(<RootWrapper variant="preview" />);

    Object.defineProperty(window, 'innerHeight', { value: 800 });
    Object.defineProperty(document.body, 'scrollHeight', { value: 1600 });

    fireEvent.scroll(window, { target: { scrollY: 1000 } });

    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });

  it('should render content and loading when fetching next page', async () => {
    mockUseLibraryComponents.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      isFetching: true,
      isFetchingNextPage: true,
      hasNextPage: true,
    });

    render(<RootWrapper variant="full" />);

    expect(await screen.findByText('This is a text: ID=1')).toBeInTheDocument();
    expect(screen.getByText('This is a problem: ID=6')).toBeInTheDocument();

    expect((await screen.findAllByTestId('card-loading'))[0]).toBeInTheDocument();
  });
});
