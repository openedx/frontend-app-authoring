import React from 'react';
import {
  ActionRow,
  Form,
  ModalDialog,
} from '@openedx/paragon';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormikControl from '../../generic/FormikControl';
import LoadingButton from '../../generic/loading-button';
import { useLibraryContext } from '../common/context/LibraryContext';
import messages from './messages';
import { useCreateLibraryCollection } from '../data/apiHooks';
import { ToastContext } from '../../generic/toast-context';

const CreateCollectionModal = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const {
    libraryId,
    isCreateCollectionModalOpen,
    closeCreateCollectionModal,
  } = useLibraryContext();
  const create = useCreateLibraryCollection(libraryId);
  const { showToast } = React.useContext(ToastContext);

  const handleCreate = React.useCallback((values) => {
    create.mutateAsync(values).then((data) => {
      closeCreateCollectionModal();
      navigate(`/library/${libraryId}/collection/${data.key}`);
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
      isOverflowVisible
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
          <Form onSubmit={formikProps.handleSubmit}>
            <ModalDialog.Body className="mw-sm">
              <FormikControl
                name="title"
                label={(
                  <Form.Label className="font-weight-bold h3">
                    {intl.formatMessage(messages.createCollectionModalNameLabel)}
                  </Form.Label>
                )}
                value={formikProps.values.title}
                placeholder={intl.formatMessage(messages.createCollectionModalNamePlaceholder)}
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
                help={(
                  <Form.Text>
                    {intl.formatMessage(messages.createCollectionModalDescriptionDetails)}
                  </Form.Text>
                )}
                controlClasses="pb-2"
                rows="5"
              />
            </ModalDialog.Body>
            <ModalDialog.Footer>
              <ActionRow>
                <ModalDialog.CloseButton variant="tertiary">
                  {intl.formatMessage(messages.createCollectionModalCancel)}
                </ModalDialog.CloseButton>
                <LoadingButton
                  variant="primary"
                  onClick={formikProps.submitForm}
                  disabled={!formikProps.isValid || !formikProps.dirty}
                  isLoading={formikProps.isSubmitting}
                  label={intl.formatMessage(messages.createCollectionModalCreate)}
                  type="submit"
                />
              </ActionRow>
            </ModalDialog.Footer>
          </Form>
        )}
      </Formik>
    </ModalDialog>
  );
};

export default CreateCollectionModal;
