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
import { ContainerInfoHeader, UnitInfo } from '../containers';
import {
  COMPONENT_INFO_TABS, SidebarActions, SidebarBodyComponentId, useSidebarContext,
} from '../common/context/SidebarContext';
import { ComponentInfo, ComponentInfoHeader } from '../component-info';
import { LibraryInfo, LibraryInfoHeader } from '../library-info';
import messages from '../messages';

interface LibrarySidebarProps {
  onSidebarClose?: () => void;
}

/**
 * Sidebar container for library pages.
 *
 * It's designed to "squash" the page when open.
 * Uses `sidebarComponentInfo.type` of the `context` to
 * choose which component is rendered.
 * You can add more components in `bodyComponentMap`.
 * Use the returned actions to open and close this sidebar.
 */
const LibrarySidebar = ({ onSidebarClose }: LibrarySidebarProps) => {
  const intl = useIntl();
  const {
    sidebarAction,
    setSidebarTab,
    sidebarComponentInfo,
    closeLibrarySidebar,
  } = useSidebarContext();
  const jumpToCollections = sidebarAction === SidebarActions.JumpToManageCollections;
  const jumpToTags = sidebarAction === SidebarActions.JumpToManageTags;

  React.useEffect(() => {
    // Show Manage tab if JumpToManageCollections or JumpToManageTags action is set
    if (jumpToCollections || jumpToTags) {
      // COMPONENT_INFO_TABS.Manage works for containers as well as its value
      // is same as UNIT_INFO_TABS.Manage.
      setSidebarTab(COMPONENT_INFO_TABS.Manage);
    }
  }, [jumpToCollections, setSidebarTab, jumpToTags]);

  const bodyComponentMap = {
    [SidebarBodyComponentId.AddContent]: <AddContent />,
    [SidebarBodyComponentId.Info]: <LibraryInfo />,
    [SidebarBodyComponentId.ComponentInfo]: <ComponentInfo />,
    [SidebarBodyComponentId.CollectionInfo]: <CollectionInfo />,
    [SidebarBodyComponentId.UnitInfo]: <UnitInfo />,
    unknown: null,
  };

  const headerComponentMap = {
    [SidebarBodyComponentId.AddContent]: <AddContentHeader />,
    [SidebarBodyComponentId.Info]: <LibraryInfoHeader />,
    [SidebarBodyComponentId.ComponentInfo]: <ComponentInfoHeader />,
    [SidebarBodyComponentId.CollectionInfo]: <CollectionInfoHeader />,
    [SidebarBodyComponentId.UnitInfo]: <ContainerInfoHeader />,
    unknown: null,
  };

  const buildBody = () : React.ReactNode => bodyComponentMap[sidebarComponentInfo?.type || 'unknown'];
  const buildHeader = (): React.ReactNode => headerComponentMap[sidebarComponentInfo?.type || 'unknown'];

  const handleSidebarClose = () => {
    closeLibrarySidebar();
    onSidebarClose?.();
  };

  return (
    <Stack gap={4} className="p-3 text-primary-700">
      <Stack direction="horizontal" className="d-flex justify-content-between">
        {buildHeader()}
        <IconButton
          className="mt-1"
          src={Close}
          iconAs={Icon}
          alt={intl.formatMessage(messages.closeButtonAlt)}
          onClick={handleSidebarClose}
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
