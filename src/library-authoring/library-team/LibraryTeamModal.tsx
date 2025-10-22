import { StandardModal } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import LibraryTeam from './LibraryTeam';
import messages from './messages';
import { SidebarActions, useSidebarContext } from '../common/context/SidebarContext';
import { useCallback } from 'react';

export const LibraryTeamModal = () => {
  const intl = useIntl();
  const { sidebarAction, resetSidebarAction } = useSidebarContext();
  // Open the library team modal only when Manage Team sidebar action is set
  const isOpen = (sidebarAction === SidebarActions.ManageTeam);
  const onClose = useCallback(() => {
    resetSidebarAction();
  }, [resetSidebarAction]);

  // Show Library Team modal in full screen
  return (
    <StandardModal
      isOpen={isOpen}
      title={intl.formatMessage(messages.modalTitle)}
      onClose={onClose}
      size="lg"
      isOverflowVisible={false}
    >
      <LibraryTeam />
    </StandardModal>
  );
};

export default LibraryTeamModal;
