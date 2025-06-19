import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks, render as baseRender, screen, waitFor,
  fireEvent,
} from '@src/testUtils';
import { PublishStatus } from '@src/search-manager';
import { mockContentSearchConfig, mockSearchResult } from '@src/search-manager/data/api.mock';
import { mockContentLibrary, mockGetContainerChildren, mockGetContainerMetadata } from '../data/api.mocks';
import { LibraryProvider } from '../common/context/LibraryContext';
import ContainerInfo from './ContainerInfo';
import { getLibraryContainerApiUrl, getLibraryContainerPublishApiUrl } from '../data/api';
import { SidebarBodyItemId, SidebarProvider } from '../common/context/SidebarContext';

mockGetContainerMetadata.applyMock();
mockContentLibrary.applyMock();
mockGetContainerMetadata.applyMock();
mockGetContainerChildren.applyMock();
mockContentSearchConfig.applyMock();

// TODO Remove this to un-skip section/subsection tests, when implemented
const testIf = (condition) => (condition ? it : it.skip);

const { libraryId } = mockContentLibrary;
const { unitId, subsectionId, sectionId } = mockGetContainerMetadata;

const render = (
  containerId,
  containerType: string = '', // renders container page
  showOnlyPublished: boolean = false,
) => {
  const params: { libraryId: string, selectedItemId?: string } = { libraryId, selectedItemId: containerId };
  const path = containerType
    ? `/library/:libraryId/${containerType.toLowerCase()}/:selectedItemId?`
    : '/library/:libraryId/:selectedItemId?';

  return baseRender(<ContainerInfo />, {
    path,
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
    mockSearchResult({
      results: [ // @ts-ignore
        {
          hits: [],
        },
      ],
    });
  });

  [
    {
      containerType: 'Unit',
      containerId: unitId,
      childType: 'component',
    },
    {
      containerType: 'Subsection',
      containerId: subsectionId,
      childType: 'unit',
    },
    {
      containerType: 'Section',
      containerId: sectionId,
      childType: 'subsection',
    },
  ].forEach(({ containerId, containerType, childType }) => {
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

    it(`shows Published if the ${containerType} has no draft changes`, async () => {
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(200);
      mockSearchResult({
        results: [ // @ts-ignore
          {
            hits: [
              {
                type: 'library_container',
                usageKey: containerId,
                blockType: containerType.toLowerCase(),
                publishStatus: PublishStatus.Published,
              },
            ],
          },
        ],
      });
      render(containerId, containerType);

      // "Published" status should be displayed
      const publishedStatus = await screen.findByText('Published');
      expect(publishedStatus).toBeInTheDocument();
    });

    it(`can publish the ${containerType} from the container page`, async () => {
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(200);
      mockSearchResult({
        results: [ // @ts-ignore
          {
            hits: [
              {
                type: 'library_container',
                usageKey: containerId,
                blockType: containerType.toLowerCase(),
                publishStatus: PublishStatus.Modified,
              },
            ],
          },
        ],
      });
      render(containerId, containerType);

      // Click on Publish button
      let publishButton = await screen.findByRole('button', { name: /publish changes/i });
      expect(publishButton).toBeInTheDocument();
      userEvent.click(publishButton);
      expect(publishButton).not.toBeInTheDocument();

      // Reveals the confirmation box with warning text
      expect(await screen.findByText(
        `Are you sure you want to publish this ${containerType.toLowerCase()}?`,
      )).toBeInTheDocument();

      // Click on the confirm Cancel button
      const publishCancel = await screen.findByRole('button', { name: 'Cancel' });
      expect(publishCancel).toBeInTheDocument();
      userEvent.click(publishCancel);
      expect(axiosMock.history.post.length).toBe(0);

      // Click on Publish button again
      publishButton = await screen.findByRole('button', { name: /publish changes/i });
      expect(publishButton).toBeInTheDocument();
      userEvent.click(publishButton);
      expect(publishButton).not.toBeInTheDocument();

      // Click on the confirm Publish button
      const publishConfirm = await screen.findByRole('button', { name: 'Publish' });
      expect(publishConfirm).toBeInTheDocument();
      userEvent.click(publishConfirm);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalledWith('All changes published');
    });

    it(`shows an error if publishing the ${containerType} fails`, async () => {
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(500);
      mockSearchResult({
        results: [ // @ts-ignore
          {
            hits: [
              {
                type: 'library_container',
                usageKey: containerId,
                blockType: containerType.toLowerCase(),
                publishStatus: PublishStatus.Modified,
              },
            ],
          },
        ],
      });
      render(containerId, containerType);

      // Click on Publish button to reveal the confirmation box
      const publishButton = await screen.findByRole('button', { name: /publish changes/i });
      expect(publishButton).toBeInTheDocument();
      userEvent.click(publishButton);
      expect(publishButton).not.toBeInTheDocument();

      // Click on the confirm Publish button
      const publishConfirm = await screen.findByRole('button', { name: 'Publish' });
      expect(publishConfirm).toBeInTheDocument();
      userEvent.click(publishConfirm);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalledWith('Failed to publish changes');
    });

    it(`shows single child before publishing the ${containerType}`, async () => {
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(200);
      mockSearchResult({
        results: [ // @ts-ignore
          {
            hits: [
              {
                type: 'library_container',
                usageKey: containerId,
                blockType: containerType.toLowerCase(),
                publishStatus: PublishStatus.Modified,
                content: {
                  childDisplayNames: [
                    'one',
                  ],
                },
              },
            ],
          },
        ],
      });
      render(containerId, containerType);

      // Click on Publish button
      const publishButton = await screen.findByRole('button', { name: /publish changes/i });
      expect(publishButton).toBeInTheDocument();
      userEvent.click(publishButton);
      expect(publishButton).not.toBeInTheDocument();

      // Check warning text in the confirmation box
      expect(await screen.findByText(
        `This ${containerType.toLowerCase()} and its 1 ${childType} will all be published.`,
      )).toBeInTheDocument();
    });

    it(`shows child count before publishing the ${containerType}`, async () => {
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(200);
      mockSearchResult({
        results: [ // @ts-ignore
          {
            hits: [
              {
                type: 'library_container',
                usageKey: containerId,
                blockType: containerType.toLowerCase(),
                publishStatus: PublishStatus.Modified,
                content: {
                  childDisplayNames: [
                    'one', 'two',
                  ],
                },
              },
            ],
          },
        ],
      });
      render(containerId, containerType);

      // Click on Publish button
      const publishButton = await screen.findByRole('button', { name: /publish changes/i });
      expect(publishButton).toBeInTheDocument();
      userEvent.click(publishButton);
      expect(publishButton).not.toBeInTheDocument();

      // Check warning text in the confirmation box
      expect(await screen.findByText(
        `This ${containerType.toLowerCase()} and its 2 ${childType}s will all be published.`,
      )).toBeInTheDocument();
    });

    testIf(containerType === 'Unit')(`show only published ${containerType} content`, async () => {
      render(containerId, '', true);
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
