import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, StandardModal, useToggle } from '@openedx/paragon';
import { OpenInFull } from '@openedx/paragon/icons';

import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { LibraryBlock } from '../LibraryBlock';
import messages from './messages';
import { useLibraryBlockMetadata } from '../data/apiHooks';

interface ModalComponentPreviewProps {
  isOpen: boolean;
  close: () => void;
  usageKey: string;
}

const ModalComponentPreview = ({ isOpen, close, usageKey }: ModalComponentPreviewProps) => {
  const intl = useIntl();
  const { showOnlyPublished } = useLibraryContext();

  return (
    <StandardModal
      title={intl.formatMessage(messages.previewModalTitle)}
      isOpen={isOpen}
      onClose={close}
      isOverflowVisible={false}
      className="component-preview-modal"
    >
      <LibraryBlock
        usageKey={usageKey}
        version={showOnlyPublished ? 'published' : undefined}
      />
    </StandardModal>
  );
};

const ComponentPreview = () => {
  const intl = useIntl();

  const [isModalOpen, openModal, closeModal] = useToggle();
  const { showOnlyPublished } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();

  const usageKey = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  const { data: componentMetadata } = useLibraryBlockMetadata(usageKey);

  return (
    <>
      <div className="position-relative m-2">
        <Button
          size="sm"
          variant="light"
          iconBefore={OpenInFull}
          onClick={openModal}
          className="position-absolute right-0 zindex-1 m-1"
        >
          {intl.formatMessage(messages.previewExpandButtonTitle)}
        </Button>
        {
          // key=modified below is used to auto-refresh the preview when changes are made, e.g. via OLX editor
          componentMetadata
            ? (
              <LibraryBlock
                usageKey={usageKey}
                key={componentMetadata.modified}
                version={showOnlyPublished ? 'published' : undefined}
              />
            )
            : null
        }
      </div>
      <ModalComponentPreview isOpen={isModalOpen} close={closeModal} usageKey={usageKey} />
    </>
  );
};

export default ComponentPreview;
