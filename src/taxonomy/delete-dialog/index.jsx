// @ts-check
import React, { useCallback, useState } from 'react';
import {
  ActionRow,
  Button,
  Container,
  Form,
  ModalDialog,
  Icon,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Warning } from '@openedx/paragon/icons';
import messages from './messages';

const DeleteDialog = ({
  taxonomyName,
  tagsCount,
  isOpen,
  onClose,
  onDelete,
}) => {
  const intl = useIntl();
  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(true);
  const deleteLabel = intl.formatMessage(messages.deleteDialogConfirmDeleteLabel);

  const handleInputChange = useCallback((event) => {
    if (event.target.value === deleteLabel) {
      setDeleteButtonDisabled(false);
    } else {
      setDeleteButtonDisabled(true);
    }
  }, []);

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

DeleteDialog.propTypes = {
  taxonomyName: PropTypes.string.isRequired,
  tagsCount: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DeleteDialog;
