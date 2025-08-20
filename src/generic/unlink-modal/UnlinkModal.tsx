import {
  ActionRow,
  Button,
  AlertModal,
} from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import LoadingButton from '../loading-button';

const BoldText = (chunk: string[]) => <b>{chunk}</b>;

interface UnlinkModalProps {
  displayName?: string;
  category?: string;
  isOpen: boolean;
  close: () => void;
  onUnlinkSubmit: () => void | Promise<void>,
}

export const UnlinkModal = ({
  displayName,
  category,
  isOpen,
  close,
  onUnlinkSubmit,
}: UnlinkModalProps) => {
  const intl = useIntl();
  if (!category || !displayName) {
    // On the first render, the initial values for `category` and `name` might be undefined.
    return null;
  }

  const categoryName = intl.formatMessage(messages[`${category}Name` as keyof typeof messages]);
  const childrenCategoryName = intl.formatMessage(messages[`${category}ChildrenName` as keyof typeof messages]);
  const modalTitle = intl.formatMessage(messages.title, { displayName });
  const modalDescription = intl.formatMessage(messages.description, {
    categoryName,
    childrenCategoryName,
    b: BoldText,
    br: <br />,
  });

  return (
    <AlertModal
      title={modalTitle}
      isOpen={isOpen}
      onClose={close}
      variant="warning"
      icon={Warning}
      footerNode={(
        <ActionRow>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              close();
            }}
            variant="tertiary"
          >
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <LoadingButton
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await onUnlinkSubmit();
            }}
            variant="primary"
            label={intl.formatMessage(messages.unlinkButton)}
          />
        </ActionRow>
      )}
    >
      <div>{modalDescription}</div>
    </AlertModal>
  );
};
