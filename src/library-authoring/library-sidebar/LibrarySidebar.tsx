import React, { useContext } from 'react';
import {
  Stack,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';
import { AddContentContainer, AddContentHeader } from '../add-content';
import { LibraryContext, SidebarBodyComponentId } from '../common/context';
import { LibraryInfo, LibraryInfoHeader } from '../library-info';
import { ComponentInfo, ComponentInfoHeader } from '../component-info';
import { ContentLibrary } from '../data/api';
import { CollectionInfo, CollectionInfoHeader } from '../collections';
import { type CollectionHit } from '../../search-manager/data/api';

type LibrarySidebarProps = {
  library: ContentLibrary,
  collection?: CollectionHit,
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
const LibrarySidebar = ({ library, collection }: LibrarySidebarProps) => {
  const intl = useIntl();
  const {
    sidebarBodyComponent,
    closeLibrarySidebar,
    currentComponentUsageKey,
  } = useContext(LibraryContext);

  const bodyComponentMap = {
    [SidebarBodyComponentId.AddContent]: <AddContentContainer />,
    [SidebarBodyComponentId.Info]: <LibraryInfo library={library} />,
    [SidebarBodyComponentId.ComponentInfo]: (
      currentComponentUsageKey && <ComponentInfo usageKey={currentComponentUsageKey} />
    ),
    [SidebarBodyComponentId.CollectionInfo]: <CollectionInfo />,
    unknown: null,
  };

  const headerComponentMap = {
    [SidebarBodyComponentId.AddContent]: <AddContentHeader />,
    [SidebarBodyComponentId.Info]: <LibraryInfoHeader library={library} />,
    [SidebarBodyComponentId.ComponentInfo]: (
      currentComponentUsageKey && <ComponentInfoHeader library={library} usageKey={currentComponentUsageKey} />
    ),
    [SidebarBodyComponentId.CollectionInfo]: <CollectionInfoHeader collection={collection} />,
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
