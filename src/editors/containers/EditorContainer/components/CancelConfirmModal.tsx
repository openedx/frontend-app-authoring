import { Button } from '@openedx/paragon';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import BaseModal from '../../../sharedComponents/BaseModal';
import messages from '../messages';

interface CancelConfirmModalProps {
  isOpen: boolean,
  closeCancelConfirmModal: () => void,
  onCloseEditor: (() => void) | null,
}

const CancelConfirmModal = ({
  isOpen,
  closeCancelConfirmModal,
  onCloseEditor,
}: CancelConfirmModalProps) => {
  const intl = useIntl();
  return (
    <BaseModal
      size="md"
      confirmAction={(
        <Button
          variant="primary"
          onClick={() => {
            if (onCloseEditor) {
              onCloseEditor();
            }
          }}
        >
          <FormattedMessage {...messages.okButtonLabel} />
        </Button>
      )}
      isOpen={isOpen}
      close={closeCancelConfirmModal}
      title={intl.formatMessage(messages.cancelConfirmTitle)}
    >
      <FormattedMessage {...messages.cancelConfirmDescription} />
    </BaseModal>
  );
};

export default CancelConfirmModal;
