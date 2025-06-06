import React from 'react';
import {
  Stack,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { AddContent, AddContentHeader } from '../add-content';
import { CollectionInfo, CollectionInfoHeader } from '../collections';
import { ContainerInfoHeader, ContainerInfo } from '../containers';
import {
  COMPONENT_INFO_TABS, SidebarActions, SidebarBodyItemId, useSidebarContext,
} from '../common/context/SidebarContext';
import { ComponentInfo, ComponentInfoHeader } from '../component-info';
import { LibraryInfo, LibraryInfoHeader } from '../library-info';
import messages from '../messages';

/**
 * Sidebar container for library pages.
 *
 * It's designed to "squash" the page when open.
 * Uses `sidebarItemInfo.type` of the `context` to
 * choose which component is rendered.
 * You can add more components in `bodyComponentMap`.
 * Use the returned actions to open and close this sidebar.
 */
const LibrarySidebar = () => {
  const intl = useIntl();
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

  const buildBody = () : React.ReactNode => bodyComponentMap[sidebarItemInfo?.type || 'unknown'];
  const buildHeader = (): React.ReactNode => headerComponentMap[sidebarItemInfo?.type || 'unknown'];

  return (
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
  );
};

export default LibrarySidebar;
