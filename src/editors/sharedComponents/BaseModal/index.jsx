import React from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow,
  ModalDialog,
  Scrollable,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';

const BaseModal = ({
  isOpen,
  close,
  title,
  children,
  headerComponent,
  confirmAction,
  footerAction,
  size,
  isFullscreenScroll,
  bodyStyle,
  className,
}) => (
  <ModalDialog
    isOpen={isOpen}
    onClose={close}
    size={size}
    variant="default"
    hasCloseButton
    isFullscreenOnMobile
    isFullscreenScroll={isFullscreenScroll}
    title={title}
    className={className}
  >
    <ModalDialog.Header style={{ zIndex: 1, boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)' }}>
      <ModalDialog.Title>
        {title}
      </ModalDialog.Title>
      {headerComponent}
    </ModalDialog.Header>
    <Scrollable style={bodyStyle}>
      <ModalDialog.Body>
        {children}
      </ModalDialog.Body>
    </Scrollable>
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
  headerComponent: null,
  size: 'lg',
  isFullscreenScroll: true,
  bodyStyle: null,
  className: undefined,
};

BaseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  confirmAction: PropTypes.node.isRequired,
  footerAction: PropTypes.node,
  headerComponent: PropTypes.node,
  size: PropTypes.string,
  isFullscreenScroll: PropTypes.bool,
  bodyStyle: PropTypes.shape({}),
  className: PropTypes.string,
};

export default BaseModal;
