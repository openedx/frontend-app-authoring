import { Icon, ModalDialog, Stack } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import CompareChangesWidget from '@src/library-authoring/component-comparison/CompareChangesWidget';
import { type VersionSpec } from '@src/library-authoring/LibraryBlock';
import { getItemIcon } from '@src/generic/block-type-utils';
import { getBlockType, isContainerUsageKey } from '@src/generic/key-utils';

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
  const shouldShowDiff = !isContainerUsageKey(usageKey);

  if (!shouldShowDiff) {
    return null;
  }

  const title = intl.formatMessage(messages.previewChangesTitle, { title: oldTitle });
  const blockType = getBlockType(usageKey, 'empty');

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
        <ModalDialog.Title>
          <Stack direction='horizontal'>
            <FormattedMessage
              {...messages.previewChangesTitle}
              values={{
                title: (
                  <>
                    <Icon size='lg' src={getItemIcon(blockType)} className="mr-1" />
                    {oldTitle}
                  </>
                ),
              }}
            />
          </Stack>
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body className="bg-light-300">
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
