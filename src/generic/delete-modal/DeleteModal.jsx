import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  AlertModal,
  StatefulButton,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

const DeleteModal = ({
  category,
  isOpen,
  close,
  onDeleteSubmit,
  title,
  description,
  variant,
  btnState,
  btnDefaultLabel,
  btnPendingLabel,
}) => {
  const intl = useIntl();

  const modalTitle = title || intl.formatMessage(messages.title, { category });
  const modalDescription = description || intl.formatMessage(messages.description, { category });
  const defaultBtnLabel = btnDefaultLabel || intl.formatMessage(messages.deleteButton);
  const pendingBtnLabel = btnPendingLabel || intl.formatMessage(messages.pendingDeleteButton);

  return (
    <AlertModal
      title={modalTitle}
      isOpen={isOpen}
      onClose={close}
      variant={variant}
      footerNode={(
        <ActionRow>
          <Button
            variant="tertiary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              close();
            }}
          >
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <StatefulButton
            data-testid="delete-confirm-button"
            state={btnState}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeleteSubmit();
            }}
            labels={{
              default: defaultBtnLabel,
              pending: pendingBtnLabel,
            }}
          />
        </ActionRow>
      )}
    >
      <p>{modalDescription}</p>
    </AlertModal>
  );
};

DeleteModal.defaultProps = {
  category: '',
  title: '',
  description: '',
  variant: 'default',
  btnState: 'default',
  btnDefaultLabel: '',
  btnPendingLabel: '',
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  category: PropTypes.string,
  onDeleteSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.string,
  btnState: PropTypes.string,
  btnDefaultLabel: PropTypes.string,
  btnPendingLabel: PropTypes.string,
};

export default DeleteModal;
