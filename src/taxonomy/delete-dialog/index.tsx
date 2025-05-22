import React, { useCallback, useState } from 'react';
import {
  ActionRow,
  Button,
  Container,
  Form,
  ModalDialog,
  Icon,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Warning } from '@openedx/paragon/icons';
import messages from './messages';

interface DeleteDialogProps {
  taxonomyName: string;
  tagsCount: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  taxonomyName,
  tagsCount,
  isOpen,
  onClose,
  onDelete,
}) => {
  const intl = useIntl();
  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(true);
  const deleteLabel = intl.formatMessage(messages.deleteDialogConfirmDeleteLabel);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === deleteLabel) {
      setDeleteButtonDisabled(false);
    } else {
      setDeleteButtonDisabled(true);
    }
  }, [deleteLabel]);

  const onClickDelete = React.useCallback(() => {
    onClose();
    onDelete();
  }, [onClose, onDelete]);

  return (
    <Container onClick={(e) => e.stopPropagation() /* This prevents calling onClick handler from the parent */}>
      <ModalDialog
        title={intl.formatMessage(messages.deleteDialogTitle, { taxonomyName })}
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        hasCloseButton={false}
        isOverflowVisible
        variant="warning"
        className="taxonomy-delete-dialog"
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            <Icon src={Warning} className="d-inline-block text-warning warning-icon" />
            {intl.formatMessage(messages.deleteDialogTitle, { taxonomyName })}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <div className="mb-4">
            {intl.formatMessage(messages.deleteDialogBody, { tagsCount })}
          </div>
          <Form.Group>
            <Form.Label>
              {intl.formatMessage(messages.deleteDialogConfirmLabel, {
                deleteLabel: <b>{deleteLabel}</b>,
              })}
            </Form.Label>
            <Form.Control
              onChange={handleInputChange}
            />
          </Form.Group>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              {intl.formatMessage(messages.deleteDialogCancelLabel)}
            </ModalDialog.CloseButton>
            <Button
              variant="primary"
              disabled={deleteButtonDisabled}
              onClick={onClickDelete}
              data-testid="delete-button"
            >
              {intl.formatMessage(messages.deleteDialogDeleteLabel)}
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </Container>
  );
};

export default DeleteDialog;