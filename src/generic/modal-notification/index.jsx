import React from 'react';
import PropTypes from 'prop-types';
import { ActionRow, AlertModal, Button } from '@openedx/paragon';

const ModalNotification = ({
  isOpen, title, message, handleCancel, handleAction, cancelButtonText, actionButtonText, variant, icon,
}) => (
  <AlertModal
    title={title}
    isOpen={isOpen}
    variant={variant}
    icon={icon}
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

ModalNotification.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleAction: PropTypes.func.isRequired,
  cancelButtonText: PropTypes.string.isRequired,
  actionButtonText: PropTypes.string.isRequired,
  variant: PropTypes.string,
  icon: PropTypes.elementType,
};

ModalNotification.defaultProps = {
  variant: 'default',
  icon: undefined,
};

export default ModalNotification;
