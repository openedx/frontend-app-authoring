import { Button } from '@openedx/paragon';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import BaseModal from '../../../sharedComponents/BaseModal';
import messages from '../messages';

interface CancelConfirmModalProps {
  isOpen: boolean,
  closeCancelConfirmModal: () => void,
  onCloseEditor: (() => void) | null,
}

interface ActionButtonsProps {
  closeCancelConfirmModal: () => void,
  onCloseEditor: (() => void) | null,
}

const ActionButtons = ({
  closeCancelConfirmModal,
  onCloseEditor,
}: ActionButtonsProps) => (
  <div className="w-100 d-flex justify-content-between">
    <Button
      variant="outline-brand"
      onClick={() => onCloseEditor?.()}
    >
      <FormattedMessage {...messages.discardChangesButtonlabel} />
    </Button>
    <Button
      variant="primary"
      onClick={closeCancelConfirmModal}
    >
      <FormattedMessage {...messages.keepEditingButtonLabel} />
    </Button>
  </div>
);

const CancelConfirmModal = ({
  isOpen,
  closeCancelConfirmModal,
  onCloseEditor,
}: CancelConfirmModalProps) => {
  const intl = useIntl();
  return (
    <BaseModal
      size="lg"
      confirmAction={(
        <ActionButtons
          closeCancelConfirmModal={closeCancelConfirmModal}
          onCloseEditor={onCloseEditor}
        />
      )}
      isOpen={isOpen}
      close={closeCancelConfirmModal}
      title={intl.formatMessage(messages.cancelConfirmTitle)}
      hideCancelButton
    >
      <FormattedMessage {...messages.cancelConfirmDescription} />
    </BaseModal>
  );
};

export default CancelConfirmModal;
