import {
  ActionRow,
  Button,
  AlertModal,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import LoadingButton from '../loading-button';

interface DeleteModalProps {
  isOpen: boolean;
  close: () => void;
  category?: string;
  onDeleteSubmit: () => void | Promise<void>;
  title?: string;
  description?: React.ReactNode | React.ReactNode[];
  variant?: string;
  btnLabel?: string;
  icon?: React.ElementType;
}

const DeleteModal = ({
  category = '',
  isOpen,
  close,
  onDeleteSubmit,
  title,
  description,
  variant = 'default',
  btnLabel,
  icon,
}: DeleteModalProps) => {
  const intl = useIntl();

  const modalTitle = title || intl.formatMessage(messages.title, { category });
  const modalDescription = description || intl.formatMessage(messages.description, { category });
  const defaultBtnLabel = btnLabel || intl.formatMessage(messages.deleteButton);

  return (
    <AlertModal
      title={modalTitle}
      isOpen={isOpen}
      onClose={close}
      variant={variant}
      icon={icon}
      footerNode={(
        <ActionRow>
          <Button
            variant="tertiary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              close();
            }}
          >
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <LoadingButton
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await onDeleteSubmit();
            }}
            variant="brand"
            label={defaultBtnLabel}
          />
        </ActionRow>
      )}
    >
      <p>{modalDescription}</p>
    </AlertModal>
  );
};

export default DeleteModal;
