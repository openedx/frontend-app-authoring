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

const mockAddItemsToCollection = jest.fn();
const mockAddComponentsToContainer = jest.fn();
jest.spyOn(api, 'addItemsToCollection').mockImplementation(mockAddItemsToCollection);
jest.spyOn(api, 'addComponentsToContainer').mockImplementation(mockAddComponentsToContainer);
const unitId = 'lct:Axim:TEST:unit:test-unit-1';
const sectionId = 'lct:Axim:TEST:section:test-section-1';
const subsectionId = 'lct:Axim:TEST:subsection:test-subsection-1';
type ContextType = 'collection' | 'unit' | 'section' | 'subsection';

const getIdFromContext = (context: ContextType) => {
  switch (context) {
    case 'section':
      return sectionId;
    case 'subsection':
      return subsectionId;
    case 'unit':
      return unitId;
    default:
      return '';
  }
};

const render = (context: ContextType) => baseRender(
  <PickLibraryContentModal isOpen onClose={onClose} />,
  {
    path: `/library/:libraryId/${context}/:${context === 'collection' ? context : 'container' }Id/*`,
    params: {
      libraryId,
      ...(context === 'collection' && { collectionId: 'collectionId' }),
      ...(context === 'unit' && { containerId: unitId }),
      ...(context === 'section' && { containerId: sectionId }),
      ...(context === 'subsection' && { containerId: subsectionId }),
    },
    extraWrapper: ({ children }) => (
      <LibraryProvider
        libraryId={libraryId}
        componentPicker={ComponentPicker}
      >
        {children}
      </LibraryProvider>
    ),
  },
);

describe('<PickLibraryContentModal />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    mockShowToast = mocks.mockShowToast;
    mocks.axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    jest.clearAllMocks();
  });

  [
    'collection' as const,
    'unit' as const,
    'section' as const,
    'subsection' as const,
  ].forEach((context) => {
    it(`can pick components from the modal (${context})`, async () => {
      render(context);

      // Wait for the content library to load
      await waitFor(() => {
        expect(screen.getByText('Test Library')).toBeInTheDocument();
        expect(screen.queryAllByText('Introduction to Testing')[0]).toBeInTheDocument();
      });

      // Select the first component
      fireEvent.click(screen.queryAllByRole('button', { name: 'Select' })[0]);
      expect(await screen.findByText('1 Selected Component')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /add to .*/i }));

      await waitFor(() => {
        switch (context) {
          case 'collection':
            expect(mockAddItemsToCollection).toHaveBeenCalledWith(
              libraryId,
              'collectionId',
              ['lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd'],
            );
            break;
          case 'unit':
          case 'section':
          case 'subsection':
            expect(mockAddComponentsToContainer).toHaveBeenCalledWith(
              getIdFromContext(context),
              ['lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd'],
            );
            break;
          default:
            break;
        }
      });
      expect(onClose).toHaveBeenCalled();
      const text = context === 'collection'
        ? 'Content added to collection.'
        : 'Content linked successfully.';
      expect(mockShowToast).toHaveBeenCalledWith(text);
    });

    it(`show error when api call fails (${context})`, async () => {
      if (context === 'collection') {
        mockAddItemsToCollection.mockRejectedValueOnce(new Error('Error'));
      } else {
        mockAddComponentsToContainer.mockRejectedValueOnce(new Error('Error'));
      }
      render(context);

      // Wait for the content library to load
      await waitFor(() => {
        expect(screen.getByText('Test Library')).toBeInTheDocument();
        expect(screen.queryAllByText('Introduction to Testing')[0]).toBeInTheDocument();
      });

      // Select the first component
      fireEvent.click(screen.queryAllByRole('button', { name: 'Select' })[0]);
      expect(await screen.findByText('1 Selected Component')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /add to .*/i }));

      await waitFor(() => {
        switch (context) {
          case 'collection':
            expect(mockAddItemsToCollection).toHaveBeenCalledWith(
              libraryId,
              'collectionId',
              ['lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd'],
            );
            break;
          case 'unit':
          case 'section':
          case 'subsection':
            expect(mockAddComponentsToContainer).toHaveBeenCalledWith(
              getIdFromContext(context),
              ['lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd'],
            );
            break;
          default:
            break;
        }
      });
      expect(onClose).toHaveBeenCalled();
      const text = context === 'collection'
        ? 'Failed to add content to collection.'
        : 'There was an error linking the content to this container.';
      expect(mockShowToast).toHaveBeenCalledWith(text);
    });
  });
});
