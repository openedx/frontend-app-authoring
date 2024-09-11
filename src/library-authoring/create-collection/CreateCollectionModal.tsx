import React from 'react';
import {
  ActionRow,
  Button,
  Form,
  ModalDialog,
} from '@openedx/paragon';
import { useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormikControl from '../../generic/FormikControl';
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

  const handleCreate = React.useCallback((values) => {
    create.mutateAsync(values).then(() => {
      closeCreateCollectionModal();
      showToast(intl.formatMessage(messages.createCollectionSuccess));
    }).catch(() => {
      showToast(intl.formatMessage(messages.createCollectionError));
    });
  }, []);

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

      <Formik
        initialValues={{
          title: '',
          description: '',
        }}
        validationSchema={
          Yup.object().shape({
            title: Yup.string()
              .required(intl.formatMessage(messages.createCollectionModalNameInvalid)),
            description: Yup.string(),
          })
        }
        onSubmit={handleCreate}
      >
        {(formikProps) => (
          <>
            <ModalDialog.Body className="mw-sm">
              <Form onSubmit={formikProps.handleSubmit}>
                <FormikControl
                  name="title"
                  label={(
                    <Form.Label className="font-weight-bold h3">
                      {intl.formatMessage(messages.createCollectionModalNameLabel)}
                    </Form.Label>
                  )}
                  value={formikProps.values.title}
                  placeholder={intl.formatMessage(messages.createCollectionModalNamePlaceholder)}
                  help=""
                  className=""
                  controlClasses="pb-2"
                />
                <FormikControl
                  name="description"
                  as="textarea"
                  label={(
                    <Form.Label className="font-weight-bold h3">
                      {intl.formatMessage(messages.createCollectionModalDescriptionLabel)}
                    </Form.Label>
                  )}
                  value={formikProps.values.description}
                  placeholder={intl.formatMessage(messages.createCollectionModalDescriptionPlaceholder)}
                  help={intl.formatMessage(messages.createCollectionModalDescriptionDetails)}
                  className=""
                  controlClasses="pb-2"
                  rows="5"
                />
              </Form>
            </ModalDialog.Body>
            <ModalDialog.Footer>
              <ActionRow>
                <ModalDialog.CloseButton variant="tertiary">
                  {intl.formatMessage(messages.createCollectionModalCancel)}
                </ModalDialog.CloseButton>
                <Button
                  variant="primary"
                  onClick={formikProps.submitForm}
                  disabled={formikProps.isSubmitting || !formikProps.isValid || !formikProps.dirty}
                >
                  {intl.formatMessage(messages.createCollectionModalCreate)}
                </Button>
              </ActionRow>
            </ModalDialog.Footer>
          </>
        )}
      </Formik>
    </ModalDialog>
  );
};

export default CreateCollectionModal;
