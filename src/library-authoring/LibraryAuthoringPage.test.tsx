import { getConfig } from '@edx/frontend-platform';
import fetchMock from 'fetch-mock-jest';
import { Helmet } from 'react-helmet';
import {
  fireEvent,
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '../testUtils';
import mockResult from './__mocks__/library-search.json';
import mockEmptyResult from '../search-modal/__mocks__/empty-search-result.json';
import {
  mockContentLibrary,
  mockGetCollectionMetadata,
  mockLibraryBlockTypes,
  mockXBlockFields,
} from './data/api.mocks';
import { mockContentSearchConfig } from '../search-manager/data/api.mock';
import { mockBroadcastChannel } from '../generic/data/api.mock';
import { LibraryLayout } from '.';
import { getLibraryCollectionsApiUrl } from './data/api';

mockGetCollectionMetadata.applyMock();
mockContentSearchConfig.applyMock();
mockContentLibrary.applyMock();
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
  mockEmptyResult.results[2].query = query;
  // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  mockEmptyResult.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  mockEmptyResult.results[2]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
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
  newMockResult.results[2].hits = mockResult.results[2]?.hits.slice(0, 2);
  newMockResult.results[0].estimatedTotalHits = 2;
  newMockResult.results[2].estimatedTotalHits = 2;
  // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  newMockResult.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  newMockResult.results[2]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
  return newMockResult;
};

const path = '/library/:libraryId/*';
const libraryTitle = mockContentLibrary.libraryData.title;

describe('<LibraryAuthoringPage />', () => {
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

  const renderLibraryPage = async () => {
    render(<LibraryLayout />, { path, params: { libraryId: mockContentLibrary.libraryId } });

    // Ensure the search endpoint is called:
    // Call 1: To fetch searchable/filterable/sortable library data
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
  };

  it('shows the spinner before the query is complete', () => {
    // This mock will never return data about the library (it loads forever):
    const libraryId = mockContentLibrary.libraryIdThatNeverLoads;
    render(<LibraryLayout />, { path, params: { libraryId } });
    const spinner = screen.getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows an error component if no library returned', async () => {
    // This mock will simulate a 404 error:
    const libraryId = mockContentLibrary.library404;
    render(<LibraryLayout />, { path, params: { libraryId } });
    expect(await screen.findByTestId('notFoundAlert')).toBeInTheDocument();
  });

  it('shows library data', async () => {
    await renderLibraryPage();

    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    const browserTabTitle = Helmet.peek().title.join('');
    const siteName = getConfig().SITE_NAME;
    expect(browserTabTitle).toEqual(`${libraryTitle} | ${siteName}`);

    expect(screen.queryByText('You have not added any content to this library yet.')).not.toBeInTheDocument();

    // "Recently Modified" header + sort shown
    expect(screen.getAllByText('Recently Modified').length).toEqual(2);
    expect(screen.getByText('Collections (6)')).toBeInTheDocument();
    expect(screen.getByText('Components (10)')).toBeInTheDocument();
    expect((await screen.findAllByText('Introduction to Testing'))[0]).toBeInTheDocument();

    // Navigate to the components tab
    fireEvent.click(screen.getByRole('tab', { name: 'Components' }));
    // "Recently Modified" default sort shown
    expect(screen.getAllByText('Recently Modified').length).toEqual(1);
    expect(screen.queryByText('Collections (6)')).not.toBeInTheDocument();
    expect(screen.queryByText('Components (10)')).not.toBeInTheDocument();

    // Navigate to the collections tab
    fireEvent.click(screen.getByRole('tab', { name: 'Collections' }));
    // "Recently Modified" default sort shown
    expect(screen.getAllByText('Recently Modified').length).toEqual(1);
    expect(screen.queryByText('Collections (6)')).not.toBeInTheDocument();
    expect(screen.queryByText('Components (10)')).not.toBeInTheDocument();
    expect(screen.queryByText('There are 10 components in this library')).not.toBeInTheDocument();
    expect((await screen.findAllByText('Collection 1'))[0]).toBeInTheDocument();

    // Go back to Home tab
    // This step is necessary to avoid the url change leak to other tests
    fireEvent.click(screen.getByRole('tab', { name: 'Home' }));
    // "Recently Modified" header + sort shown
    expect(screen.getAllByText('Recently Modified').length).toEqual(2);
    expect(screen.getByText('Collections (6)')).toBeInTheDocument();
    expect(screen.getByText('Components (10)')).toBeInTheDocument();
  });

  it('shows a library without components and collections', async () => {
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    await renderLibraryPage();

    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Collections' }));
    expect(screen.getByText('You have not added any collection to this library yet.')).toBeInTheDocument();

    // Open Create collection modal
    const addCollectionButton = screen.getByRole('button', { name: /add collection/i });
    fireEvent.click(addCollectionButton);
    const collectionModalHeading = await screen.findByRole('heading', { name: /new collection/i });
    expect(collectionModalHeading).toBeInTheDocument();

    // Click on Cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(collectionModalHeading).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Home' }));
    expect(screen.getByText('You have not added any content to this library yet.')).toBeInTheDocument();

    const addComponentButton = screen.getByRole('button', { name: /add component/i });
    fireEvent.click(addComponentButton);
    expect(screen.getByText(/add content/i)).toBeInTheDocument();
  });

  it('shows the new content button', async () => {
    await renderLibraryPage();

    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(screen.queryByText('Read Only')).not.toBeInTheDocument();
  });

  it('shows an empty read-only library, without a "create component" button', async () => {
    // Use a library mock that is read-only:
    const libraryId = mockContentLibrary.libraryIdReadOnly;
    // Update search mock so it returns no results:
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    render(<LibraryLayout />, { path, params: { libraryId } });
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect(screen.getByText('You have not added any content to this library yet.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add component/i })).not.toBeInTheDocument();
    expect(screen.getByText('Read Only')).toBeInTheDocument();
  });

  it('show a library without search results', async () => {
    // Update search mock so it returns no results:
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    await renderLibraryPage();

    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'noresults' } });

    // Ensure the search endpoint is called again, only once more since the recently modified call
    // should not be impacted by the search
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(2, searchEndpoint, 'post'); });

    expect(screen.getByText('No matching components found in this library.')).toBeInTheDocument();

    // Navigate to the components tab
    fireEvent.click(screen.getByRole('tab', { name: 'Components' }));
    expect(screen.getByText('No matching components found in this library.')).toBeInTheDocument();

    // Navigate to the collections tab
    fireEvent.click(screen.getByRole('tab', { name: 'Collections' }));
    expect(screen.getByText('No matching collections found in this library.')).toBeInTheDocument();

    // Go back to Home tab
    // This step is necessary to avoid the url change leak to other tests
    fireEvent.click(screen.getByRole('tab', { name: 'Home' }));
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
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[1]).toBeInTheDocument();

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('(Never Published)')).toBeInTheDocument();
    // Draft saved on date:
    expect(screen.getByText('July 22, 2024')).toBeInTheDocument();

    expect(screen.getByText(mockContentLibrary.libraryData.org)).toBeInTheDocument();
    // Updated:
    expect(screen.getByText('July 20, 2024')).toBeInTheDocument();
    // Created:
    expect(screen.getByText('June 26, 2024')).toBeInTheDocument();
  });

  it('should close and open Library Info', async () => {
    await renderLibraryPage();

    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[1]).toBeInTheDocument();

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

    // Close library info sidebar with 'Library info' button
    fireEvent.click(libraryInfoButton);
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    expect(screen.queryByText('(Never Published)')).not.toBeInTheDocument();
  });

  it('show the "View All" button when viewing library with many components', async () => {
    await renderLibraryPage();

    expect(screen.getByText('Content library')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    // "Recently Modified" header + sort shown
    await waitFor(() => { expect(screen.getAllByText('Recently Modified').length).toEqual(2); });
    expect(screen.getByText('Collections (6)')).toBeInTheDocument();
    expect(screen.getByText('Components (10)')).toBeInTheDocument();
    expect(screen.getAllByText('Introduction to Testing')[0]).toBeInTheDocument();
    expect(screen.queryByText('You have not added any content to this library yet.')).not.toBeInTheDocument();

    // There should be two "View All" button, since the Components and Collections count
    // are above the preview limit (4)
    expect(screen.getAllByText('View All').length).toEqual(2);

    // Clicking on first "View All" button should navigate to the Collections tab
    fireEvent.click(screen.getAllByText('View All')[0]);
    // "Recently Modified" default sort shown
    expect(screen.getAllByText('Recently Modified').length).toEqual(1);
    expect(screen.queryByText('Collections (6)')).not.toBeInTheDocument();
    expect(screen.queryByText('Components (10)')).not.toBeInTheDocument();
    expect(screen.getByText('Collection 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Home' }));
    // Clicking on second "View All" button should navigate to the Components tab
    fireEvent.click(screen.getAllByText('View All')[1]);
    // "Recently Modified" default sort shown
    expect(screen.getAllByText('Recently Modified').length).toEqual(1);
    expect(screen.queryByText('Collections (6)')).not.toBeInTheDocument();
    expect(screen.queryByText('Components (10)')).not.toBeInTheDocument();
    expect(screen.getAllByText('Introduction to Testing')[0]).toBeInTheDocument();

    // Go back to Home tab
    // This step is necessary to avoid the url change leak to other tests
    fireEvent.click(screen.getByRole('tab', { name: 'Home' }));
    // "Recently Modified" header + sort shown
    expect(screen.getAllByText('Recently Modified').length).toEqual(2);
    expect(screen.getByText('Collections (6)')).toBeInTheDocument();
    expect(screen.getByText('Components (10)')).toBeInTheDocument();
  });

  it('should not show the "View All" button when viewing library with low number of components', async () => {
    fetchMock.post(searchEndpoint, returnLowNumberResults, { overwriteRoutes: true });
    await renderLibraryPage();

    expect(screen.getByText('Content library')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    // "Recently Modified" header + sort shown
    await waitFor(() => { expect(screen.getAllByText('Recently Modified').length).toEqual(2); });
    expect(screen.getByText('Collections (2)')).toBeInTheDocument();
    expect(screen.getByText('Components (2)')).toBeInTheDocument();
    expect(screen.getAllByText('Introduction to Testing')[0]).toBeInTheDocument();
    expect(screen.queryByText('You have not added any content to this library yet.')).not.toBeInTheDocument();

    // There should not be any "View All" button on page since Components count
    // is less than the preview limit (4)
    expect(screen.queryByText('View All')).not.toBeInTheDocument();
  });

  it('sorts library components', async () => {
    await renderLibraryPage();

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
    expect(screen.getAllByText('Recently Modified').length).toEqual(3);

    // Enter a keyword into the search box
    const searchBox = screen.getByRole('searchbox');
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
    await renderLibraryPage();

    // Click on the first component. It should appear twice, in both "Recently Modified" and "Components"
    fireEvent.click((await screen.findAllByText(displayName))[0]);

    const sidebar = screen.getByTestId('library-sidebar');

    const { getByRole, getByText } = within(sidebar);

    await waitFor(() => expect(getByText(displayName)).toBeInTheDocument());

    const closeButton = getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());
  });

  it('should open and close the collection sidebar', async () => {
    await renderLibraryPage();

    // Click on the first component. It could appear twice, in both "Recently Modified" and "Collections"
    fireEvent.click((await screen.findAllByText('Collection 1'))[0]);

    const sidebar = screen.getByTestId('library-sidebar');

    const { getByRole, getByText } = within(sidebar);

    // The mock data for the sidebar has a title of "Test Collection"
    await waitFor(() => expect(getByText('Test Collection')).toBeInTheDocument());

    const closeButton = getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());
  });

  it('can filter by capa problem type', async () => {
    const problemTypes = {
      'Multiple Choice': 'choiceresponse',
      Checkboxes: 'multiplechoiceresponse',
      'Numerical Input': 'numericalresponse',
      Dropdown: 'optionresponse',
      'Text Input': 'stringresponse',
    };

    await renderLibraryPage();

    // Ensure the search endpoint is called
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    const filterButton = screen.getByRole('button', { name: /type/i });
    fireEvent.click(filterButton);

    const problemFilterCheckbox = screen.getByRole('checkbox', { name: /problem/i });
    const problemFilterMenuItem = problemFilterCheckbox.parentElement; // div.pgn__menu-item
    const showProbTypesSubmenuBtn = problemFilterMenuItem!.querySelector('button[aria-label="Open problem types filters"]');
    expect(showProbTypesSubmenuBtn).not.toBeNull();
    fireEvent.click(showProbTypesSubmenuBtn!);

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

  it('has an empty type filter when there are no results', async () => {
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    await renderLibraryPage();

    const filterButton = screen.getByRole('button', { name: /type/i });
    fireEvent.click(filterButton);

    expect(screen.getByText(/no matching components/i)).toBeInTheDocument();
  });

  it('should create a collection', async () => {
    await renderLibraryPage();
    const title = 'This is a Test';
    const description = 'This is the description of the Test';
    const url = getLibraryCollectionsApiUrl(mockContentLibrary.libraryId);
    const { axiosMock } = initializeMocks();
    axiosMock.onPost(url).reply(200, {
      id: '1',
      slug: 'this-is-a-test',
      title,
      description,
    });

    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(screen.queryByText(/add content/i)).not.toBeInTheDocument();

    // Open Add content sidebar
    const newButton = screen.getByRole('button', { name: /new/i });
    fireEvent.click(newButton);
    expect(screen.getByText(/add content/i)).toBeInTheDocument();

    // Open New collection Modal
    const newCollectionButton = screen.getAllByRole('button', { name: /collection/i })[4];
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
    await renderLibraryPage();

    const title = 'This is a Test';
    const description = 'This is the description of the Test';
    const url = getLibraryCollectionsApiUrl(mockContentLibrary.libraryId);
    const { axiosMock } = initializeMocks();
    axiosMock.onPost(url).reply(200, {
      id: '1',
      slug: 'this-is-a-test',
      title,
      description,
    });

    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(screen.queryByText(/add content/i)).not.toBeInTheDocument();

    // Open Add content sidebar
    const newButton = screen.getByRole('button', { name: /new/i });
    fireEvent.click(newButton);
    expect(screen.getByText(/add content/i)).toBeInTheDocument();

    // Open New collection Modal
    const newCollectionButton = screen.getAllByRole('button', { name: /collection/i })[4];
    fireEvent.click(newCollectionButton);
    const collectionModalHeading = await screen.findByRole('heading', { name: /new collection/i });
    expect(collectionModalHeading).toBeInTheDocument();

    const nameField = screen.getByRole('textbox', { name: /name your collection/i });
    fireEvent.focus(nameField);
    fireEvent.blur(nameField);

    // Click on create with an empty name
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);

    expect(await screen.findByText(/collection name is required/i)).toBeInTheDocument();
  });

  it('should show error on create collection', async () => {
    await renderLibraryPage();
    const title = 'This is a Test';
    const description = 'This is the description of the Test';
    const url = getLibraryCollectionsApiUrl(mockContentLibrary.libraryId);
    const { axiosMock } = initializeMocks();
    axiosMock.onPost(url).reply(500);

    expect(await screen.findByRole('heading')).toBeInTheDocument();
    expect(screen.queryByText(/add content/i)).not.toBeInTheDocument();

    // Open Add content sidebar
    const newButton = screen.getByRole('button', { name: /new/i });
    fireEvent.click(newButton);
    expect(screen.getByText(/add content/i)).toBeInTheDocument();

    // Open New collection Modal
    const newCollectionButton = screen.getAllByRole('button', { name: /collection/i })[4];
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
  });

  it('shows both components and collections in recently modified section', async () => {
    await renderLibraryPage();

    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    // "Recently Modified" header + sort shown
    expect(screen.getAllByText('Recently Modified').length).toEqual(2);
    const recentModifiedContainer = (await screen.findAllByText('Recently Modified'))[1].parentElement?.parentElement?.parentElement;
    expect(recentModifiedContainer).toBeTruthy();

    const container = within(recentModifiedContainer!);
    expect(container.queryAllByText('Text').length).toBeGreaterThan(0);
    expect(container.queryAllByText('Collection').length).toBeGreaterThan(0);
  });
});
