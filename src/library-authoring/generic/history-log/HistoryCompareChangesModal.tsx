import { ModalDialog } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import CompareChangesWidget from '@src/library-authoring/component-comparison/CompareChangesWidget';
import { type VersionSpec } from '@src/library-authoring/LibraryBlock';

import messages from './messages';
import classNames from 'classnames';

interface HistoryCompareChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageKey: string;
  oldTitle?: string;
  oldVersion?: VersionSpec;
  newVersion?: VersionSpec;
  sideBySide?: boolean;
}

const HistoryCompareChangesModal = ({
  isOpen,
  onClose,
  usageKey,
  oldTitle,
  oldVersion,
  newVersion = 'published',
  sideBySide = true,
}: HistoryCompareChangesModalProps) => {
  const intl = useIntl();
  const title = intl.formatMessage(messages.previewChangesTitle, { title: oldTitle });

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className={classNames({'w-xl-100 mw-xl': sideBySide})}
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
          sideBySide={sideBySide}
          showTitle
        />
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default HistoryCompareChangesModal;
