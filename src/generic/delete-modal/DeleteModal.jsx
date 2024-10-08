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
}) => {
  const intl = useIntl();

  const modalTitle = title || intl.formatMessage(messages.title, { category });
  const modalDescription = description || intl.formatMessage(messages.description, { category });

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
              default: intl.formatMessage(messages.deleteButton),
              pending: intl.formatMessage(messages.pendingDeleteButton),
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
};

export default DeleteModal;
