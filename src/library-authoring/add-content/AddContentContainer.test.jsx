import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '@edx/frontend-platform/react';
import AddContentContainer from './AddContentContainer';
import initializeStore from '../../store';

const mockUseParams = jest.fn();
const mockUseCreateLibraryBlock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => mockUseParams(),
}));

jest.mock('../data/apiHook', () => ({
  useCreateLibraryBlock: () => ({
    mutateAsync: mockUseCreateLibraryBlock,
  }),
}));

const libraryId = '1';
let store;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <AddContentContainer />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<AddContentContainer />', () => {
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
    mockUseParams.mockReturnValue({ libraryId });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render content buttons', () => {
    render(<RootWrapper />);
    expect(screen.getByRole('button', { name: /collection/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /text/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /problem/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open reponse/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /drag drop/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /video/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /advanced \/ other/i })).toBeInTheDocument();
  });

  it('should create a content', async () => {
    mockUseCreateLibraryBlock.mockReturnValue({
      then: () => ({ catch: jest.fn() }),
    });
    render(<RootWrapper />);

    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);

    expect(mockUseCreateLibraryBlock).toHaveBeenCalled();
  });
});
