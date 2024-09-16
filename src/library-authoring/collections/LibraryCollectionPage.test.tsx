import fetchMock from 'fetch-mock-jest';
import {
  fireEvent,
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '../../testUtils';
import mockResult from '../__mocks__/collection-search.json';
import mockEmptyResult from '../../search-modal/__mocks__/empty-search-result.json';
import { mockCollection, mockContentLibrary, mockLibraryBlockTypes, mockXBlockFields } from '../data/api.mocks';
import { mockContentSearchConfig } from '../../search-manager/data/api.mock';
import { mockBroadcastChannel } from '../../generic/data/api.mock';
import { LibraryLayout } from '..';

mockContentSearchConfig.applyMock();
mockContentLibrary.applyMock();
mockCollection.applyMock();
mockLibraryBlockTypes.applyMock();
mockXBlockFields.applyMock();
mockBroadcastChannel();

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

const path = '/library/:libraryId/*';
const libraryTitle = mockContentLibrary.libraryData.title;
const collectionTitle = mockCollection.collectionData.title;

describe('<LibraryCollectionPage />', () => {
  beforeEach(() => {
    initializeMocks();

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

  const renderLibraryCollectionPage = async (collectionId?: string, libraryId?: string) => {
    const libId = libraryId || mockCollection.libraryId;
    const colId = collectionId || mockCollection.collectionId;
    render(<LibraryLayout />, {
      path,
      routerProps: {
        initialEntries: [`/library/${libId}/collections/${colId}`],
      }
    });
  };

  it('shows the spinner before the query is complete', async () => {
    // This mock will never return data about the collection (it loads forever):
    await renderLibraryCollectionPage(mockCollection.collectionIdThatNeverLoads);
    const spinner = screen.getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows an error component if no collection returned', async () => {
    // This mock will simulate a 404 error:
    await renderLibraryCollectionPage(mockCollection.collection404);
    expect(await screen.findByTestId('notFoundAlert')).toBeInTheDocument();
  });

  it('shows collection data', async () => {
    await renderLibraryCollectionPage();
    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(collectionTitle))[0]).toBeInTheDocument();

    expect(screen.queryByText('This collection is currently empty.')).not.toBeInTheDocument();

    // "Recently Modified" sort shown
    expect(screen.getAllByText('Recently Modified').length).toEqual(1);
    expect((await screen.findAllByText('Introduction to Testing'))[0]).toBeInTheDocument();
    // Content header with count
    expect(await screen.findByText('Content (5)')).toBeInTheDocument();
  });

  it('shows a collection without associated components', async () => {
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    await renderLibraryCollectionPage();

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(collectionTitle))[0]).toBeInTheDocument();

    expect(screen.getByText('This collection is currently empty.')).toBeInTheDocument();

    const addComponentButton = screen.getAllByRole('button', { name: /new/i })[1];
    fireEvent.click(addComponentButton);
    expect(screen.getByText(/add content/i)).toBeInTheDocument();
  });

  it('shows the new content button', async () => {
    await renderLibraryCollectionPage();

    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(await screen.findByText('Content (5)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(screen.queryByText('Read Only')).not.toBeInTheDocument();
  });

  it('shows an empty read-only library collection, without a new button', async () => {
    // Use a library mock that is read-only:
    const libraryId = mockContentLibrary.libraryIdReadOnly;
    // Update search mock so it returns no results:
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    await renderLibraryCollectionPage(mockCollection.collectionId, libraryId);
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect(screen.getByText('This collection is currently empty.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new/i })).not.toBeInTheDocument();
    expect(screen.getByText('Read Only')).toBeInTheDocument();
  });

  it('show a collection without search results', async () => {
    // Update search mock so it returns no results:
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    await renderLibraryCollectionPage();

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(collectionTitle))[0]).toBeInTheDocument();

    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'noresults' } });

    // Ensure the search endpoint is called again, only once more since the recently modified call
    // should not be impacted by the search
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(2, searchEndpoint, 'post'); });

    expect(screen.getByText('No matching components found in this collections.')).toBeInTheDocument();
  });

  it('should open and close new content sidebar', async () => {
    await renderLibraryCollectionPage();
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect(screen.queryByText(/add content/i)).not.toBeInTheDocument();

    const newButton = screen.getByRole('button', { name: /new/i });
    fireEvent.click(newButton);

    expect(screen.getByText(/add content/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/add content/i)).not.toBeInTheDocument();
  });

  it('should open collection Info by default', async () => {
    await renderLibraryCollectionPage();

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(collectionTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(collectionTitle))[1]).toBeInTheDocument();

    expect(screen.getByText('Manage')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('should close and open Collection Info', async () => {
    await renderLibraryCollectionPage();

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(collectionTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(collectionTitle))[1]).toBeInTheDocument();

    // Open by default; close the library info sidebar
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    expect(screen.queryByText('(Never Published)')).not.toBeInTheDocument();

    // Open library info sidebar with 'Library info' button
    const collectionInfoBtn = screen.getByRole('button', { name: /collection info/i });
    fireEvent.click(collectionInfoBtn);
    expect(screen.getByText('Manage')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('sorts collection components', async () => {
    await renderLibraryCollectionPage();
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    expect(await screen.findByTitle('Sort search results')).toBeInTheDocument();

    const testSortOption = (async (optionText, sortBy, isDefault) => {
      // Open the drop-down menu
      fireEvent.click(screen.getByTitle('Sort search results'));

      // Click the option with the given text
      // Since the sort drop-down also shows the selected sort
      // option in its toggle button, we need to make sure we're
      // clicking on the last one found.
      const options = screen.getAllByText(optionText);
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
      expect(screen.getAllByText(optionText).length).toEqual(isDefault ? 1 : 2);
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
    expect(screen.getAllByText('Recently Modified').length).toEqual(2);

    // Enter a keyword into the search box
    const searchBox = await screen.findByRole('searchbox');
    fireEvent.change(searchBox, { target: { value: 'words to find' } });

    // Default sort option changes to "Most Relevant"
    expect(screen.getAllByText('Most Relevant').length).toEqual(2);
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
    await renderLibraryCollectionPage();

    // Click on the first component. It should appear twice, in both "Recently Modified" and "Components"
    fireEvent.click((await screen.findAllByText(displayName))[0]);

    const sidebar = screen.getByTestId('library-sidebar');

    const { getByRole, getByText } = within(sidebar);

    await waitFor(() => expect(getByText(displayName)).toBeInTheDocument());

    const closeButton = getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());
  });

  it('has an empty type filter when there are no results', async () => {
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    await renderLibraryCollectionPage();
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    const filterButton = screen.getByRole('button', { name: /type/i });
    fireEvent.click(filterButton);

    expect(screen.getByText(/no matching components/i)).toBeInTheDocument();
  });
});
