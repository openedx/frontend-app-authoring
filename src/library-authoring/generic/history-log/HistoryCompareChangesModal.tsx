import { ModalDialog } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import CompareChangesWidget from '@src/library-authoring/component-comparison/CompareChangesWidget';
import { type VersionSpec } from '@src/library-authoring/LibraryBlock';

import messages from './messages';

interface HistoryCompareChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageKey: string;
  oldTitle?: string;
  oldVersion?: VersionSpec;
  newVersion?: VersionSpec;
}

const HistoryCompareChangesModal = ({
  isOpen,
  onClose,
  usageKey,
  oldTitle,
  oldVersion,
  newVersion = 'published',
}: HistoryCompareChangesModalProps) => {
  const intl = useIntl();
  const title = intl.formatMessage(messages.previewChangesTitle, { title: oldTitle });

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={title}
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{title}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <CompareChangesWidget
          usageKey={usageKey}
          oldTitle={oldTitle}
          oldVersion={oldVersion}
          newVersion={newVersion}
        />
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default HistoryCompareChangesModal;
