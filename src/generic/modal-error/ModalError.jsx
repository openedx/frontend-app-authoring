import React from 'react';
import PropTypes from 'prop-types';
import { ActionRow, AlertModal, Button } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

const ModalError = ({
  isOpen, title, message, handleCancel, handleAction, cancelButtonText, actionButtonText,
}) => (
  <AlertModal
    title={title}
    isOpen={isOpen}
    variant="danger"
    icon={Error}
    footerNode={(
      <ActionRow>
        <Button variant="tertiary" onClick={handleCancel}>{cancelButtonText}</Button>
        <Button onClick={handleAction}>{actionButtonText}</Button>
      </ActionRow>
    )}
  >
    <p>{message}</p>
  </AlertModal>
);

ModalError.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleAction: PropTypes.func.isRequired,
  cancelButtonText: PropTypes.string.isRequired,
  actionButtonText: PropTypes.string.isRequired,
};

export default ModalError;
