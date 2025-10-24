import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks, render as baseRender, screen, waitFor,
  fireEvent,
  within,
} from '@src/testUtils';
import { ContainerType } from '@src/generic/key-utils';
import type { ToastActionData } from '@src/generic/toast-context';
import { mockContentSearchConfig, mockSearchResult, hydrateSearchResult } from '@src/search-manager/data/api.mock';
import {
  mockContentLibrary,
  mockGetContainerChildren,
  mockGetContainerMetadata,
  mockGetContainerHierarchy,
} from '../data/api.mocks';
import { LibraryProvider } from '../common/context/LibraryContext';
import ContainerInfo from './ContainerInfo';
import {
  getLibraryContainerApiUrl,
  getLibraryContainerPublishApiUrl,
  getLibraryContainerCopyApiUrl,
} from '../data/api';
import { SidebarBodyItemId, SidebarProvider } from '../common/context/SidebarContext';

mockContentLibrary.applyMock();
mockContentSearchConfig.applyMock();
mockGetContainerMetadata.applyMock();
mockGetContainerChildren.applyMock();
mockGetContainerHierarchy.applyMock();

const { libraryId } = mockContentLibrary;
const {
  unitId,
  subsectionId,
  sectionId,
  unitIdEmpty,
  subsectionIdEmpty,
  sectionIdEmpty,
  unitIdPublished,
  subsectionIdPublished,
  sectionIdPublished,
} = mockGetContainerMetadata;

const {
  unitIdOneChild,
  subsectionIdOneChild,
  sectionIdOneChild,
} = mockGetContainerHierarchy;

// Convert a given containerId to its "empty" equivalent
const emptyId = (id: string) => {
  switch (id) {
    case unitId:
      return unitIdEmpty;
    case subsectionId:
      return subsectionIdEmpty;
    case sectionId:
      return sectionIdEmpty;
    default:
      return undefined;
  }
};

// Convert a given containerId to its "published" equivalent
const publishedId = (id: string) => {
  switch (id) {
    case unitId:
      return unitIdPublished;
    case subsectionId:
      return subsectionIdPublished;
    case sectionId:
      return sectionIdPublished;
    default:
      return undefined;
  }
};

// Convert a given containerId to its "one child" equivalent
const singleChild = (id: string) => {
  switch (id) {
    case unitId:
      return unitIdOneChild;
    case subsectionId:
      return subsectionIdOneChild;
    case sectionId:
      return sectionIdOneChild;
    default:
      return undefined;
  }
};

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const render = (
  containerId,
  containerType: string = '', // renders container page
  showOnlyPublished: boolean = false,
) => {
  const params: { libraryId: string, selectedItemId?: string } = { libraryId, selectedItemId: containerId };
  const path = containerType
    ? `/library/:libraryId/${containerType}/:selectedItemId?`
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
let mockShowToast: { (message: string, action?: ToastActionData | undefined): void; mock?: any; };

[
  {
    containerType: ContainerType.Unit,
    containerId: unitId,
    childType: 'component',
    willPublishCount: 2,
    parentType: 'subsection',
    parentCount: 3,
  },
  {
    containerType: ContainerType.Subsection,
    containerId: subsectionId,
    childType: 'unit',
    willPublishCount: 3,
    parentType: 'section',
    parentCount: 2,
  },
  {
    containerType: ContainerType.Section,
    containerId: sectionId,
    childType: 'subsection',
    willPublishCount: 4,
    parentType: '',
    parentCount: 0,
  },
].forEach(({
  containerId,
  containerType,
  childType,
  willPublishCount,
  parentType,
  parentCount,
}) => {
  describe(`<ContainerInfo /> with containerType: ${containerType}`, () => {
    beforeEach(() => {
      ({ axiosMock, mockShowToast } = initializeMocks());
      mockSearchResult(hydrateSearchResult([{
        blockType: containerType,
        displayName: `Test ${containerType}`,
      }]));
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
      const modal = await screen.findByRole('dialog', { name: `Delete ${containerType[0].toUpperCase()}${containerType.slice(1)}` });
      expect(modal).toBeInTheDocument();
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(axiosMock.history.delete.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalled();
    });

    it(`should copy the ${containerType} using the menu`, async () => {
      const user = userEvent.setup();
      const url = getLibraryContainerCopyApiUrl(containerId);
      axiosMock.onPost(url).reply(200);
      render(containerId);

      // Open menu
      expect(await screen.findByTestId('container-info-menu-toggle')).toBeInTheDocument();
      await user.click(screen.getByTestId('container-info-menu-toggle'));

      // Click on Copy Item
      const copyMenuItem = await screen.findByRole('button', { name: 'Copy to clipboard' });
      expect(copyMenuItem).toBeInTheDocument();
      await user.click(copyMenuItem);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
      });
      expect(axiosMock.history.post[0].url).toEqual(url);
    });

    it(`shows Published if the ${containerType} has no draft changes`, async () => {
      render(publishedId(containerId), containerType);

      // "Published" status should be displayed
      expect(await screen.findByText('Published')).toBeInTheDocument();
    });

    it(`can publish the ${containerType} from the container page`, async () => {
      const user = userEvent.setup();
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(200);
      render(containerId, containerType);

      // Click on Publish button
      let publishButton = await screen.findByRole('button', { name: /publish changes/i });
      expect(publishButton).toBeInTheDocument();
      await user.click(publishButton);
      expect(publishButton).not.toBeInTheDocument();

      // Reveals the confirmation box with warning text and publish hierarchy
      expect(await screen.findByText('Confirm Publish')).toBeInTheDocument();
      expect(screen.getByText(new RegExp(
        `This ${containerType} and the ${childType}s it contains will all be`, // <strong>published</strong>
        'i',
      ))).toBeInTheDocument();
      if (parentCount > 0) {
        expect(screen.getByText(new RegExp(
          `Its parent ${parentType}s will be`, // <srong>draft</strong>
          'i',
        ))).toBeInTheDocument();
      }
      expect(await screen.queryAllByText('Will Publish').length).toBe(willPublishCount);
      expect(await screen.queryAllByText('Draft').length).toBe(4 - willPublishCount);

      // Click on the confirm Cancel button
      const publishCancel = await screen.findByRole('button', { name: 'Cancel' });
      expect(publishCancel).toBeInTheDocument();
      await user.click(publishCancel);
      expect(axiosMock.history.post.length).toBe(0);

      // Click on Publish button again
      publishButton = await screen.findByRole('button', { name: /publish changes/i });
      expect(publishButton).toBeInTheDocument();
      await user.click(publishButton);
      expect(publishButton).not.toBeInTheDocument();

      // Click on the confirm Publish button
      const publishConfirm = await screen.findByRole('button', { name: 'Publish' });
      expect(publishConfirm).toBeInTheDocument();
      await user.click(publishConfirm);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalledWith('All changes published');
    });

    it(`shows an error if publishing the ${containerType} fails`, async () => {
      const user = userEvent.setup();
      axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(500);
      render(containerId, containerType);

      // Click on Publish button to reveal the confirmation box
      const publishButton = await screen.findByRole('button', { name: /publish changes/i });
      expect(publishButton).toBeInTheDocument();
      await user.click(publishButton);
      expect(publishButton).not.toBeInTheDocument();

      // Click on the confirm Publish button
      const publishConfirm = await screen.findByRole('button', { name: 'Publish' });
      expect(publishConfirm).toBeInTheDocument();
      await user.click(publishConfirm);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
      });
      expect(mockShowToast).toHaveBeenCalledWith('Failed to publish changes');
    });

    it(`shows single child / parent message before publishing the ${containerType}`, async () => {
      const user = userEvent.setup();
      render(singleChild(containerId), containerType);

      // Click on Publish button
      const publishButton = await screen.findByRole('button', { name: /publish changes/i });
      expect(publishButton).toBeInTheDocument();
      await user.click(publishButton);
      expect(publishButton).not.toBeInTheDocument();

      // Check warning text in the confirmation box
      expect(screen.getByText(new RegExp(
        `This ${containerType} and the ${childType} it contains will all be`, // <strong>published</strong>
        'i',
      ))).toBeInTheDocument();
      if (parentCount) {
        expect(screen.getByText(new RegExp(
          `Its parent ${parentType} will be`, // <strong>draft</strong>
          'i',
        ))).toBeInTheDocument();
      }
    });

    it(`omits child count before publishing an empty ${containerType}`, async () => {
      const user = userEvent.setup();
      render(emptyId(containerId), containerType);

      // Click on Publish button
      const publishButton = await screen.findByRole('button', { name: /publish changes/i });
      expect(publishButton).toBeInTheDocument();
      await user.click(publishButton);
      expect(publishButton).not.toBeInTheDocument();

      // Check warning text in the confirmation box
      expect(await screen.findByText(new RegExp(
        `This ${containerType} will be`, // <strong>published</strong>
        'i',
      ))).toBeInTheDocument();
    });

    it(`show only published ${containerType} content`, async () => {
      render(containerId, containerType, true);
      expect(await screen.findByText(/block published 1/i)).toBeInTheDocument();
    });

    it(`shows the ${containerType} Preview tab by default and the children are readonly`, async () => {
      const user = userEvent.setup();
      render(containerId);
      const previewTab = await screen.findByText('Preview');
      expect(previewTab).toBeInTheDocument();
      expect(previewTab).toHaveAttribute('aria-selected', 'true');

      // Check that there are no edit buttons for components titles
      expect(screen.queryAllByRole('button', { name: /edit/i }).length).toBe(0);

      // Check that there are no drag handle for components/containers
      expect(screen.queryAllByRole('button', { name: 'Drag to reorder' }).length).toBe(0);

      // Check that there are no menu buttons for components
      expect(screen.queryAllByRole('button', { name: /component actions menu/i }).length).toBe(0);

      // If the childType is a component, it should be displayed as a text block
      const childTypeDisplayName = childType === 'component' ? 'text' : childType;
      const child = await screen.findByText(`${childTypeDisplayName} block 0`);

      // Check that there are no menu buttons for containers
      expect(within(
        child.parentElement!.parentElement!.parentElement!,
      ).queryAllByRole('button', { name: /container actions menu/i }).length).toBe(0);
      // Trigger double click. Find the child card as the parent element
      await user.dblClick(child.parentElement!.parentElement!.parentElement!);
      // Click should not do anything in preview
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it(`shows the ${containerType} hierarchy in the Usage tab`, async () => {
      const user = userEvent.setup();
      render(containerId, containerType);
      const usageTab = await screen.findByText('Usage');
      await user.click(usageTab);
      expect(usageTab).toHaveAttribute('aria-selected', 'true');

      // Content hierarchy selects the current containerType and shows its display name
      expect(await screen.findByText('Content Hierarchy')).toBeInTheDocument();
      const container = await screen.findByText(`${containerType} block 0`);
      expect(container.parentElement!.parentElement).toHaveClass('selected');

      // Other container types should show counts
      if (containerType !== 'section') {
        expect(await screen.findByText('2 Sections')).toBeInTheDocument();
      }
      if (containerType !== 'subsection') {
        expect(await screen.findByText('3 Subsections')).toBeInTheDocument();
      }
      if (containerType !== 'unit') {
        expect(await screen.findByText('4 Units')).toBeInTheDocument();
      }
      expect(await screen.findByText('5 Components')).toBeInTheDocument();
    });
  });
});
