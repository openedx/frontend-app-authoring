import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  waitFor,
  screen,
  within,
} from '@testing-library/react';
import fetchMock from 'fetch-mock-jest';
import initializeStore from '../store';
import { getContentSearchConfigUrl } from '../search-manager/data/api';
import mockResult from '../search-modal/__mocks__/search-result.json';
import mockEmptyResult from '../search-modal/__mocks__/empty-search-result.json';
import {
  getContentLibraryApiUrl,
  getLibraryCollectionsApiUrl,
  getXBlockFieldsApiUrl,
  type ContentLibrary,
} from './data/api';
import { LibraryLayout } from '.';

let store;
const mockUseParams = jest.fn();
let axiosMock;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => mockUseParams(),
}));

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

/**
 * Returns 0 components from the search query.
*/
const returnEmptyResult = (_url, req) => {
  const requestData = JSON.parse(req.body?.toString() ?? '');
  const query = requestData?.queries[0]?.q ?? '';
  // We have to replace the query (search keywords) in the mock results with the actual query,
  // because otherwise we may have an inconsistent state that causes more queries and unexpected results.
  mockEmptyResult.results[0].query = query;
  // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  mockEmptyResult.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
  return mockEmptyResult;
};

/**
 * Returns 2 components from the search query.
 * This lets us test that the StudioHome "View All" button is hidden when a
 * low number of search results are shown (<=4 by default).
*/
const returnLowNumberResults = (_url, req) => {
  const requestData = JSON.parse(req.body?.toString() ?? '');
  const query = requestData?.queries[0]?.q ?? '';
  const newMockResult = { ...mockResult };
  // We have to replace the query (search keywords) in the mock results with the actual query,
  // because otherwise we may have an inconsistent state that causes more queries and unexpected results.
  newMockResult.results[0].query = query;
  // Limit number of results to just 2
  newMockResult.results[0].hits = mockResult.results[0]?.hits.slice(0, 2);
  newMockResult.results[0].estimatedTotalHits = 2;
  // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  newMockResult.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
  return newMockResult;
};

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

const xBlockFields = {
  display_name: 'Test HTML Block',
  metadata: {
    display_name: 'Test HTML Block',
  },
};

const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

(global as any).BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <LibraryLayout />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<LibraryAuthoringPage />', () => {
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
    mockUseParams.mockReturnValue({ libraryId: '1' });

    // The API method to get the Meilisearch connection details uses Axios:
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(getContentSearchConfigUrl()).reply(200, {
      url: 'http://mock.meilisearch.local',
      index_name: 'studio',
      api_key: 'test-key',
    });

    // The Meilisearch client-side API uses fetch, not Axios.
    fetchMock.post(searchEndpoint, (_url, req) => {
      const requestData = JSON.parse(req.body?.toString() ?? '');
      const query = requestData?.queries[0]?.q ?? '';
      // We have to replace the query (search keywords) in the mock results with the actual query,
      // because otherwise Instantsearch will update the UI and change the query,
      // leading to unexpected results in the test cases.
      mockResult.results[0].query = query;
      // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      mockResult.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
      return mockResult;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
    fetchMock.mockReset();
    queryClient.clear();
  });

  const renderLibraryPage = async () => {
    mockUseParams.mockReturnValue({ libraryId: libraryData.id });
    axiosMock.onGet(getContentLibraryApiUrl(libraryData.id)).reply(200, libraryData);

    const result = render(<RootWrapper />);

    // Ensure the search endpoint is called:
    // Call 1: To fetch searchable/filterable/sortable library data
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    return result;
  };

  it('shows the spinner before the query is complete', () => {
    mockUseParams.mockReturnValue({ libraryId: '1' });
    // @ts-ignore Use unresolved promise to keep the Loading visible
    axiosMock.onGet(getContentLibraryApiUrl('1')).reply(() => new Promise());
    const { getByRole } = render(<RootWrapper />);
    const spinner = getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows an error component if no library returned', async () => {
    mockUseParams.mockReturnValue({ libraryId: 'invalid' });
    axiosMock.onGet(getContentLibraryApiUrl('invalid')).reply(400);

    const { findByTestId } = render(<RootWrapper />);

    expect(await findByTestId('notFoundAlert')).toBeInTheDocument();
  });

  it('shows an error component if no library param', async () => {
    mockUseParams.mockReturnValue({ libraryId: '' });

    const { findByTestId } = render(<RootWrapper />);

    expect(await findByTestId('notFoundAlert')).toBeInTheDocument();
  });

  it('show library data', async () => {
    const {
      getByRole, getAllByText, getByText, queryByText, findByText, findAllByText,
    } = await renderLibraryPage();

    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    expect(await findByText('Content library')).toBeInTheDocument();
    expect((await findAllByText(libraryData.title))[0]).toBeInTheDocument();

    expect(queryByText('You have not added any content to this library yet.')).not.toBeInTheDocument();

    // "Recently Modified" header + sort shown
    expect(getAllByText('Recently Modified').length).toEqual(2);
    expect(getByText('Collections (0)')).toBeInTheDocument();
    expect(getByText('Components (6)')).toBeInTheDocument();
    expect((await findAllByText('Test HTML Block'))[0]).toBeInTheDocument();

    // Navigate to the components tab
    fireEvent.click(getByRole('tab', { name: 'Components' }));
    // "Recently Modified" default sort shown
    expect(getAllByText('Recently Modified').length).toEqual(1);
    expect(queryByText('Collections (0)')).not.toBeInTheDocument();
    expect(queryByText('Components (6)')).not.toBeInTheDocument();

    // Navigate to the collections tab
    fireEvent.click(getByRole('tab', { name: 'Collections' }));
    // "Recently Modified" default sort shown
    expect(getAllByText('Recently Modified').length).toEqual(1);
    expect(queryByText('Collections (0)')).not.toBeInTheDocument();
    expect(queryByText('Components (6)')).not.toBeInTheDocument();
    expect(queryByText('There are 6 components in this library')).not.toBeInTheDocument();
    expect(getByText('Coming soon!')).toBeInTheDocument();

    // Go back to Home tab
    // This step is necessary to avoid the url change leak to other tests
    fireEvent.click(getByRole('tab', { name: 'Home' }));
    // "Recently Modified" header + sort shown
    expect(getAllByText('Recently Modified').length).toEqual(2);
    expect(getByText('Collections (0)')).toBeInTheDocument();
    expect(getByText('Components (6)')).toBeInTheDocument();
  });

  it('show library without components', async () => {
    mockUseParams.mockReturnValue({ libraryId: libraryData.id });
    axiosMock.onGet(getContentLibraryApiUrl(libraryData.id)).reply(200, libraryData);
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });

    const { findByText, getByText, findAllByText } = render(<RootWrapper />);

    expect(await findByText('Content library')).toBeInTheDocument();
    expect((await findAllByText(libraryData.title))[0]).toBeInTheDocument();

    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    expect(getByText('You have not added any content to this library yet.')).toBeInTheDocument();
  });

  it('show library without components without permission', async () => {
    const data = {
      ...libraryData,
      canEditLibrary: false,
    };
    mockUseParams.mockReturnValue({ libraryId: libraryData.id });
    axiosMock.onGet(getContentLibraryApiUrl(libraryData.id)).reply(200, data);
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });

    render(<RootWrapper />);

    expect(await screen.findByText('Content library')).toBeInTheDocument();

    expect(screen.getByText('You have not added any content to this library yet.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add component/i })).not.toBeInTheDocument();
  });

  it('show new content button', async () => {
    await renderLibraryPage();

    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
  });

  it('read only state of library', async () => {
    const data = {
      ...libraryData,
      canEditLibrary: false,
    };
    mockUseParams.mockReturnValue({ libraryId: libraryData.id });
    axiosMock.onGet(getContentLibraryApiUrl(libraryData.id)).reply(200, data);

    render(<RootWrapper />);
    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new/i })).not.toBeInTheDocument();

    expect(screen.getByText('Read Only')).toBeInTheDocument();
  });

  it('show library without search results', async () => {
    mockUseParams.mockReturnValue({ libraryId: libraryData.id });
    axiosMock.onGet(getContentLibraryApiUrl(libraryData.id)).reply(200, libraryData);
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });

    const {
      findByText,
      getByRole,
      getByText,
      findAllByText,
    } = render(<RootWrapper />);

    expect(await findByText('Content library')).toBeInTheDocument();
    expect((await findAllByText(libraryData.title))[0]).toBeInTheDocument();

    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    fireEvent.change(getByRole('searchbox'), { target: { value: 'noresults' } });

    // Ensure the search endpoint is called again, only once more since the recently modified call
    // should not be impacted by the search
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(2, searchEndpoint, 'post'); });

    expect(getByText('No matching components found in this library.')).toBeInTheDocument();

    // Navigate to the components tab
    fireEvent.click(getByRole('tab', { name: 'Components' }));
    expect(getByText('No matching components found in this library.')).toBeInTheDocument();

    // Go back to Home tab
    // This step is necessary to avoid the url change leak to other tests
    fireEvent.click(getByRole('tab', { name: 'Home' }));
  });

  it('should open and close new content sidebar', async () => {
    await renderLibraryPage();

    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(screen.queryByText(/add content/i)).not.toBeInTheDocument();

    const newButton = screen.getByRole('button', { name: /new/i });
    fireEvent.click(newButton);

    expect(screen.getByText(/add content/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/add content/i)).not.toBeInTheDocument();
  });

  it('should open Library Info by default', async () => {
    await renderLibraryPage();

    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryData.title))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(libraryData.title))[1]).toBeInTheDocument();

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();
    expect(screen.getByText('July 22, 2024')).toBeInTheDocument();
    expect(screen.getByText('staff')).toBeInTheDocument();
    expect(screen.getByText(libraryData.org)).toBeInTheDocument();
    expect(screen.getByText('July 20, 2024')).toBeInTheDocument();
    expect(screen.getByText('June 26, 2024')).toBeInTheDocument();
  });

  it('should close and open Library Info', async () => {
    await renderLibraryPage();

    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryData.title))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(libraryData.title))[1]).toBeInTheDocument();

    // Open by default; close the library info sidebar
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    expect(screen.queryByText('(Never Published)')).not.toBeInTheDocument();

    // Open library info sidebar with 'Library info' button
    const libraryInfoButton = screen.getByRole('button', { name: /library info/i });
    fireEvent.click(libraryInfoButton);
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();

    // CLose library info sidebar with 'Library info' button
    fireEvent.click(libraryInfoButton);
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    expect(screen.queryByText('(Never Published)')).not.toBeInTheDocument();
  });

  it('show the "View All" button when viewing library with many components', async () => {
    const {
      getByRole, getByText, queryByText, getAllByText, findAllByText,
    } = await renderLibraryPage();

    expect(getByText('Content library')).toBeInTheDocument();
    expect((await findAllByText(libraryData.title))[0]).toBeInTheDocument();

    // "Recently Modified" header + sort shown
    await waitFor(() => { expect(getAllByText('Recently Modified').length).toEqual(2); });
    expect(getByText('Collections (0)')).toBeInTheDocument();
    expect(getByText('Components (6)')).toBeInTheDocument();
    expect(getAllByText('Test HTML Block')[0]).toBeInTheDocument();
    expect(queryByText('You have not added any content to this library yet.')).not.toBeInTheDocument();

    // There should only be one "View All" button, since the Components count
    // are above the preview limit (4)
    expect(getByText('View All')).toBeInTheDocument();

    // Clicking on "View All" button should navigate to the Components tab
    fireEvent.click(getByText('View All'));
    // "Recently Modified" default sort shown
    expect(getAllByText('Recently Modified').length).toEqual(1);
    expect(queryByText('Collections (0)')).not.toBeInTheDocument();
    expect(queryByText('Components (6)')).not.toBeInTheDocument();
    expect(getAllByText('Test HTML Block')[0]).toBeInTheDocument();

    // Go back to Home tab
    // This step is necessary to avoid the url change leak to other tests
    fireEvent.click(getByRole('tab', { name: 'Home' }));
    // "Recently Modified" header + sort shown
    expect(getAllByText('Recently Modified').length).toEqual(2);
    expect(getByText('Collections (0)')).toBeInTheDocument();
    expect(getByText('Components (6)')).toBeInTheDocument();
  });

  it('should not show the "View All" button when viewing library with low number of components', async () => {
    mockUseParams.mockReturnValue({ libraryId: libraryData.id });
    axiosMock.onGet(getContentLibraryApiUrl(libraryData.id)).reply(200, libraryData);
    fetchMock.post(searchEndpoint, returnLowNumberResults, { overwriteRoutes: true });

    const {
      getByText, queryByText, getAllByText, findAllByText,
    } = render(<RootWrapper />);

    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    expect(getByText('Content library')).toBeInTheDocument();
    expect((await findAllByText(libraryData.title))[0]).toBeInTheDocument();

    // "Recently Modified" header + sort shown
    await waitFor(() => { expect(getAllByText('Recently Modified').length).toEqual(2); });
    expect(getByText('Collections (0)')).toBeInTheDocument();
    expect(getByText('Components (2)')).toBeInTheDocument();
    expect(getAllByText('Test HTML Block')[0]).toBeInTheDocument();
    expect(queryByText('You have not added any content to this library yet.')).not.toBeInTheDocument();

    // There should not be any "View All" button on page since Components count
    // is less than the preview limit (4)
    expect(queryByText('View All')).not.toBeInTheDocument();
  });

  it('sort library components', async () => {
    const {
      findByTitle, getAllByText, getByRole, getByTitle,
    } = await renderLibraryPage();

    expect(await findByTitle('Sort search results')).toBeInTheDocument();

    const testSortOption = (async (optionText, sortBy, isDefault) => {
      // Open the drop-down menu
      fireEvent.click(getByTitle('Sort search results'));

      // Click the option with the given text
      // Since the sort drop-down also shows the selected sort
      // option in its toggle button, we need to make sure we're
      // clicking on the last one found.
      const options = getAllByText(optionText);
      expect(options.length).toBeGreaterThan(0);
      fireEvent.click(options[options.length - 1]);

      // Did the search happen with the expected sort option?
      const bodyText = sortBy ? `"sort":["${sortBy}"]` : '"sort":[]';
      await waitFor(() => {
        expect(fetchMock).toHaveBeenLastCalledWith(searchEndpoint, {
          body: expect.stringContaining(bodyText),
          method: 'POST',
          headers: expect.anything(),
        });
      });

      // Is the sort option stored in the query string?
      const searchText = isDefault ? '' : `?sort=${encodeURIComponent(sortBy)}`;
      expect(window.location.search).toEqual(searchText);

      // Is the selected sort option shown in the toggle button (if not default)
      // as well as in the drop-down menu?
      expect(getAllByText(optionText).length).toEqual(isDefault ? 1 : 2);
    });

    await testSortOption('Title, A-Z', 'display_name:asc', false);
    await testSortOption('Title, Z-A', 'display_name:desc', false);
    await testSortOption('Newest', 'created:desc', false);
    await testSortOption('Oldest', 'created:asc', false);

    // Sorting by Recently Published also excludes unpublished components
    await testSortOption('Recently Published', 'last_published:desc', false);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(searchEndpoint, {
        body: expect.stringContaining('last_published IS NOT NULL'),
        method: 'POST',
        headers: expect.anything(),
      });
    });

    // Re-selecting the previous sort option resets sort to default "Recently Modified"
    await testSortOption('Recently Published', 'modified:desc', true);
    expect(getAllByText('Recently Modified').length).toEqual(3);

    // Enter a keyword into the search box
    const searchBox = getByRole('searchbox');
    fireEvent.change(searchBox, { target: { value: 'words to find' } });

    // Default sort option changes to "Most Relevant"
    expect(getAllByText('Most Relevant').length).toEqual(2);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(searchEndpoint, {
        body: expect.stringContaining('"sort":[]'),
        method: 'POST',
        headers: expect.anything(),
      });
    });
  });

  it('should open and close the component sidebar', async () => {
    const usageKey = mockResult.results[0].hits[0].usage_key;
    const { getAllByText, queryByTestId, queryByText } = await renderLibraryPage();
    axiosMock.onGet(getXBlockFieldsApiUrl(usageKey)).reply(200, xBlockFields);

    // Click on the first component
    waitFor(() => expect(queryByText('Test HTML Block')).toBeInTheDocument());
    fireEvent.click(getAllByText('Test HTML Block')[0]);

    const sidebar = screen.getByTestId('library-sidebar');

    const { getByRole, getByText } = within(sidebar);

    await waitFor(() => expect(getByText('Test HTML Block')).toBeInTheDocument());

    const closeButton = getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => expect(queryByTestId('library-sidebar')).not.toBeInTheDocument());
  });

  it('filter by capa problem type', async () => {
    mockUseParams.mockReturnValue({ libraryId: libraryData.id });
    axiosMock.onGet(getContentLibraryApiUrl(libraryData.id)).reply(200, libraryData);

    const problemTypes = {
      'Multiple Choice': 'choiceresponse',
      Checkboxes: 'multiplechoiceresponse',
      'Numerical Input': 'numericalresponse',
      Dropdown: 'optionresponse',
      'Text Input': 'stringresponse',
    };

    render(<RootWrapper />);

    // Ensure the search endpoint is called
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    const filterButton = screen.getByRole('button', { name: /type/i });
    fireEvent.click(filterButton);

    const openProblemItem = screen.getByTestId('open-problem-item-button');
    fireEvent.click(openProblemItem);

    const validateSubmenu = async (submenuText : string) => {
      const submenu = screen.getByText(submenuText);
      expect(submenu).toBeInTheDocument();
      fireEvent.click(submenu);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenLastCalledWith(searchEndpoint, {
          body: expect.stringContaining(`content.problem_types = ${problemTypes[submenuText]}`),
          method: 'POST',
          headers: expect.anything(),
        });
      });

      fireEvent.click(submenu);
      await waitFor(() => {
        expect(fetchMock).toHaveBeenLastCalledWith(searchEndpoint, {
          body: expect.not.stringContaining(`content.problem_types = ${problemTypes[submenuText]}`),
          method: 'POST',
          headers: expect.anything(),
        });
      });
    };

    // Validate per submenu
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(problemTypes)) {
      // eslint-disable-next-line no-await-in-loop
      await validateSubmenu(key);
    }

    // Validate click on Problem type
    const problemMenu = screen.getByText('Problem');
    expect(problemMenu).toBeInTheDocument();
    fireEvent.click(problemMenu);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(searchEndpoint, {
        body: expect.stringContaining('block_type = problem'),
        method: 'POST',
        headers: expect.anything(),
      });
    });

    fireEvent.click(problemMenu);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(searchEndpoint, {
        body: expect.not.stringContaining('block_type = problem'),
        method: 'POST',
        headers: expect.anything(),
      });
    });

    // Validate clear filters
    const submenu = screen.getByText('Checkboxes');
    expect(submenu).toBeInTheDocument();
    fireEvent.click(submenu);

    const clearFitlersButton = screen.getByRole('button', { name: /clear filters/i });
    fireEvent.click(clearFitlersButton);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(searchEndpoint, {
        body: expect.not.stringContaining(`content.problem_types = ${problemTypes.Checkboxes}`),
        method: 'POST',
        headers: expect.anything(),
      });
    });
  });

  it('empty type filter', async () => {
    mockUseParams.mockReturnValue({ libraryId: libraryData.id });
    axiosMock.onGet(getContentLibraryApiUrl(libraryData.id)).reply(200, libraryData);
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });

    render(<RootWrapper />);

    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    const filterButton = screen.getByRole('button', { name: /type/i });
    fireEvent.click(filterButton);

    expect(screen.getByText(/no matching components/i)).toBeInTheDocument();
  });

  it('should create a collection', async () => {
    const title = 'This is a Test';
    const description = 'This is the description of the Test';
    const url = getLibraryCollectionsApiUrl(libraryData.id);
    axiosMock.onPost(url).reply(200, {
      id: '1',
      slug: 'this-is-a-test',
      title,
      description,
    });
    await renderLibraryPage();

    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(screen.queryByText(/add content/i)).not.toBeInTheDocument();

    // Open Add content sidebar
    const newButton = screen.getByRole('button', { name: /new/i });
    fireEvent.click(newButton);
    expect(screen.getByText(/add content/i)).toBeInTheDocument();

    // Open New collection Modal
    const newCollectionButton = screen.getByRole('button', { name: /collection/i });
    fireEvent.click(newCollectionButton);
    const collectionModalHeading = await screen.findByRole('heading', { name: /new collection/i });
    expect(collectionModalHeading).toBeInTheDocument();

    // Click on Cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(collectionModalHeading).not.toBeInTheDocument();

    // Open new collection modal again and create a collection
    fireEvent.click(newCollectionButton);
    const createButton = screen.getByRole('button', { name: /create/i });
    const nameField = screen.getByRole('textbox', { name: /name your collection/i });
    const descriptionField = screen.getByRole('textbox', { name: /add a description \(optional\)/i });

    fireEvent.change(nameField, { target: { value: title } });
    fireEvent.change(descriptionField, { target: { value: description } });
    fireEvent.click(createButton);
  });

  it('should show validations in create collection', async () => {
    const title = 'This is a Test';
    const description = 'This is the description of the Test';
    const url = getLibraryCollectionsApiUrl(libraryData.id);
    axiosMock.onPost(url).reply(200, {
      id: '1',
      slug: 'this-is-a-test',
      title,
      description,
    });
    await renderLibraryPage();

    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(screen.queryByText(/add content/i)).not.toBeInTheDocument();

    // Open Add content sidebar
    const newButton = screen.getByRole('button', { name: /new/i });
    fireEvent.click(newButton);
    expect(screen.getByText(/add content/i)).toBeInTheDocument();

    // Open New collection Modal
    const newCollectionButton = screen.getByRole('button', { name: /collection/i });
    fireEvent.click(newCollectionButton);
    const collectionModalHeading = await screen.findByRole('heading', { name: /new collection/i });
    expect(collectionModalHeading).toBeInTheDocument();

    // Click on create with an empty name
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);

    expect(screen.getByText(/collection name is required/i)).toBeInTheDocument();
  });

  it('should show error on conflict response', async () => {
    const title = 'This is a Test';
    const description = 'This is the description of the Test';
    const url = getLibraryCollectionsApiUrl(libraryData.id);
    axiosMock.onPost(url).reply(409, {
      customAttributes: {
        httpErrorStatus: 409,
      },
    });
    await renderLibraryPage();

    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(screen.queryByText(/add content/i)).not.toBeInTheDocument();

    // Open Add content sidebar
    const newButton = screen.getByRole('button', { name: /new/i });
    fireEvent.click(newButton);
    expect(screen.getByText(/add content/i)).toBeInTheDocument();

    // Open New collection Modal
    const newCollectionButton = screen.getByRole('button', { name: /collection/i });
    fireEvent.click(newCollectionButton);
    const collectionModalHeading = await screen.findByRole('heading', { name: /new collection/i });
    expect(collectionModalHeading).toBeInTheDocument();

    // Create a normal collection
    const createButton = screen.getByRole('button', { name: /create/i });
    const nameField = screen.getByRole('textbox', { name: /name your collection/i });
    const descriptionField = screen.getByRole('textbox', { name: /add a description \(optional\)/i });

    fireEvent.change(nameField, { target: { value: title } });
    fireEvent.change(descriptionField, { target: { value: description } });
    fireEvent.click(createButton);

    expect(await screen.findByText(/there is another collection with the same name/i)).toBeInTheDocument();
  });
});
