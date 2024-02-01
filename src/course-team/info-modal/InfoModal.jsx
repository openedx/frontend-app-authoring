import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  AlertModal,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { MODAL_TYPES } from '../constants';
import { getInfoModalSettings } from '../utils';

const InfoModal = ({
  modalType,
  isOpen,
  close,
  onDeleteSubmit,
  currentEmail,
  errorMessage,
  courseName,
}) => {
  const intl = useIntl();

  const {
    title,
    message,
    variant,
    closeButtonText,
    submitButtonText,
    closeButtonVariant,
  } = getInfoModalSettings(modalType, currentEmail, errorMessage, courseName, intl);

  const isEmptyErrorMessage = modalType === MODAL_TYPES.error && !errorMessage;

  return (
    <AlertModal
      title={title}
      variant={variant}
      isOpen={isOpen && !isEmptyErrorMessage}
      onClose={close}
      footerNode={(
        <ActionRow>
          <Button variant={closeButtonVariant} onClick={close}>
            {closeButtonText}
          </Button>
          {modalType === MODAL_TYPES.delete && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                onDeleteSubmit();
              }}
            >
              {submitButtonText}
            </Button>
          )}
        </ActionRow>
      )}
    >
      <p>{message}</p>
    </AlertModal>
  );
};

InfoModal.propTypes = {
  modalType: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  currentEmail: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  courseName: PropTypes.string.isRequired,
  onDeleteSubmit: PropTypes.func.isRequired,
};

export default InfoModal;
