import React from 'react';
import {
  Stack,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { AddContentContainer, AddContentHeader } from '../add-content';
import { CollectionInfo, CollectionInfoHeader } from '../collections';
import { SidebarBodyComponentId, useLibraryContext } from '../common/context';
import { ComponentInfo, ComponentInfoHeader } from '../component-info';
import { LibraryInfo, LibraryInfoHeader } from '../library-info';
import messages from '../messages';

/**
 * Sidebar container for library pages.
 *
 * It's designed to "squash" the page when open.
 * Uses `sidebarBodyComponent` of the `context` to
 * choose which component is rendered.
 * You can add more components in `bodyComponentMap`.
 * Use the returned actions to open and close this sidebar.
 */
const LibrarySidebar = () => {
  const intl = useIntl();
  const {
    sidebarBodyComponent,
    closeLibrarySidebar,
  } = useLibraryContext();

  const bodyComponentMap = {
    [SidebarBodyComponentId.AddContent]: <AddContentContainer />,
    [SidebarBodyComponentId.Info]: <LibraryInfo />,
    [SidebarBodyComponentId.ComponentInfo]: <ComponentInfo />,
    [SidebarBodyComponentId.CollectionInfo]: <CollectionInfo />,
    unknown: null,
  };

  const headerComponentMap = {
    [SidebarBodyComponentId.AddContent]: <AddContentHeader />,
    [SidebarBodyComponentId.Info]: <LibraryInfoHeader />,
    [SidebarBodyComponentId.ComponentInfo]: <ComponentInfoHeader />,
    [SidebarBodyComponentId.CollectionInfo]: <CollectionInfoHeader />,
    unknown: null,
  };

  const buildBody = () : React.ReactNode => bodyComponentMap[sidebarBodyComponent || 'unknown'];
  const buildHeader = (): React.ReactNode => headerComponentMap[sidebarBodyComponent || 'unknown'];

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
