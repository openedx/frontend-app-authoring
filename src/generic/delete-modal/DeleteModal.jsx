import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  AlertModal,
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
}) => {
  const intl = useIntl();

  const modalTitle = title || intl.formatMessage(messages.title, { category });
  const modalDescription = description || intl.formatMessage(messages.description, { category });

  return (
    <AlertModal
      title={modalTitle}
      isOpen={isOpen}
      onClose={close}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={close}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button
            data-testid="delete-confirm-button"
            onClick={(e) => {
              e.preventDefault();
              onDeleteSubmit();
            }}
          >
            {intl.formatMessage(messages.deleteButton, { category })}
          </Button>
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
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  category: PropTypes.string,
  onDeleteSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default DeleteModal;
