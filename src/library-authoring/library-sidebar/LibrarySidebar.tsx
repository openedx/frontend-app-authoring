import React from 'react';
import {
  Stack,
  Icon,
  IconButton,
  useWindowSize,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ResizableBox } from '@src/generic/resizable/Resizable';
import { useStickyState } from '@src/hooks';
import { AddContent, AddContentHeader } from '../add-content';
import { CollectionInfo, CollectionInfoHeader } from '../collections';
import { ContainerInfoHeader, ContainerInfo } from '../containers';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import {
  COMPONENT_INFO_TABS,
  SidebarActions,
  SidebarBodyItemId,
  useSidebarContext,
} from '../common/context/SidebarContext';
import { ComponentInfo, ComponentInfoHeader } from '../component-info';
import { LibraryInfo, LibraryInfoHeader } from '../library-info';
import messages from '../messages';

/** Width of the sidebar until the user resizes it: the fixed width it had before it became resizable. */
export const SIDEBAR_DEFAULT_WIDTH = 530;
/** Narrowest width the sidebar can be dragged to. */
export const SIDEBAR_MIN_WIDTH = 440;
/**
 * Width that must stay available for the main column. Below about 710px the Studio header and
 * the library page containers no longer fit and the page scrolls horizontally.
 */
export const MAIN_CONTENT_MIN_WIDTH = 720;
/** `localStorage` key that remembers the chosen width across library pages and sessions. */
export const SIDEBAR_WIDTH_STORAGE_KEY = 'library-authoring.sidebar-width';

/**
 * Sidebar container for library pages.
 *
 * When open, it takes horizontal space from the main content instead of overlaying it.
 * The user can drag its left edge, or focus the edge and use the arrow keys, to change
 * its width. The width is stored in `localStorage` and shared by all library pages.
 * Uses `sidebarItemInfo.type` of the `context` to
 * choose which component is rendered.
 * You can add more components in `bodyComponentMap`.
 * Use the returned actions to open and close this sidebar.
 */
const LibrarySidebar = () => {
  const intl = useIntl();
  const { componentPickerMode } = useComponentPickerContext();
  const { width: windowWidth } = useWindowSize();
  const [storedWidth, setStoredWidth] = useStickyState<number>(SIDEBAR_DEFAULT_WIDTH, SIDEBAR_WIDTH_STORAGE_KEY);

  let maxWidth: number | undefined;
  if (componentPickerMode) {
    // The component picker modal is not wide enough for the sidebar to grow past its default width.
    maxWidth = SIDEBAR_DEFAULT_WIDTH;
  } else if (windowWidth) {
    maxWidth = Math.max(SIDEBAR_MIN_WIDTH, windowWidth - MAIN_CONTENT_MIN_WIDTH);
  }
  const {
    sidebarAction,
    setSidebarTab,
    sidebarItemInfo,
    closeLibrarySidebar,
  } = useSidebarContext();
  const jumpToCollections = sidebarAction === SidebarActions.JumpToManageCollections;
  const jumpToTags = sidebarAction === SidebarActions.JumpToManageTags;

  React.useEffect(() => {
    // Show Manage tab if JumpToManageCollections or JumpToManageTags action is set
    if (jumpToCollections || jumpToTags) {
      // COMPONENT_INFO_TABS.Manage works for containers as well as its value
      // is same as CONTAINER_INFO_TABS.Manage.
      setSidebarTab(COMPONENT_INFO_TABS.Manage);
    }
  }, [jumpToCollections, setSidebarTab, jumpToTags]);

  const bodyComponentMap = {
    [SidebarBodyItemId.AddContent]: <AddContent />,
    [SidebarBodyItemId.Info]: <LibraryInfo />,
    [SidebarBodyItemId.ComponentInfo]: <ComponentInfo />,
    [SidebarBodyItemId.CollectionInfo]: <CollectionInfo />,
    [SidebarBodyItemId.ContainerInfo]: <ContainerInfo />,
    unknown: null,
  };

  const headerComponentMap = {
    [SidebarBodyItemId.AddContent]: <AddContentHeader />,
    [SidebarBodyItemId.Info]: <LibraryInfoHeader />,
    [SidebarBodyItemId.ComponentInfo]: <ComponentInfoHeader />,
    [SidebarBodyItemId.CollectionInfo]: <CollectionInfoHeader />,
    [SidebarBodyItemId.ContainerInfo]: <ContainerInfoHeader />,
    unknown: null,
  };

  const buildBody = (): React.ReactNode => bodyComponentMap[sidebarItemInfo?.type || 'unknown'];
  const buildHeader = (): React.ReactNode => headerComponentMap[sidebarItemInfo?.type || 'unknown'];

  return (
    <div className="library-authoring-sidebar box-shadow-left-1 bg-white" data-testid="library-sidebar">
      <ResizableBox
        minWidth={SIDEBAR_MIN_WIDTH}
        maxWidth={maxWidth}
        initialWidth={Number.isFinite(storedWidth) ? storedWidth : SIDEBAR_DEFAULT_WIDTH}
        onResizeEnd={setStoredWidth}
        handleLabel={intl.formatMessage(messages.sidebarResizeHandleLabel)}
      >
        <div className="library-authoring-sidebar-content">
          <Stack gap={4} className="p-3 text-primary-700">
            <Stack direction="horizontal" className="d-flex justify-content-between">
              {buildHeader()}
              <IconButton
                className="mt-1"
                src={Close}
                iconAs={Icon}
                alt={intl.formatMessage(messages.closeButtonAlt)}
                onClick={closeLibrarySidebar}
                size="inline"
              />
            </Stack>
            <div>
              {buildBody()}
            </div>
          </Stack>
        </div>
      </ResizableBox>
    </div>
  );
};

export default LibrarySidebar;
