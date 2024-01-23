import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  AlertModal,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

const DeleteModal = ({
  category, isOpen, close, onDeleteSubmit,
}) => {
  const intl = useIntl();

  return (
    <AlertModal
      title={intl.formatMessage(messages.title, { category })}
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
      <p>{intl.formatMessage(messages.description, { category })}</p>
    </AlertModal>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  onDeleteSubmit: PropTypes.func.isRequired,
};

export default DeleteModal;
