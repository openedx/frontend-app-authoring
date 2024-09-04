import fetchMock from 'fetch-mock-jest';
import {
  fireEvent,
  render,
  waitFor,
  within,
  initializeMocks,
} from '../testUtils';
import { getContentSearchConfigUrl } from '../search-manager/data/api';
import mockResult from './__mocks__/library-search.json';
import mockEmptyResult from '../search-modal/__mocks__/empty-search-result.json';
import { mockContentLibrary, mockLibraryBlockTypes, mockXBlockFields } from './data/api.mocks';
import { LibraryLayout } from '.';

mockContentLibrary.applyMock();
mockLibraryBlockTypes.applyMock();
mockXBlockFields.applyMock();

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';

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

const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

(global as any).BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

const path = '/library/:libraryId/*';
const libraryTitle = mockContentLibrary.libraryData.title;

describe('<LibraryAuthoringPage />', () => {
  beforeEach(() => {
    const { axiosMock } = initializeMocks();

    // The API method to get the Meilisearch connection details uses Axios:
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
    fetchMock.mockReset();
  });

  const renderLibraryPage = async () => {
    const doc = render(<LibraryLayout />, { path, params: { libraryId: mockContentLibrary.libraryId } });

    // Ensure the search endpoint is called:
    // Call 1: To fetch searchable/filterable/sortable library data
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    return doc;
  };

  it('shows the spinner before the query is complete', () => {
    // This mock will never return data about the library (it loads forever):
    const libraryId = mockContentLibrary.libraryIdThatNeverLoads;
    const doc = render(<LibraryLayout />, { path, params: { libraryId } });
    const spinner = doc.getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows an error component if no library returned', async () => {
    // This mock will simulate a 404 error:
    const libraryId = mockContentLibrary.library404;
    const doc = render(<LibraryLayout />, { path, params: { libraryId } });
    expect(await doc.findByTestId('notFoundAlert')).toBeInTheDocument();
  });

  it('shows library data', async () => {
    const {
      getByRole, getAllByText, getByText, queryByText, findByText, findAllByText,
    } = await renderLibraryPage();

    expect(await findByText('Content library')).toBeInTheDocument();
    expect((await findAllByText(libraryTitle))[0]).toBeInTheDocument();

    expect(queryByText('You have not added any content to this library yet.')).not.toBeInTheDocument();

    // "Recently Modified" header + sort shown
    expect(getAllByText('Recently Modified').length).toEqual(2);
    expect(getByText('Collections (0)')).toBeInTheDocument();
    expect(getByText('Components (10)')).toBeInTheDocument();
    expect((await findAllByText('Introduction to Testing'))[0]).toBeInTheDocument();

    // Navigate to the components tab
    fireEvent.click(getByRole('tab', { name: 'Components' }));
    // "Recently Modified" default sort shown
    expect(getAllByText('Recently Modified').length).toEqual(1);
    expect(queryByText('Collections (0)')).not.toBeInTheDocument();
    expect(queryByText('Components (10)')).not.toBeInTheDocument();

    // Navigate to the collections tab
    fireEvent.click(getByRole('tab', { name: 'Collections' }));
    // "Recently Modified" default sort shown
    expect(getAllByText('Recently Modified').length).toEqual(1);
    expect(queryByText('Collections (0)')).not.toBeInTheDocument();
    expect(queryByText('Components (10)')).not.toBeInTheDocument();
    expect(queryByText('There are 10 components in this library')).not.toBeInTheDocument();
    expect(getByText('Coming soon!')).toBeInTheDocument();

    // Go back to Home tab
    // This step is necessary to avoid the url change leak to other tests
    fireEvent.click(getByRole('tab', { name: 'Home' }));
    // "Recently Modified" header + sort shown
    expect(getAllByText('Recently Modified').length).toEqual(2);
    expect(getByText('Collections (0)')).toBeInTheDocument();
    expect(getByText('Components (10)')).toBeInTheDocument();
  });

  it('shows a library without components', async () => {
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    const doc = await renderLibraryPage();

    expect(await doc.findByText('Content library')).toBeInTheDocument();
    expect((await doc.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    expect(doc.getByText('You have not added any content to this library yet.')).toBeInTheDocument();
  });

  it('shows the new content button', async () => {
    const doc = await renderLibraryPage();

    expect(await doc.findByRole('heading')).toBeInTheDocument();
    expect(doc.getByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(doc.queryByText('Read Only')).not.toBeInTheDocument();
  });

  it('shows an empty read-only library, without a "create component" button', async () => {
    // Use a library mock that is read-only:
    const libraryId = mockContentLibrary.libraryIdReadOnly;
    // Update search mock so it returns no results:
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    const doc = render(<LibraryLayout />, { path, params: { libraryId } });
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    expect(await doc.findByText('Content library')).toBeInTheDocument();
    expect(doc.getByText('You have not added any content to this library yet.')).toBeInTheDocument();
    expect(doc.queryByRole('button', { name: /add component/i })).not.toBeInTheDocument();
    expect(doc.getByText('Read Only')).toBeInTheDocument();
  });

  it('show a library without search results', async () => {
    // Update search mock so it returns no results:
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    const doc = await renderLibraryPage();

    expect(await doc.findByText('Content library')).toBeInTheDocument();
    expect((await doc.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    fireEvent.change(doc.getByRole('searchbox'), { target: { value: 'noresults' } });

    // Ensure the search endpoint is called again, only once more since the recently modified call
    // should not be impacted by the search
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(2, searchEndpoint, 'post'); });

    expect(doc.getByText('No matching components found in this library.')).toBeInTheDocument();

    // Navigate to the components tab
    fireEvent.click(doc.getByRole('tab', { name: 'Components' }));
    expect(doc.getByText('No matching components found in this library.')).toBeInTheDocument();
  });

  it('should open and close new content sidebar', async () => {
    const doc = await renderLibraryPage();

    expect(await doc.findByRole('heading')).toBeInTheDocument();
    expect(doc.queryByText(/add content/i)).not.toBeInTheDocument();

    const newButton = doc.getByRole('button', { name: /new/i });
    fireEvent.click(newButton);

    expect(doc.getByText(/add content/i)).toBeInTheDocument();

    const closeButton = doc.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(doc.queryByText(/add content/i)).not.toBeInTheDocument();
  });

  it('should open Library Info by default', async () => {
    const doc = await renderLibraryPage();

    expect(await doc.findByText('Content library')).toBeInTheDocument();
    expect((await doc.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await doc.findAllByText(libraryTitle))[1]).toBeInTheDocument();

    expect(doc.getByText('Draft')).toBeInTheDocument();
    expect(doc.getByText('(Never Published)')).toBeInTheDocument();
    // Draft saved on date:
    expect(doc.getByText('July 22, 2024')).toBeInTheDocument();

    expect(doc.getByText(mockContentLibrary.libraryData.org)).toBeInTheDocument();
    // Updated:
    expect(doc.getByText('July 20, 2024')).toBeInTheDocument();
    // Created:
    expect(doc.getByText('June 26, 2024')).toBeInTheDocument();
  });

  it('should close and open Library Info', async () => {
    const doc = await renderLibraryPage();

    expect(await doc.findByText('Content library')).toBeInTheDocument();
    expect((await doc.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await doc.findAllByText(libraryTitle))[1]).toBeInTheDocument();

    // Open by default; close the library info sidebar
    const closeButton = doc.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(doc.queryByText('Draft')).not.toBeInTheDocument();
    expect(doc.queryByText('(Never Published)')).not.toBeInTheDocument();

    // Open library info sidebar with 'Library info' button
    const libraryInfoButton = doc.getByRole('button', { name: /library info/i });
    fireEvent.click(libraryInfoButton);
    expect(doc.getByText('Draft')).toBeInTheDocument();
    expect(doc.getByText('(Never Published)')).toBeInTheDocument();

    // Close library info sidebar with 'Library info' button
    fireEvent.click(libraryInfoButton);
    expect(doc.queryByText('Draft')).not.toBeInTheDocument();
    expect(doc.queryByText('(Never Published)')).not.toBeInTheDocument();
  });

  it('show the "View All" button when viewing library with many components', async () => {
    const doc = await renderLibraryPage();

    expect(doc.getByText('Content library')).toBeInTheDocument();
    expect((await doc.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    // "Recently Modified" header + sort shown
    await waitFor(() => { expect(doc.getAllByText('Recently Modified').length).toEqual(2); });
    expect(doc.getByText('Collections (0)')).toBeInTheDocument();
    expect(doc.getByText('Components (10)')).toBeInTheDocument();
    expect(doc.getAllByText('Introduction to Testing')[0]).toBeInTheDocument();
    expect(doc.queryByText('You have not added any content to this library yet.')).not.toBeInTheDocument();

    // There should only be one "View All" button, since the Components count
    // are above the preview limit (4)
    expect(doc.getByText('View All')).toBeInTheDocument();

    // Clicking on "View All" button should navigate to the Components tab
    fireEvent.click(doc.getByText('View All'));
    // "Recently Modified" default sort shown
    expect(doc.getAllByText('Recently Modified').length).toEqual(1);
    expect(doc.queryByText('Collections (0)')).not.toBeInTheDocument();
    expect(doc.queryByText('Components (10)')).not.toBeInTheDocument();
    expect(doc.getAllByText('Introduction to Testing')[0]).toBeInTheDocument();

    // Go back to Home tab
    // This step is necessary to avoid the url change leak to other tests
    fireEvent.click(doc.getByRole('tab', { name: 'Home' }));
    // "Recently Modified" header + sort shown
    expect(doc.getAllByText('Recently Modified').length).toEqual(2);
    expect(doc.getByText('Collections (0)')).toBeInTheDocument();
    expect(doc.getByText('Components (10)')).toBeInTheDocument();
  });

  it('should not show the "View All" button when viewing library with low number of components', async () => {
    fetchMock.post(searchEndpoint, returnLowNumberResults, { overwriteRoutes: true });
    const doc = await renderLibraryPage();

    expect(doc.getByText('Content library')).toBeInTheDocument();
    expect((await doc.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    // "Recently Modified" header + sort shown
    await waitFor(() => { expect(doc.getAllByText('Recently Modified').length).toEqual(2); });
    expect(doc.getByText('Collections (0)')).toBeInTheDocument();
    expect(doc.getByText('Components (2)')).toBeInTheDocument();
    expect(doc.getAllByText('Introduction to Testing')[0]).toBeInTheDocument();
    expect(doc.queryByText('You have not added any content to this library yet.')).not.toBeInTheDocument();

    // There should not be any "View All" button on page since Components count
    // is less than the preview limit (4)
    expect(doc.queryByText('View All')).not.toBeInTheDocument();
  });

  it('sorts library components', async () => {
    const doc = await renderLibraryPage();

    expect(await doc.findByTitle('Sort search results')).toBeInTheDocument();

    const testSortOption = (async (optionText, sortBy, isDefault) => {
      // Open the drop-down menu
      fireEvent.click(doc.getByTitle('Sort search results'));

      // Click the option with the given text
      // Since the sort drop-down also shows the selected sort
      // option in its toggle button, we need to make sure we're
      // clicking on the last one found.
      const options = doc.getAllByText(optionText);
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
      // Note: we can't easily check this at the moment with <MemoryRouter>
      // const searchText = isDefault ? '' : `?sort=${encodeURIComponent(sortBy)}`;
      // expect(window.location.href).toEqual(searchText);

      // Is the selected sort option shown in the toggle button (if not default)
      // as well as in the drop-down menu?
      expect(doc.getAllByText(optionText).length).toEqual(isDefault ? 1 : 2);
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
    expect(doc.getAllByText('Recently Modified').length).toEqual(3);

    // Enter a keyword into the search box
    const searchBox = doc.getByRole('searchbox');
    fireEvent.change(searchBox, { target: { value: 'words to find' } });

    // Default sort option changes to "Most Relevant"
    expect(doc.getAllByText('Most Relevant').length).toEqual(2);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(searchEndpoint, {
        body: expect.stringContaining('"sort":[]'),
        method: 'POST',
        headers: expect.anything(),
      });
    });
  });

  it('should open and close the component sidebar', async () => {
    const mockResult0 = mockResult.results[0].hits[0];
    const displayName = 'Introduction to Testing';
    expect(mockResult0.display_name).toStrictEqual(displayName);
    const doc = await renderLibraryPage();

    // Click on the first component
    waitFor(() => expect(doc.queryByText(displayName)).toBeInTheDocument());
    fireEvent.click(doc.getAllByText(displayName)[0]);

    const sidebar = doc.getByTestId('library-sidebar');

    const { getByRole, getByText } = within(sidebar);

    await waitFor(() => expect(getByText(displayName)).toBeInTheDocument());

    const closeButton = getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => expect(doc.queryByTestId('library-sidebar')).not.toBeInTheDocument());
  });

  it('can filter by capa problem type', async () => {
    const problemTypes = {
      'Multiple Choice': 'choiceresponse',
      Checkboxes: 'multiplechoiceresponse',
      'Numerical Input': 'numericalresponse',
      Dropdown: 'optionresponse',
      'Text Input': 'stringresponse',
    };

    const doc = await renderLibraryPage();

    // Ensure the search endpoint is called
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    const filterButton = doc.getByRole('button', { name: /type/i });
    fireEvent.click(filterButton);

    const problemFilterCheckbox = doc.getByRole('checkbox', { name: /problem/i });
    const problemFilterMenuItem = problemFilterCheckbox.parentElement; // div.pgn__menu-item
    const showProbTypesSubmenuBtn = problemFilterMenuItem!.querySelector('button[aria-label="Open problem types filters"]');
    expect(showProbTypesSubmenuBtn).not.toBeNull();
    fireEvent.click(showProbTypesSubmenuBtn!);

    const validateSubmenu = async (submenuText : string) => {
      const submenu = doc.getByText(submenuText);
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
    const problemMenu = doc.getByText('Problem');
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
    const submenu = doc.getByText('Checkboxes');
    expect(submenu).toBeInTheDocument();
    fireEvent.click(submenu);

    const clearFitlersButton = doc.getByRole('button', { name: /clear filters/i });
    fireEvent.click(clearFitlersButton);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(searchEndpoint, {
        body: expect.not.stringContaining(`content.problem_types = ${problemTypes.Checkboxes}`),
        method: 'POST',
        headers: expect.anything(),
      });
    });
  });

  it('has an empty type filter when there are no results', async () => {
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    const doc = await renderLibraryPage();

    const filterButton = doc.getByRole('button', { name: /type/i });
    fireEvent.click(filterButton);

    expect(doc.getByText(/no matching components/i)).toBeInTheDocument();
  });
});
