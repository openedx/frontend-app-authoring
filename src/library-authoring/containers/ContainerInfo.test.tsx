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

mockGetContainerMetadata.applyMock();
mockContentLibrary.applyMock();
mockGetContainerMetadata.applyMock();
mockGetContainerChildren.applyMock();

// TODO Remove this to un-skip section/subsection tests, when implemented
const testIf = (condition) => (condition ? it : it.skip);

const { libraryId } = mockContentLibrary;
const { unitId, subsectionId, sectionId } = mockGetContainerMetadata;

const render = (containerId, showOnlyPublished: boolean = false) => {
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
let mockShowToast;

describe('<ContainerInfo />', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
  });

  [
    {
      containerType: 'Unit',
      containerId: unitId,
    },
    {
      containerType: 'Subsection',
      containerId: subsectionId,
    },
    {
      containerType: 'Section',
      containerId: sectionId,
    },
  ].forEach(({ containerId, containerType }) => {
    testIf(containerType === 'Unit')(`should delete the ${containerType} using the menu`, async () => {
      axiosMock.onDelete(getLibraryContainerApiUrl(containerId)).reply(200);
      render(containerId);

      // Open menu
      expect(await screen.findByTestId('container-info-menu-toggle')).toBeInTheDocument();
      userEvent.click(screen.getByTestId('container-info-menu-toggle'));

      // Click on Delete Item
      const deleteMenuItem = screen.getByRole('button', { name: 'Delete' });
      expect(deleteMenuItem).toBeInTheDocument();
      fireEvent.click(deleteMenuItem);

      // Confirm delete Modal is open
      expect(screen.getByText(`Delete ${containerType}`));
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(axiosMock.history.delete.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalled();
    });

    it('can publish the container', async () => {
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(200);
      render(containerId);

      // Click on Publish button
      const publishButton = await screen.findByRole('button', { name: 'Publish' });
      expect(publishButton).toBeInTheDocument();
      userEvent.click(publishButton);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalledWith('All changes published');
    });

    it(`shows an error if publishing the ${containerType} fails`, async () => {
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(500);
      render(containerId);

      // Click on Publish button
      const publishButton = await screen.findByRole('button', { name: 'Publish' });
      expect(publishButton).toBeInTheDocument();
      userEvent.click(publishButton);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalledWith('Failed to publish changes');
    });

    testIf(containerType === 'Unit')(`show only published ${containerType} content`, async () => {
      render(containerId, true);
      expect(await screen.findByTestId('container-info-menu-toggle')).toBeInTheDocument();
      expect(screen.getByText(/text block published 1/i)).toBeInTheDocument();
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
