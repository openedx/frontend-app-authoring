import { useCallback } from 'react';
import { Button, Stack } from '@openedx/paragon';
import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import LibraryPublishStatus from './LibraryPublishStatus';
import { LibraryTeamModal } from '../library-team';
import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarActions, useSidebarContext } from '../common/context/SidebarContext';

const LibraryInfo = () => {
  const intl = useIntl();
  const { libraryData, readOnly } = useLibraryContext();
  const { sidebarAction, setSidebarAction, resetSidebarAction } = useSidebarContext();
  const isLibraryTeamModalOpen = (sidebarAction === SidebarActions.ManageTeam);
  const openLibraryTeamModal = useCallback(() => {
    setSidebarAction(SidebarActions.ManageTeam);
  }, [setSidebarAction]);
  const closeLibraryTeamModal = useCallback(() => {
    resetSidebarAction();
  }, [resetSidebarAction]);

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
        {!readOnly && (
          <Button variant="outline-primary" onClick={openLibraryTeamModal}>
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
      {isLibraryTeamModalOpen && <LibraryTeamModal onClose={closeLibraryTeamModal} />}
    </Stack>
  );
};

export default LibraryInfo;
