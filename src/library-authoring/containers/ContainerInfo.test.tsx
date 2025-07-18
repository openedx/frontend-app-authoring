import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks, render as baseRender, screen, waitFor,
  fireEvent,
} from '../../testUtils';
import { mockContentLibrary, mockGetContainerChildren, mockGetContainerMetadata } from '../data/api.mocks';
import { LibraryProvider } from '../common/context/LibraryContext';
import ContainerInfo from './ContainerInfo';
import { getLibraryContainerApiUrl, getLibraryContainerPublishApiUrl } from '../data/api';
import { SidebarBodyItemId, SidebarProvider } from '../common/context/SidebarContext';
import { ContainerType } from '../../generic/key-utils';
import { mockContentSearchConfig, mockSearchResult } from '../../search-manager/data/api.mock';
import type { ToastActionData } from '../../generic/toast-context';

mockGetContainerMetadata.applyMock();
mockContentLibrary.applyMock();
mockContentSearchConfig.applyMock();
mockGetContainerMetadata.applyMock();
mockGetContainerChildren.applyMock();

const { libraryId } = mockContentLibrary;
const { unitId, subsectionId, sectionId } = mockGetContainerMetadata;

const render = (containerId: string, showOnlyPublished: boolean = false) => {
  const params: { libraryId: string, selectedItemId?: string } = { libraryId, selectedItemId: containerId };
  return baseRender(<ContainerInfo />, {
    path: '/library/:libraryId/:selectedItemId?',
    params,
    extraWrapper: ({ children }) => (
      <LibraryProvider
        libraryId={libraryId}
        showOnlyPublished={showOnlyPublished}
      >
        <SidebarProvider
          initialSidebarItemInfo={{
            id: containerId,
            type: SidebarBodyItemId.ContainerInfo,
          }}
        >
          {children}
        </SidebarProvider>
      </LibraryProvider>
    ),
  });
};
let axiosMock: MockAdapter;
let mockShowToast: { (message: string, action?: ToastActionData | undefined): void; mock?: any; };

[
  {
    containerType: ContainerType.Unit,
    containerId: unitId,
  },
  {
    containerType: ContainerType.Subsection,
    containerId: subsectionId,
  },
  {
    containerType: ContainerType.Section,
    containerId: sectionId,
  },
].forEach(({ containerId, containerType }) => {
  describe(`<ContainerInfo /> with containerType: ${containerType}`, () => {
    beforeEach(() => {
      ({ axiosMock, mockShowToast } = initializeMocks());
      mockSearchResult({
        results: [ // @ts-ignore
          {
            hits: [{
              blockType: containerType,
              displayName: `Test ${containerType}`,
            }],
          },
        ],
      });
    });

    it(`should delete the ${containerType} using the menu`, async () => {
      const user = userEvent.setup();
      axiosMock.onDelete(getLibraryContainerApiUrl(containerId)).reply(200);
      render(containerId);

      // Open menu
      expect(await screen.findByTestId('container-info-menu-toggle')).toBeInTheDocument();
      await user.click(screen.getByTestId('container-info-menu-toggle'));

      // Click on Delete Item
      const deleteMenuItem = await screen.findByRole('button', { name: 'Delete' });
      expect(deleteMenuItem).toBeInTheDocument();
      fireEvent.click(deleteMenuItem);

      // Confirm delete Modal is open
      expect(screen.getByText(`Delete ${containerType[0].toUpperCase()}${containerType.slice(1)}`));
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(axiosMock.history.delete.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalled();
    });

    it('can publish the container', async () => {
      const user = userEvent.setup();
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(200);
      render(containerId);

      // Click on Publish button
      const publishButton = await screen.findByRole('button', { name: 'Publish' });
      expect(publishButton).toBeInTheDocument();
      await user.click(publishButton);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalledWith('All changes published');
    });

    it(`shows an error if publishing the ${containerType} fails`, async () => {
      const user = userEvent.setup();
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(500);
      render(containerId);

      // Click on Publish button
      const publishButton = await screen.findByRole('button', { name: 'Publish' });
      expect(publishButton).toBeInTheDocument();
      await user.click(publishButton);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalledWith('Failed to publish changes');
    });

    it(`show only published ${containerType} content`, async () => {
      render(containerId, true);
      expect(await screen.findByTestId('container-info-menu-toggle')).toBeInTheDocument();
      expect(screen.getByText(/block published 1/i)).toBeInTheDocument();
    });

    it(`shows the ${containerType} Preview tab by default and the children are readonly`, async () => {
      render(containerId);
      const previewTab = await screen.findByText('Preview');
      expect(previewTab).toBeInTheDocument();
      expect(previewTab).toHaveAttribute('aria-selected', 'true');

      // Check that there are no edit buttons for components titles
      expect(screen.queryAllByRole('button', { name: /edit/i }).length).toBe(0);

      // Check that there are no drag handle for components
      expect(screen.queryAllByRole('button', { name: 'Drag to reorder' }).length).toBe(0);

      // Check that there are no menu buttons for components
      expect(screen.queryAllByRole('button', { name: /component actions menu/i }).length).toBe(0);
    });
  });
});
