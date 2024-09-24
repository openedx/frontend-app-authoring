import type MockAdapter from 'axios-mock-adapter';
import fetchMock from 'fetch-mock-jest';
import { cloneDeep } from 'lodash';

import { SearchContextProvider } from '../../search-manager';
import { mockContentSearchConfig, mockSearchResult } from '../../search-manager/data/api.mock';
import { type CollectionHit, formatSearchHit } from '../../search-manager/data/api';
import {
  initializeMocks,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '../../testUtils';
import mockResult from '../__mocks__/collection-search.json';
import * as api from '../data/api';
import { mockContentLibrary } from '../data/api.mocks';
import CollectionDetails from './CollectionDetails';

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';

let axiosMock: MockAdapter;
let mockShowToast: (message: string) => void;

mockContentSearchConfig.applyMock();
const library = mockContentLibrary.libraryData;

describe('<CollectionDetails />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
    fetchMock.mockReset();
  });

  const renderCollectionDetails = async () => {
    const collectionData: CollectionHit = formatSearchHit(mockResult.results[2].hits[0]) as CollectionHit;

    render((
      <SearchContextProvider>
        <CollectionDetails library={library} collection={collectionData} />
      </SearchContextProvider>
    ));

    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
  };

  it('should render Collection Details', async () => {
    mockSearchResult(mockResult);
    await renderCollectionDetails();

    // Collection Description
    expect(screen.getByText('Description / Card Preview Text')).toBeInTheDocument();
    const { description } = mockResult.results[2].hits[0];
    expect(screen.getByText(description)).toBeInTheDocument();

    // Collection History
    expect(screen.getByText('Collection History')).toBeInTheDocument();
    // Modified date
    expect(screen.getByText('September 20, 2024')).toBeInTheDocument();
    // Created date
    expect(screen.getByText('September 19, 2024')).toBeInTheDocument();
  });

  it('should allow modifying the description', async () => {
    mockSearchResult(mockResult);
    await renderCollectionDetails();

    const {
      description: originalDescription,
      block_id: blockId,
      context_key: contextKey,
    } = mockResult.results[2].hits[0];

    expect(screen.getByText(originalDescription)).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(contextKey, blockId);
    axiosMock.onPatch(url).reply(200);

    const textArea = screen.getByRole('textbox');

    // Change the description to the same value
    fireEvent.focus(textArea);
    fireEvent.change(textArea, { target: { value: originalDescription } });
    fireEvent.blur(textArea);

    await waitFor(() => {
      expect(axiosMock.history.patch).toHaveLength(0);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    // Change the description to a new value
    fireEvent.focus(textArea);
    fireEvent.change(textArea, { target: { value: 'New description' } });
    fireEvent.blur(textArea);

    await waitFor(() => {
      expect(axiosMock.history.patch).toHaveLength(1);
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ description: 'New description' }));
      expect(mockShowToast).toHaveBeenCalledWith('Collection updated successfully.');
    });
  });

  it('should show error while modifing the description', async () => {
    mockSearchResult(mockResult);
    await renderCollectionDetails();

    const {
      description: originalDescription,
      block_id: blockId,
      context_key: contextKey,
    } = mockResult.results[2].hits[0];

    expect(screen.getByText(originalDescription)).toBeInTheDocument();

    const url = api.getLibraryCollectionApiUrl(contextKey, blockId);
    axiosMock.onPatch(url).reply(500);

    const textArea = screen.getByRole('textbox');

    // Change the description to a new value
    fireEvent.focus(textArea);
    fireEvent.change(textArea, { target: { value: 'New description' } });
    fireEvent.blur(textArea);

    await waitFor(() => {
      expect(axiosMock.history.patch).toHaveLength(1);
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ description: 'New description' }));
      expect(mockShowToast).toHaveBeenCalledWith('Failed to update collection.');
    });
  });

  it('should render Collection stats', async () => {
    mockSearchResult(mockResult);
    await renderCollectionDetails();

    expect(screen.getByText('Collection Stats')).toBeInTheDocument();
    expect(await screen.findByText('Total')).toBeInTheDocument();

    [
      { blockType: 'Total', count: 5 },
      { blockType: 'Text', count: 4 },
      { blockType: 'Problem', count: 1 },
    ].forEach(({ blockType, count }) => {
      const blockCount = screen.getByText(blockType).closest('div') as HTMLDivElement;
      expect(within(blockCount).getByText(count.toString())).toBeInTheDocument();
    });
  });

  it('should render Collection stats for empty collection', async () => {
    const mockResultCopy = cloneDeep(mockResult);
    mockResultCopy.results[1].facetDistribution.block_type = {};
    mockSearchResult(mockResultCopy);
    await renderCollectionDetails();

    expect(screen.getByText('Collection Stats')).toBeInTheDocument();
    expect(await screen.findByText('This collection is currently empty.')).toBeInTheDocument();
  });

  it('should render Collection stats for big collection', async () => {
    const mockResultCopy = cloneDeep(mockResult);
    mockResultCopy.results[1].facetDistribution.block_type = {
      annotatable: 1,
      chapter: 2,
      discussion: 3,
      drag_and_drop_v2: 4,
      html: 5,
      library_content: 6,
      openassessment: 7,
      problem: 8,
      sequential: 9,
      vertical: 10,
      video: 11,
      choiceresponse: 12,
    };
    mockSearchResult(mockResultCopy);
    await renderCollectionDetails();

    expect(screen.getByText('Collection Stats')).toBeInTheDocument();
    expect(await screen.findByText('78')).toBeInTheDocument();

    [
      { blockType: 'Total', count: 78 },
      { blockType: 'Multiple Choice', count: 12 },
      { blockType: 'Video', count: 11 },
      { blockType: 'Unit', count: 10 },
      { blockType: 'Other', count: 45 },
    ].forEach(({ blockType, count }) => {
      const blockCount = screen.getByText(blockType).closest('div') as HTMLDivElement;
      expect(within(blockCount).getByText(count.toString())).toBeInTheDocument();
    });
  });
});
