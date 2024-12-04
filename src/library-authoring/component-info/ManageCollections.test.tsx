import fetchMock from 'fetch-mock-jest';

import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter/types';
import {
  initializeMocks,
  render as baseRender,
  screen,
  waitFor,
} from '../../testUtils';
import mockCollectionsResults from '../__mocks__/collection-search.json';
import { mockContentSearchConfig } from '../../search-manager/data/api.mock';
import { mockContentLibrary, mockLibraryBlockMetadata } from '../data/api.mocks';
import ManageCollections from './ManageCollections';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarProvider } from '../common/context/SidebarContext';
import { getLibraryBlockCollectionsUrl } from '../data/api';

let axiosMock: MockAdapter;
let mockShowToast;

mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
mockContentSearchConfig.applyMock();

const render = (ui: React.ReactElement) => baseRender(ui, {
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={mockContentLibrary.libraryId}>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </LibraryProvider>
  ),
});

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';

describe('<ManageCollections />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
    // The Meilisearch client-side API uses fetch, not Axios.
    fetchMock.mockReset();
    fetchMock.post(searchEndpoint, (_url, req) => {
      const requestData = JSON.parse(req.body?.toString() ?? '');
      const query = requestData?.queries[0]?.q ?? '';
      // We have to replace the query (search keywords) in the mock results with the actual query,
      // because otherwise Instantsearch will update the UI and change the query,
      // leading to unexpected results in the test cases.
      mockCollectionsResults.results[0].query = query;
      // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      mockCollectionsResults.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
      return mockCollectionsResults;
    });
  });

  it('should show all collections in library and allow users to select for the current component ', async () => {
    const url = getLibraryBlockCollectionsUrl(mockLibraryBlockMetadata.usageKeyWithCollections);
    axiosMock.onPatch(url).reply(200);
    render(<ManageCollections
      usageKey={mockLibraryBlockMetadata.usageKeyWithCollections}
      collections={[{ title: 'My first collection', key: 'my-first-collection' }]}
    />);
    const manageBtn = await screen.findByRole('button', { name: 'Manage Collections' });
    userEvent.click(manageBtn);
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    expect(screen.queryByRole('search')).toBeInTheDocument();
    const secondCollection = await screen.findByRole('button', { name: 'My second collection' });
    userEvent.click(secondCollection);
    const confirmBtn = await screen.findByRole('button', { name: 'Confirm' });
    userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(axiosMock.history.patch.length).toEqual(1);
      expect(mockShowToast).toHaveBeenCalledWith('Component collections updated');
      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
        collection_keys: ['my-first-collection', 'my-second-collection'],
      });
    });
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
  });

  it('should show toast and close manage collections selection on failure', async () => {
    const url = getLibraryBlockCollectionsUrl(mockLibraryBlockMetadata.usageKeyWithCollections);
    axiosMock.onPatch(url).reply(400);
    render(<ManageCollections
      usageKey={mockLibraryBlockMetadata.usageKeyWithCollections}
      collections={[]}
    />);
    screen.logTestingPlaygroundURL();
    const manageBtn = await screen.findByRole('button', { name: 'Add to Collection' });
    userEvent.click(manageBtn);
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    expect(screen.queryByRole('search')).toBeInTheDocument();
    const secondCollection = await screen.findByRole('button', { name: 'My second collection' });
    userEvent.click(secondCollection);
    const confirmBtn = await screen.findByRole('button', { name: 'Confirm' });
    userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(axiosMock.history.patch.length).toEqual(1);
      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
        collection_keys: ['my-second-collection'],
      });
      expect(mockShowToast).toHaveBeenCalledWith('Failed to update Component collections');
    });
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
  });

  it('should close manage collections selection on cancel', async () => {
    const url = getLibraryBlockCollectionsUrl(mockLibraryBlockMetadata.usageKeyWithCollections);
    axiosMock.onPatch(url).reply(400);
    render(<ManageCollections
      usageKey={mockLibraryBlockMetadata.usageKeyWithCollections}
      collections={[]}
    />);
    const manageBtn = await screen.findByRole('button', { name: 'Add to Collection' });
    userEvent.click(manageBtn);
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    expect(screen.queryByRole('search')).toBeInTheDocument();
    const secondCollection = await screen.findByRole('button', { name: 'My second collection' });
    userEvent.click(secondCollection);
    const cancelBtn = await screen.findByRole('button', { name: 'Cancel' });
    userEvent.click(cancelBtn);
    await waitFor(() => {
      expect(axiosMock.history.patch.length).toEqual(0);
      expect(mockShowToast).not.toHaveBeenCalled();
    });
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
  });
});
