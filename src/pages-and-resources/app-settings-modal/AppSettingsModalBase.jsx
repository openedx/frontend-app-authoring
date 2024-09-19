import { useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, ModalDialog } from '@openedx/paragon';

import PropTypes from 'prop-types';
import React from 'react';

import messages from './messages';

const AppSettingsModalBase = ({
  title,
  onClose,
  variant,
  isMobile,
  children,
  footer,
  disclaimer,
  isOpen,
}) => {
  const { formatMessage } = useIntl();
  return (
    <ModalDialog
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      variant={variant}
      hasCloseButton={isMobile}
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title data-testid="modal-title">{title}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>{children}</ModalDialog.Body>
      <ModalDialog.Footer className="p-4">
        {disclaimer}
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {formatMessage(messages.cancel)}
          </ModalDialog.CloseButton>
          {footer}
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

AppSettingsModalBase.defaultProps = {
  isOpen: true,
};

AppSettingsModalBase.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'dark']).isRequired,
  isMobile: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  disclaimer: PropTypes.node,
  isOpen: PropTypes.bool,
};

AppSettingsModalBase.defaultProps = {
  footer: null,
  disclaimer: null,
};

export default AppSettingsModalBase;
