import fetchMock from 'fetch-mock-jest';
import { cloneDeep } from 'lodash';
import MockAdapter from 'axios-mock-adapter/types';

import {
  fireEvent,
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '../../testUtils';
import mockResult from '../__mocks__/collection-search.json';
import {
  mockContentLibrary,
  mockXBlockFields,
  mockGetCollectionMetadata,
} from '../data/api.mocks';
import { mockContentSearchConfig, mockGetBlockTypes } from '../../search-manager/data/api.mock';
import { mockBroadcastChannel, mockClipboardEmpty } from '../../generic/data/api.mock';
import { LibraryLayout } from '..';
import { ContentTagsDrawer } from '../../content-tags-drawer';
import { getLibraryCollectionComponentApiUrl } from '../data/api';

let axiosMock: MockAdapter;
let mockShowToast;

mockClipboardEmpty.applyMock();
mockGetCollectionMetadata.applyMock();
mockContentSearchConfig.applyMock();
mockGetBlockTypes.applyMock();
mockContentLibrary.applyMock();
mockXBlockFields.applyMock();
mockBroadcastChannel();

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';
const path = '/library/:libraryId/*';
const libraryTitle = mockContentLibrary.libraryData.title;
const mockCollection = {
  collectionId: mockResult.results[0].hits[5].block_id,
  collectionNeverLoads: mockGetCollectionMetadata.collectionIdLoading,
  collectionNoComponents: 'collection-no-components',
  collectionEmpty: mockGetCollectionMetadata.collectionIdError,
};

const { title } = mockGetCollectionMetadata.collectionData;
jest.mock('../../content-tags-drawer/ContentTagsDrawer', () => jest.fn(() => <div>Mocked ContentTagsDrawer</div>));

describe('<LibraryCollectionPage />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
    fetchMock.mockReset();

    // The Meilisearch client-side API uses fetch, not Axios.
    fetchMock.post(searchEndpoint, (_url, req) => {
      const requestData = JSON.parse(req.body?.toString() ?? '');
      const query = requestData?.queries[0]?.q ?? '';
      const mockResultCopy = cloneDeep(mockResult);
      // We have to replace the query (search keywords) in the mock results with the actual query,
      // because otherwise Instantsearch will update the UI and change the query,
      // leading to unexpected results in the test cases.
      mockResultCopy.results[0].query = query;
      // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      mockResultCopy.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
      const collectionQueryId = requestData?.queries[0]?.filter?.[2]?.split('collections.key = "')[1].split('"')[0];
      switch (collectionQueryId) {
        case mockCollection.collectionNeverLoads:
          return new Promise<any>(() => {});
        case mockCollection.collectionEmpty:
          mockResultCopy.results[0].hits = [];
          mockResultCopy.results[0].totalHits = 0;
          break;
        case mockCollection.collectionNoComponents:
          mockResultCopy.results[0].hits = [];
          mockResultCopy.results[0].totalHits = 0;
          mockResultCopy.results[1].facetDistribution.block_type = {};
          break;
        default:
          break;
      }
      return mockResultCopy;
    });
  });

  const renderLibraryCollectionPage = async (collectionId?: string, libraryId?: string) => {
    const libId = libraryId || mockContentLibrary.libraryId;
    const colId = collectionId || mockCollection.collectionId;
    render(<LibraryLayout />, {
      path,
      routerProps: {
        initialEntries: [`/library/${libId}/collection/${colId}`],
      },
    });

    if (![mockCollection.collectionNeverLoads, mockCollection.collectionEmpty].includes(colId)) {
      await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    }
  };

  it('shows the spinner before the query is complete', async () => {
    // This mock will never return data about the collection (it loads forever):
    await renderLibraryCollectionPage(mockCollection.collectionNeverLoads);
    const spinner = screen.getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows an error component if no collection returned', async () => {
    // This mock will simulate incorrect collection id
    await renderLibraryCollectionPage(mockCollection.collectionEmpty);
    expect(await screen.findByText(/Mocked request failed with status code 404./)).toBeInTheDocument();
  });

  it('shows collection data', async () => {
    await renderLibraryCollectionPage();
    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(title))[0]).toBeInTheDocument();

    // "Recently Modified" sort shown
    expect(screen.getAllByText('Recently Modified').length).toEqual(1);

    expect((await screen.findAllByText('Introduction to Testing'))[0]).toBeInTheDocument();
    // Content header with count
    expect(await screen.findByText('Content (5)')).toBeInTheDocument();
  });

  it('shows a collection without associated components', async () => {
    await renderLibraryCollectionPage(mockCollection.collectionNoComponents);

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(title))[0]).toBeInTheDocument();

    expect(screen.getAllByText('This collection is currently empty.').length).toEqual(2);

    const addComponentButton = screen.getAllByRole('button', { name: /new/i })[1];
    fireEvent.click(addComponentButton);
    expect(screen.getByText(/add content/i)).toBeInTheDocument();
  });

  it('shows the new content button', async () => {
    await renderLibraryCollectionPage();

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect(await screen.findByText('Content (5)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(screen.queryByText('Read Only')).not.toBeInTheDocument();
  });

  it('shows an empty read-only library collection, with the new button disabled', async () => {
    // Use a library mock that is read-only:
    const libraryId = mockContentLibrary.libraryIdReadOnly;
    // Update search mock so it returns no results:
    await renderLibraryCollectionPage(mockCollection.collectionNoComponents, libraryId);

    expect(await screen.findByText('All Collections')).toBeInTheDocument();

    // Show in the collection page and in the sidebar
    expect(screen.getAllByText('This collection is currently empty.').length).toEqual(2);

    expect(screen.queryByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new/i })).toBeDisabled();
    expect(screen.getByText('Read Only')).toBeInTheDocument();
  });

  it('show a collection without search results', async () => {
    // Update search mock so it returns no results:
    await renderLibraryCollectionPage(mockCollection.collectionNoComponents);

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(title))[0]).toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'noresults' } });

    // Ensure the search endpoint is called again, only once more since the recently modified call
    // should not be impacted by the search
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(2, searchEndpoint, 'post'); });

    expect(screen.queryByText('No matching components found in this collection.')).toBeInTheDocument();
  });

  it('should open and close new content sidebar', async () => {
    await renderLibraryCollectionPage();

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
    const expectedCollectionUsageKey = 'lib-collection:Axim:TEST:my-first-collection';

    await renderLibraryCollectionPage();

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(title))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(title))[1]).toBeInTheDocument();

    expect(screen.getByText('Manage')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Mocked ContentTagsDrawer')).toBeInTheDocument();
    expect(ContentTagsDrawer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expectedCollectionUsageKey,
      }),
      {},
    );
  });

  it('should close and open Collection Info', async () => {
    const expectedCollectionUsageKey = 'lib-collection:Axim:TEST:my-first-collection';

    await renderLibraryCollectionPage();

    expect(await screen.findByText('All Collections')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(title))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(title))[1]).toBeInTheDocument();

    const collectionInfoBtn = screen.getByRole('button', { name: /collection info/i });

    // Open by default; click 'Collection info' button to close
    fireEvent.click(collectionInfoBtn);
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    expect(screen.queryByText('(Never Published)')).not.toBeInTheDocument();

    // Open library info sidebar with 'Collection info' button
    fireEvent.click(collectionInfoBtn);
    expect(screen.getByText('Manage')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Mocked ContentTagsDrawer')).toBeInTheDocument();
    expect(ContentTagsDrawer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expectedCollectionUsageKey,
      }),
      {},
    );
  });

  it('sorts collection components', async () => {
    await renderLibraryCollectionPage();

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

    fireEvent.click((await screen.findAllByText(displayName))[0]);

    const sidebar = screen.getByTestId('library-sidebar');

    const { getByRole, getByText } = within(sidebar);

    await waitFor(() => expect(getByText(displayName)).toBeInTheDocument());

    const closeButton = getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());
  });

  it('has an empty type filter when there are no results', async () => {
    await renderLibraryCollectionPage(mockCollection.collectionNoComponents);

    const filterButton = screen.getByRole('button', { name: /type/i });
    fireEvent.click(filterButton);

    expect(screen.getByText(/no matching components/i)).toBeInTheDocument();
  });

  it('should remove component from collection and hides sidebar', async () => {
    const url = getLibraryCollectionComponentApiUrl(
      mockContentLibrary.libraryId,
      mockCollection.collectionId,
    );
    axiosMock.onDelete(url).reply(204);
    const displayName = 'Introduction to Testing';
    await renderLibraryCollectionPage();

    // open sidebar
    fireEvent.click(await screen.findByText(displayName));
    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).toBeInTheDocument());

    const menuBtns = await screen.findAllByRole('button', { name: 'Component actions menu' });
    // open menu
    fireEvent.click(menuBtns[0]);

    fireEvent.click(await screen.findByText('Remove from collection'));
    await waitFor(() => {
      expect(axiosMock.history.delete.length).toEqual(1);
      expect(mockShowToast).toHaveBeenCalledWith('Component successfully removed');
    });
    // Should close sidebar as component was removed
    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());
  });
});
