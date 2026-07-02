import React from 'react';

import {
  ActionRow,
  ModalDialog,
  Scrollable,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';

interface BaseModalProps {
  isOpen: boolean;
  close: () => void;
  title: string;
  children: React.ReactNode;
  confirmAction: React.ReactNode;
  footerAction?: React.ReactNode;
  headerComponent?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  isFullscreenScroll?: boolean;
  bodyStyle?: React.CSSProperties;
  className?: string;
  hideCancelButton?: boolean;
}

const BaseModal = ({
  isOpen,
  close,
  title,
  children,
  headerComponent,
  confirmAction,
  footerAction = null,
  size = 'lg',
  isFullscreenScroll = true,
  bodyStyle,
  className,
  hideCancelButton = false,
}: BaseModalProps) => (
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
    isOverflowVisible={false}
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
        {footerAction && (
          <>
            {footerAction}
            <ActionRow.Spacer />
          </>
        )}
        {!hideCancelButton && (
          <ModalDialog.CloseButton variant="tertiary" onClick={close}>
            <FormattedMessage {...messages.cancelButtonLabel} />
          </ModalDialog.CloseButton>
        )}
        {confirmAction}
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

export default BaseModal;
