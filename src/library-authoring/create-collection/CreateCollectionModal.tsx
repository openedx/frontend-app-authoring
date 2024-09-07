import React from 'react';
import {
  ActionRow,
  Button,
  Form,
  ModalDialog,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import { LibraryContext } from '../common/context';
import messages from './messages';
import { useCreateLibraryCollection } from '../data/apiHooks';
import { ToastContext } from '../../generic/toast-context';

const CreateCollectionModal = () => {
  const intl = useIntl();
  const { libraryId } = useParams();
  const create = useCreateLibraryCollection(libraryId);
  const {
    isCreateCollectionModalOpen,
    closeCreateCollectionModal,
  } = React.useContext(LibraryContext);
  const { showToast } = React.useContext(ToastContext);

  const [collectionName, setCollectionName] = React.useState<string | null>(null);
  const [collectionNameInvalidMsg, setCollectionNameInvalidMsg] = React.useState<string | null>(null);
  const [collectionDescription, setCollectionDescription] = React.useState<string | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = React.useState<boolean>(false);

  const handleNameOnChange = React.useCallback((value : string) => {
    setCollectionName(value);
    setCollectionNameInvalidMsg(null);
  }, []);

  const handleOnClose = React.useCallback(() => {
    closeCreateCollectionModal();
    setCollectionNameInvalidMsg(null);
    setCollectionName(null);
    setCollectionDescription(null);
    setIsCreatingCollection(false);
  }, []);

  const handleCreate = React.useCallback(() => {
    if (collectionName === null || collectionName === '') {
      setCollectionNameInvalidMsg(
        intl.formatMessage(messages.createCollectionModalNameInvalid),
      );
      return;
    }

    setIsCreatingCollection(true);

    create.mutateAsync({
      title: collectionName,
      description: collectionDescription || '',
    }).then(() => {
      handleOnClose();
      showToast(intl.formatMessage(messages.createCollectionSuccess));
    }).catch((err) => {
      setIsCreatingCollection(false);
      if (err.customAttributes.httpErrorStatus === 409) {
        setCollectionNameInvalidMsg(
          intl.formatMessage(messages.createCollectionModalNameConflict),
        );
      } else {
        showToast(intl.formatMessage(messages.createCollectionError));
      }
    });
  }, [collectionName, collectionDescription]);

  return (
    <ModalDialog
      title={intl.formatMessage(messages.createCollectionModalTitle)}
      isOpen={isCreateCollectionModalOpen}
      onClose={handleOnClose}
      size="xl"
      hasCloseButton
      isFullscreenOnMobile
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.createCollectionModalTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body className="mw-sm">
        <Form>
          <Form.Group>
            <Form.Label className="font-weight-bold h3">
              {intl.formatMessage(messages.createCollectionModalNameLabel)}
            </Form.Label>
            <Form.Control
              placeholder={intl.formatMessage(messages.createCollectionModalNamePlaceholder)}
              value={collectionName}
              onChange={(e) => handleNameOnChange(e.target.value)}
            />
            { collectionNameInvalidMsg && (
              <Form.Control.Feedback type="invalid">
                {collectionNameInvalidMsg}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label className="font-weight-bold h3">
              {intl.formatMessage(messages.createCollectionModalDescriptionLabel)}
            </Form.Label>
            <Form.Control
              as="textarea"
              placeholder={intl.formatMessage(messages.createCollectionModalDescriptionPlaceholder)}
              value={collectionDescription}
              onChange={(e) => setCollectionDescription(e.target.value)}
              rows="5"
            />
            <Form.Text muted>
              {intl.formatMessage(messages.createCollectionModalDescriptionDetails)}
            </Form.Text>
          </Form.Group>
        </Form>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.createCollectionModalCancel)}
          </ModalDialog.CloseButton>
          <Button variant="primary" onClick={handleCreate} disabled={isCreatingCollection}>
            {intl.formatMessage(messages.createCollectionModalCreate)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default CreateCollectionModal;
