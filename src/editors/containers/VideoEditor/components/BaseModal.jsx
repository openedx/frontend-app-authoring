import React from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow,
  ModalDialog,
} from '@openedx/paragon';

export const BaseModal = ({
  isOpen,
  close,
  title,
  children,
  confirmAction,
}) => (
  <ModalDialog
    title="My dialog"
    isOpen={isOpen}
    onClose={close}
    size="lg"
    variant="default"
    hasCloseButton
    isFullscreenOnMobile
  >
    <ModalDialog.Header>
      <ModalDialog.Title>
        {title}
      </ModalDialog.Title>
    </ModalDialog.Header>
    <ModalDialog.Body>
      {children}
    </ModalDialog.Body>
    <ModalDialog.Footer>
      <ActionRow>
        <ModalDialog.CloseButton variant="tertiary" onClick={close}>
          Cancel
        </ModalDialog.CloseButton>
        {confirmAction}
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

BaseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  confirmAction: PropTypes.node.isRequired,
};

export default BaseModal;
