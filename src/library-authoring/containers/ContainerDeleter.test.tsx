import type { ToastActionData } from '../../generic/toast-context';
import {
  fireEvent,
  render,
  screen,
  initializeMocks,
  waitFor,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarProvider } from '../common/context/SidebarContext';
import {
  mockContentLibrary,
  mockGetContainerMetadata,
  mockDeleteContainer,
  mockRestoreContainer,
  mockGetContainerEntityLinks,
} from '../data/api.mocks';
import { mockContentSearchConfig, mockSearchResult } from '../../search-manager/data/api.mock';
import ContainerDeleter from './ContainerDeleter';

mockContentLibrary.applyMock(); // Not required, but avoids 404 errors in the logs when <LibraryProvider> loads data
mockContentSearchConfig.applyMock();
mockGetContainerEntityLinks.applyMock();
const mockDelete = mockDeleteContainer.applyMock();
const mockRestore = mockRestoreContainer.applyMock();

const { libraryId } = mockContentLibrary;
const getContainerDetails = (context: string) => {
  switch (context) {
    case 'unit':
      return { containerId: mockGetContainerMetadata.unitId, parent: 'subsection' };
    case 'subsection':
      return { containerId: mockGetContainerMetadata.subsectionId, parent: 'section' };
    case 'section':
      return { containerId: mockGetContainerMetadata.sectionId, parent: null };
    default:
      return { containerId: mockGetContainerMetadata.unitId, parent: 'subsection' };
  }
};

const renderArgs = {
  path: '/library/:libraryId',
  params: { libraryId },
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId}>
      <SidebarProvider>
        { children }
      </SidebarProvider>
    </LibraryProvider>
  ),
};

let mockShowToast: { (message: string, action?: ToastActionData | undefined): void; mock?: any; };

[
  'unit' as const,
  'section' as const,
  'subsection' as const,
].forEach((context) => {
  describe('<ContainerDeleter />', () => {
    beforeEach(() => {
      const mocks = initializeMocks();
      mockShowToast = mocks.mockShowToast;
      mockSearchResult({
        results: [ // @ts-ignore
          {
            hits: [{
              blockType: context,
              displayName: `Test ${context}`,
            }],
          },
        ],
      });
    });

    it(`<${context}> is invisible when isOpen is false`, async () => {
      const mockClose = jest.fn();
      const { containerId } = getContainerDetails(context);
      render(<ContainerDeleter
        containerId={containerId}
        isOpen={false}
        close={mockClose}
      />, renderArgs);

      const modal = screen.queryByRole('dialog', { name: new RegExp(`Delete ${context}`, 'i') });
      expect(modal).not.toBeInTheDocument();
    });

    it(`<${context}> should show a confirmation prompt the card with title and description`, async () => {
      const mockCancel = jest.fn();
      const { containerId } = getContainerDetails(context);
      render(<ContainerDeleter
        containerId={containerId}
        isOpen
        close={mockCancel}
      />, renderArgs);

      const modal = await screen.findByRole('dialog', { name: new RegExp(`Delete ${context}`, 'i') });
      expect(modal).toBeVisible();

      // It should mention the component's name in the confirm dialog:
      await screen.findByText(`Test ${context}`);

      // Clicking cancel will cancel:
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);
      expect(mockCancel).toHaveBeenCalled();
    });

    it(`<${context}> deletes the block when confirmed, shows a toast with undo option and restores block on undo`, async () => {
      const mockCancel = jest.fn();
      const { containerId } = getContainerDetails(context);
      render(<ContainerDeleter containerId={containerId} isOpen close={mockCancel}  />, renderArgs);

      const modal = await screen.findByRole('dialog', { name: new RegExp(`Delete ${context}`, 'i') });
      expect(modal).toBeVisible();

      const deleteButton = await screen.findByRole('button', { name: 'Delete' });
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalled();
      });
      expect(mockCancel).toHaveBeenCalled(); // In order to close the modal, this also gets called.
      expect(mockShowToast).toHaveBeenCalled();
      // Get restore / undo func from the toast
      const restoreFn = mockShowToast.mock.calls[0][1].onClick;
      restoreFn();
      await waitFor(() => {
        expect(mockRestore).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith('Undo successful');
      });
    });

    it(`<${context}> should show subsection message if parent data is set with one parent`, async () => {
      const mockCancel = jest.fn();
      const { containerId, parent } = getContainerDetails(context);
      if (!parent) {
        return;
      }
      mockSearchResult({
        results: [ // @ts-ignore
          {
            hits: [{
              [`${parent}s`]: {
                displayName: [`${parent} 1`],
                key: [`${parent}1`],
              },
              blockType: context,
            }],
          },
        ],
      });
      render(
        <ContainerDeleter
          containerId={containerId}
          isOpen
          close={mockCancel}
        />,
        renderArgs,
      );

      const modal = await screen.findByRole('dialog', { name: new RegExp(`Delete ${context}`, 'i') });
      expect(modal).toBeVisible();

      const textMatch = new RegExp(`By deleting this ${context}, you will also be deleting it from ${parent} 1 in this library.`);
      expect((await screen.findAllByText((_, element) => textMatch.test(element?.textContent || ''))).length).toBeGreaterThan(0);
    });

    it(`<${context}> should show parents message if parents is set with multiple parents`, async () => {
      const mockCancel = jest.fn();
      const { containerId, parent } = getContainerDetails(context);
      if (!parent) {
        return;
      }
      mockSearchResult({
        results: [ // @ts-ignore
          {
            hits: [{
              [`${parent}s`]: {
                displayName: [`${parent} 1`, `${parent} 2`],
                key: [`${parent}1`, `${parent}2`],
              },
              blockType: context,
            }],
          },
        ],
      });
      render(
        <ContainerDeleter
          containerId={containerId}
          isOpen
          close={mockCancel}
        />,
        renderArgs,
      );

      const modal = await screen.findByRole('dialog', { name: new RegExp(`Delete ${context}`, 'i') });
      expect(modal).toBeVisible();

      const textMatch = new RegExp(`By deleting this ${context}, you will also be deleting it from 2 ${parent}s in this library.`, 'i');
      expect((await screen.findAllByText((_, element) => textMatch.test(element?.textContent || ''))).length).toBeGreaterThan(0);
    });
  });
});
