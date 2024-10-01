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
import { ContentLibrary } from '../data/api';
import { SidebarBodyComponentId, useLibraryContext } from '../common/context';
import { ComponentInfo, ComponentInfoHeader } from '../component-info';
import { LibraryInfo, LibraryInfoHeader } from '../library-info';
import messages from '../messages';

type LibrarySidebarProps = {
  library: ContentLibrary,
};

/**
 * Sidebar container for library pages.
 *
 * It's designed to "squash" the page when open.
 * Uses `sidebarBodyComponent` of the `context` to
 * choose which component is rendered.
 * You can add more components in `bodyComponentMap`.
 * Use the returned actions to open and close this sidebar.
 */
const LibrarySidebar = ({ library }: LibrarySidebarProps) => {
  const intl = useIntl();
  const {
    sidebarBodyComponent,
    closeLibrarySidebar,
    currentComponentData,
    currentCollectionId,
  } = useLibraryContext();

  const bodyComponentMap = {
    [SidebarBodyComponentId.AddContent]: <AddContentContainer />,
    [SidebarBodyComponentId.Info]: <LibraryInfo library={library} />,
    [SidebarBodyComponentId.ComponentInfo]: (
      currentComponentData && <ComponentInfo contentHit={currentComponentData} />
    ),
    [SidebarBodyComponentId.CollectionInfo]: (
      currentCollectionId && <CollectionInfo library={library} collectionId={currentCollectionId} />
    ),
    unknown: null,
  };

  const headerComponentMap = {
    [SidebarBodyComponentId.AddContent]: <AddContentHeader />,
    [SidebarBodyComponentId.Info]: <LibraryInfoHeader library={library} />,
    [SidebarBodyComponentId.ComponentInfo]: (
      currentComponentData && <ComponentInfoHeader library={library} usageKey={currentComponentData.usageKey} />
    ),
    [SidebarBodyComponentId.CollectionInfo]: (
      currentCollectionId && <CollectionInfoHeader library={library} collectionId={currentCollectionId} />
    ),
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
