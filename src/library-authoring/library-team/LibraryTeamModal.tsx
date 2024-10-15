import React from 'react';

import { StandardModal } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useLibraryContext } from '../common/context';
import LibraryTeam from './LibraryTeam';
import messages from './messages';

export const LibraryTeamModal: React.FC<Record<never, never>> = () => {
  const intl = useIntl();
  const {
    isLibraryTeamModalOpen,
    closeLibraryTeamModal,
  } = useLibraryContext();

  // Show Library Team modal in full screen
  return (
    <StandardModal
      title={intl.formatMessage(messages.modalTitle)}
      isOpen={isLibraryTeamModalOpen}
      onClose={closeLibraryTeamModal}
      size="lg"
      isOverflowVisible={false}
    >
      <LibraryTeam />
    </StandardModal>
  );
};

export default LibraryTeamModal;
