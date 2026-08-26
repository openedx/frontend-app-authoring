import { ReactNode } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { ActionRow, ModalDialog } from '@openedx/paragon';

import messages from './messages';

export interface AppSettingsModalBaseProps {
  title: string;
  onClose: () => void;
  variant: 'default' | 'dark';
  isMobile: boolean;
  children: ReactNode;
  footer?: ReactNode;
  disclaimer?: ReactNode;
  isOpen: boolean;
}

const AppSettingsModalBase = ({
  title,
  onClose,
  variant,
  isMobile,
  children,
  footer,
  disclaimer,
  isOpen = true,
}: AppSettingsModalBaseProps) => (
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
          <FormattedMessage {...messages.cancel} />
        </ModalDialog.CloseButton>
        {footer}
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

export default AppSettingsModalBase;
