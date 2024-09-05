import React from 'react';
import {
  ActionRow,
  Button,
  Form,
  ModalDialog,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { LibraryContext } from '../common/context';
import messages from './messages';

const CreateCollectionModal = () => {
  const intl = useIntl();
  const {
    isCreateCollectionModalOpen,
    closeCreateCollectionModal,
  } = React.useContext(LibraryContext);

  const [collectionName, setCollectionName] = React.useState<string | null>(null);
  const [isCollectionNameInvalid, setIsCollectionNameInvalid] = React.useState<boolean>(false);
  const [collectionDescription, setCollectionDescription] = React.useState<string | null>(null);

  const handleNameOnChange = React.useCallback((value : string) => {
    setCollectionName(value);
    setIsCollectionNameInvalid(false);
  }, []);

  const handleCreate = React.useCallback(() => {
    if (collectionName === null || collectionName === '') {
      setIsCollectionNameInvalid(true);
      return;
    }
    // TODO call API
    setCollectionName(null);
    setCollectionDescription(null);
    closeCreateCollectionModal();
  }, [collectionName, collectionDescription]);

  return (
    <ModalDialog
      title={intl.formatMessage(messages.createCollectionModalTitle)}
      isOpen={isCreateCollectionModalOpen}
      onClose={closeCreateCollectionModal}
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
            { isCollectionNameInvalid && (
              <Form.Control.Feedback type="invalid">
                {intl.formatMessage(messages.createCollectionModalNameInvalid)}
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
          <Button variant="primary" onClick={handleCreate}>
            {intl.formatMessage(messages.createCollectionModalCreate)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default CreateCollectionModal;
