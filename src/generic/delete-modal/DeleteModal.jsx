import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  AlertModal,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import LoadingButton from '../loading-button';

const DeleteModal = ({
  category,
  isOpen,
  close,
  onDeleteSubmit,
  title,
  description,
  variant,
  btnLabel,
}) => {
  const intl = useIntl();

  const modalTitle = title || intl.formatMessage(messages.title, { category });
  const modalDescription = description || intl.formatMessage(messages.description, { category });
  const defaultBtnLabel = btnLabel || intl.formatMessage(messages.deleteButton);

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
          <LoadingButton
            data-testid="delete-confirm-button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await onDeleteSubmit();
            }}
            label={defaultBtnLabel}
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
  btnLabel: '',
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  category: PropTypes.string,
  onDeleteSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.string,
  btnLabel: PropTypes.string,
};

export default DeleteModal;
