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
import { ContentLibrary } from '../data/api';

type LibrarySidebarProps = {
  library: ContentLibrary,
};

/**
 * Sidebar container for library pages.
 *
 * It's designed to "squash" the page when open.
 * Uses `sidebarBodyComponent` of the `store` to
 * choose which component is rendered.
 * You can add more components in `bodyComponentMap`.
 * Use the slice actions to open and close this sidebar.
 */
const LibrarySidebar = ({ library }: LibrarySidebarProps) => {
  const intl = useIntl();
  const { sidebarBodyComponent, closeLibrarySidebar } = useContext(LibraryContext);

  const bodyComponentMap = {
    [SidebarBodyComponentId.AddContent]: <AddContentContainer />,
    [SidebarBodyComponentId.Info]: <LibraryInfo library={library} />,
    unknown: null,
  };

  const headerComponentMap = {
    'add-content': <AddContentHeader />,
    info: <LibraryInfoHeader library={library} />,
    unknown: null,
  };

  const buildBody = () : React.ReactNode | null => bodyComponentMap[sidebarBodyComponent || 'unknown'];
  const buildHeader = (): React.ReactNode | null => headerComponentMap[sidebarBodyComponent || 'unknown'];

  return (
    <div className="p-2 vh-100 text-primary-700">
      <Stack direction="horizontal" className="d-flex justify-content-between">
        {buildHeader()}
        <IconButton
          src={Close}
          iconAs={Icon}
          alt={intl.formatMessage(messages.closeButtonAlt)}
          onClick={closeLibrarySidebar}
          variant="black"
        />
      </Stack>
      {buildBody()}
    </div>
  );
};

export default LibrarySidebar;
