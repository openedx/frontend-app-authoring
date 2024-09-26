import type MockAdapter from 'axios-mock-adapter';
import fetchMock from 'fetch-mock-jest';

import { mockContentSearchConfig, mockGetBlockTypes } from '../../search-manager/data/api.mock';
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

let axiosMock: MockAdapter;
let mockShowToast: (message: string) => void;

mockContentSearchConfig.applyMock();
mockGetBlockTypes.applyMock();

const library = mockContentLibrary.libraryData;
const collectionHit = formatSearchHit(mockResult.results[2].hits[0]) as CollectionHit;

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

  it('should render Collection Details', async () => {
    render(<CollectionDetails library={library} collection={collectionHit} />);

    // Collection Description
    expect(screen.getByText('Description / Card Preview Text')).toBeInTheDocument();
    const { description } = collectionHit;
    expect(screen.getByText(description)).toBeInTheDocument();

    // Collection History
    expect(screen.getByText('Collection History')).toBeInTheDocument();
    // Modified date
    expect(screen.getByText('September 20, 2024')).toBeInTheDocument();
    // Created date
    expect(screen.getByText('September 19, 2024')).toBeInTheDocument();
  });

  it('should allow modifying the description', async () => {
    render(<CollectionDetails library={library} collection={collectionHit} />);

    const {
      description: originalDescription,
      blockId,
      contextKey,
    } = collectionHit;

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
    render(<CollectionDetails library={library} collection={collectionHit} />);

    const {
      description: originalDescription,
      blockId,
      contextKey,
    } = collectionHit;

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
    mockGetBlockTypes('someBlocks');
    render(<CollectionDetails library={library} collection={collectionHit} />);

    expect(screen.getByText('Collection Stats')).toBeInTheDocument();
    expect(await screen.findByText('Total')).toBeInTheDocument();

    [
      { blockType: 'Total', count: 3 },
      { blockType: 'Text', count: 2 },
      { blockType: 'Problem', count: 1 },
    ].forEach(({ blockType, count }) => {
      const blockCount = screen.getByText(blockType).closest('div') as HTMLDivElement;
      expect(within(blockCount).getByText(count.toString())).toBeInTheDocument();
    });
  });

  it('should render Collection stats for empty collection', async () => {
    mockGetBlockTypes('noBlocks');
    render(<CollectionDetails library={library} collection={collectionHit} />);

    expect(screen.getByText('Collection Stats')).toBeInTheDocument();
    expect(await screen.findByText('This collection is currently empty.')).toBeInTheDocument();
  });

  it('should render Collection stats for big collection', async () => {
    mockGetBlockTypes('moreBlocks');
    render(<CollectionDetails library={library} collection={collectionHit} />);

    expect(screen.getByText('Collection Stats')).toBeInTheDocument();
    expect(await screen.findByText('36')).toBeInTheDocument();

    [
      { blockType: 'Total', count: 36 },
      { blockType: 'Video', count: 8 },
      { blockType: 'Problem', count: 7 },
      { blockType: 'Text', count: 6 },
      { blockType: 'Other', count: 15 },
    ].forEach(({ blockType, count }) => {
      const blockCount = screen.getByText(blockType).closest('div') as HTMLDivElement;
      expect(within(blockCount).getByText(count.toString())).toBeInTheDocument();
    });
  });
});
