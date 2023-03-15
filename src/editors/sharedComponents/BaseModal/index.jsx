import React from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow,
  ModalDialog,
} from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';

export const BaseModal = ({
  isOpen,
  close,
  title,
  children,
  confirmAction,
  footerAction,
  size,
  isFullscreenScroll,
}) => (
  <ModalDialog
    isOpen={isOpen}
    onClose={close}
    size={size}
    variant="default"
    hasCloseButton
    isFullscreenOnMobile
    isFullscreenScroll={isFullscreenScroll}
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
        {footerAction}
        <ActionRow.Spacer />
        <ModalDialog.CloseButton variant="tertiary" onClick={close}>
          <FormattedMessage {...messages.cancelButtonLabel} />
        </ModalDialog.CloseButton>
        {confirmAction}
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

BaseModal.defaultProps = {
  footerAction: null,
  size: 'lg',
  isFullscreenScroll: true,
};

BaseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  confirmAction: PropTypes.node.isRequired,
  footerAction: PropTypes.node,
  size: PropTypes.string,
  isFullscreenScroll: PropTypes.bool,
};

export default BaseModal;
