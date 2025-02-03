import { mockContentSearchConfig, mockSearchResult } from '../../search-manager/data/api.mock';
import {
  fireEvent,
  render as baseRender,
  waitFor,
  screen,
  initializeMocks,
} from '../../testUtils';
import { studioHomeMock } from '../../studio-home/__mocks__';
import { getStudioHomeApiUrl } from '../../studio-home/data/api';
import mockResult from '../__mocks__/library-search.json';
import { LibraryProvider } from '../common/context/LibraryContext';
import { ComponentPicker } from '../component-picker';
import * as api from '../data/api';
import {
  mockContentLibrary,
  mockGetCollectionMetadata,
} from '../data/api.mocks';
import { PickLibraryContentModal } from './PickLibraryContentModal';

mockContentSearchConfig.applyMock();
mockContentLibrary.applyMock();
mockGetCollectionMetadata.applyMock();
mockSearchResult(mockResult);

const { libraryId } = mockContentLibrary;

const onClose = jest.fn();
let mockShowToast: (message: string) => void;

const render = () => baseRender(<PickLibraryContentModal isOpen onClose={onClose} />, {
  path: '/library/:libraryId/collection/:collectionId/*',
  params: { libraryId, collectionId: 'collectionId' },
  extraWrapper: ({ children }) => (
    <LibraryProvider
      libraryId={libraryId}
      componentPicker={ComponentPicker}
    >
      {children}
    </LibraryProvider>
  ),
});

describe('<PickLibraryContentModal />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    mockShowToast = mocks.mockShowToast;
    mocks.axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
  });

  it('can pick components from the modal', async () => {
    const mockAddComponentsToCollection = jest.fn();
    jest.spyOn(api, 'addComponentsToCollection').mockImplementation(mockAddComponentsToCollection);

    render();

    // Wait for the content library to load
    await waitFor(() => {
      expect(screen.getByText('Test Library')).toBeInTheDocument();
      expect(screen.queryAllByText('Introduction to Testing')[0]).toBeInTheDocument();
    });

    // Select the first component
    fireEvent.click(screen.queryAllByRole('button', { name: 'Select' })[0]);
    expect(await screen.findByText('1 Selected Component')).toBeInTheDocument();

    fireEvent.click(screen.queryAllByRole('button', { name: 'Add to Collection' })[0]);

    await waitFor(() => {
      expect(mockAddComponentsToCollection).toHaveBeenCalledWith(
        libraryId,
        'collectionId',
        ['lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd'],
      );
      expect(onClose).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Content linked successfully.');
    });
  });

  it('show error when api call fails', async () => {
    const mockAddComponentsToCollection = jest.fn().mockRejectedValue(new Error('Failed to add components'));
    jest.spyOn(api, 'addComponentsToCollection').mockImplementation(mockAddComponentsToCollection);
    render();

    // Wait for the content library to load
    await waitFor(() => {
      expect(screen.getByText('Test Library')).toBeInTheDocument();
      expect(screen.queryAllByText('Introduction to Testing')[0]).toBeInTheDocument();
    });

    // Select the first component
    fireEvent.click(screen.queryAllByRole('button', { name: 'Select' })[0]);
    expect(await screen.findByText('1 Selected Component')).toBeInTheDocument();

    fireEvent.click(screen.queryAllByRole('button', { name: 'Add to Collection' })[0]);

    await waitFor(() => {
      expect(mockAddComponentsToCollection).toHaveBeenCalledWith(
        libraryId,
        'collectionId',
        ['lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd'],
      );
      expect(onClose).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('There was an error linking the content to this collection.');
    });
  });
});
