import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, StandardModal, useToggle } from '@openedx/paragon';
import { OpenInFull } from '@openedx/paragon/icons';

import { LibraryBlock } from '../LibraryBlock';
import messages from './messages';

// This is a simple overlay to prevent interaction with the preview
const PreviewOverlay = () => (
  <div className="position-absolute w-100 h-100 zindex-9" />
);

interface ModalComponentPreviewProps {
  isOpen: boolean;
  close: () => void;
  usageKey: string;
}

const ModalComponentPreview = ({ isOpen, close, usageKey }: ModalComponentPreviewProps) => {
  const intl = useIntl();

  return (
    <StandardModal
      title={intl.formatMessage(messages.previewModalTitle)}
      isOpen={isOpen}
      onClose={close}
      className="component-preview-modal"
    >
      <LibraryBlock usageKey={usageKey} />
    </StandardModal>
  );
};

interface ComponentPreviewProps {
  usageKey: string;
}

const ComponentPreview = ({ usageKey }: ComponentPreviewProps) => {
  const intl = useIntl();

  const [isModalOpen, openModal, closeModal] = useToggle();

  return (
    <>
      <div className="position-relative m-2">
        <PreviewOverlay />
        <Button
          size="sm"
          variant="light"
          iconBefore={OpenInFull}
          onClick={openModal}
          className="position-absolute right-0 zindex-10 m-1"
        >
          {intl.formatMessage(messages.previewExpandButtonTitle)}
        </Button>
        <LibraryBlock usageKey={usageKey} />
      </div>
      <ModalComponentPreview isOpen={isModalOpen} close={closeModal} usageKey={usageKey} />
    </>
  );
};

export default ComponentPreview;
