import { useCallback } from 'react';
import { Button, Hyperlink, Stack } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import LibraryPublishStatus from './LibraryPublishStatus';
import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarActions, useSidebarContext } from '../common/context/SidebarContext';

const LibraryInfo = () => {
  const intl = useIntl();
  const { libraryId, libraryData, readOnly } = useLibraryContext();
  const { setSidebarAction } = useSidebarContext();
  const adminConsoleUrl = getConfig().ADMIN_CONSOLE_URL;

  // always show link to admin console MFE if it is being used
  const shouldShowAdminConsoleLink = !!adminConsoleUrl;

  // if the admin console MFE isn't being used, show team modal button for non–read-only users
  const shouldShowTeamModalButton = !adminConsoleUrl && !readOnly;

  const openLibraryTeamModal = useCallback(() => {
    setSidebarAction(SidebarActions.ManageTeam);
  }, [setSidebarAction]);

  return (
    <Stack direction="vertical" gap={2.5}>
      <LibraryPublishStatus />
      <Stack gap={3} direction="vertical">
        <span className="font-weight-bold">
          {intl.formatMessage(messages.organizationSectionTitle)}
        </span>
        <span>
          {libraryData?.org}
        </span>
        {shouldShowTeamModalButton && (
          <Button variant="outline-primary" onClick={openLibraryTeamModal}>
            {intl.formatMessage(messages.libraryTeamButtonTitle)}
          </Button>
        )}
        {shouldShowAdminConsoleLink && (
          <Button as={Hyperlink} variant="outline-primary" destination={`${adminConsoleUrl}/authz/libraries/${libraryId}`} target="_blank">
            {intl.formatMessage(messages.libraryTeamButtonTitle)}
          </Button>
        )}
      </Stack>
      <Stack gap={3}>
        <span className="font-weight-bold">
          {intl.formatMessage(messages.libraryHistorySectionTitle)}
        </span>
        <Stack gap={1}>
          <span className="small text-gray-500">
            {intl.formatMessage(messages.lastModifiedLabel)}
          </span>
          <span className="small">
            <FormattedDate
              value={libraryData?.updated ?? undefined}
              year="numeric"
              month="long"
              day="2-digit"
            />
          </span>
        </Stack>
        <Stack gap={1}>
          <span className="small text-gray-500">
            {intl.formatMessage(messages.createdLabel)}
          </span>
          <span className="small">
            <FormattedDate
              value={libraryData?.created ?? undefined}
              year="numeric"
              month="long"
              day="2-digit"
            />
          </span>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LibraryInfo;
