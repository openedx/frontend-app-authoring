import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';

import { apiUrls } from '../data/api';
import initializeStore from '../../store';
import TaxonomyDetailPage from './TaxonomyDetailPage';

let store;
const mockNavigate = jest.fn();
const mockMutate = jest.fn();
let axiosMock;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    taxonomyId: '1',
  }),
  useNavigate: () => mockNavigate,
}));
jest.mock('../data/apiHooks', () => ({
  ...jest.requireActual('../data/apiHooks'),
  useDeleteTaxonomy: () => mockMutate,
}));

jest.mock('./TaxonomyDetailSideCard', () => jest.fn(() => <>Mock TaxonomyDetailSideCard</>));
jest.mock('../tag-list/TagListTable', () => jest.fn(() => <>Mock TagListTable</>));

const queryClient = new QueryClient();

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <TaxonomyDetailPage />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<TaxonomyDetailPage />', () => {
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
    queryClient.clear();
  });

  it('shows the spinner before the query is complete', () => {
    // Use unresolved promise to keep the Loading visible
    axiosMock.onGet(apiUrls.taxonomy(1)).reply(() => new Promise());
    const { getByRole } = render(<RootWrapper />);
    const spinner = getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows the connector error component if not taxonomy returned', async () => {
    // Use empty response to trigger the error. Returning an error do not
    // work because the query will retry.
    axiosMock.onGet(apiUrls.taxonomy(1)).reply(200);

    const { findByTestId } = render(<RootWrapper />);

    expect(await findByTestId('connectionErrorAlert')).toBeInTheDocument();
  });

  it('should render page and page title correctly', async () => {
    await axiosMock.onGet(apiUrls.taxonomy(1)).replyOnce(200, {
      id: 1,
      name: 'Test taxonomy',
      description: 'This is a description',
      system_defined: false,
      can_change_taxonomy: true,
      can_delete_taxonomy: true,
      tagsCount: 0,
    });

    const { getByTestId, queryByTestId, findByRole } = render(<RootWrapper />);

    expect(await findByRole('heading')).toHaveTextContent('Test taxonomy');

    // Menu closed/doesn't exist yet
    expect(queryByTestId('taxonomy-menu')).not.toBeInTheDocument();

    // Click on the menu button to open
    fireEvent.click(getByTestId('taxonomy-menu-button'));

    // Menu opened
    expect(getByTestId('taxonomy-menu')).toBeVisible();
    expect(getByTestId('taxonomy-menu-import')).toBeVisible();
    expect(getByTestId('taxonomy-menu-export')).toBeVisible();
    expect(getByTestId('taxonomy-menu-delete')).toBeVisible();
  });

  it('should show system defined badge', async () => {
    axiosMock.onGet(apiUrls.taxonomy(1)).replyOnce(200, {
      id: 1,
      name: 'Test taxonomy',
      description: 'This is a description',
      system_defined: true,
      can_change_taxonomy: false,
      can_delete_taxonomy: false,
    });

    const { findByRole, getByText } = render(<RootWrapper />);

    expect(await findByRole('heading')).toHaveTextContent('Test taxonomy');
    expect(getByText('System-level')).toBeInTheDocument();
  });

  it('should not show system defined badge', async () => {
    axiosMock.onGet(apiUrls.taxonomy(1)).replyOnce(200, {
      id: 1,
      name: 'Test taxonomy',
      description: 'This is a description',
      system_defined: false,
      can_change_taxonomy: false,
      can_delete_taxonomy: false,
    });

    const { findByRole, queryByText } = render(<RootWrapper />);

    expect(await findByRole('heading')).toHaveTextContent('Test taxonomy');
    expect(queryByText('System-level')).not.toBeInTheDocument();
  });
});
