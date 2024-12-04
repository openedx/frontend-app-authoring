import React from 'react';

import { StandardModal } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import LibraryTeam from './LibraryTeam';
import messages from './messages';

interface LibraryTeamModalProps {
  onClose: () => void;
}

export const LibraryTeamModal: React.FC<LibraryTeamModalProps> = ({
  onClose,
}) => {
  const intl = useIntl();

  // Show Library Team modal in full screen
  return (
    <StandardModal
      isOpen
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
