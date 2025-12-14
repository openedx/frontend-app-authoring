import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { ModalDialog } from '@openedx/paragon';

import messages from './messages';
import { CreateLibrary } from './CreateLibrary';
import type { ContentLibrary } from '../data/api';

interface CreateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  handlePostCreate: (library: ContentLibrary) => void,
}

export const CreateLibraryModal = ({
  isOpen,
  onClose,
  handlePostCreate,
}: CreateLibraryModalProps) => {
  const intl = useIntl();
  return (
    <ModalDialog
      title={intl.formatMessage(messages.createLibrary)}
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage {...messages.createLibrary} />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <CreateLibrary
          handleCancel={onClose}
          handlePostCreate={handlePostCreate}
          showInModal
        />
      </ModalDialog.Body>
    </ModalDialog>
  );
};
