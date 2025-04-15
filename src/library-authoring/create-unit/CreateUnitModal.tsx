import React from 'react';
import {
  ActionRow,
  Form,
  ModalDialog,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Formik } from 'formik';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';
import FormikControl from '../../generic/FormikControl';
import { useLibraryContext } from '../common/context/LibraryContext';
import messages from './messages';
import { useAddItemsToCollection, useCreateLibraryContainer } from '../data/apiHooks';
import { ToastContext } from '../../generic/toast-context';
import LoadingButton from '../../generic/loading-button';
import { ContainerType } from '../../generic/key-utils';

const CreateUnitModal = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const {
    collectionId,
    libraryId,
    isCreateUnitModalOpen,
    closeCreateUnitModal,
  } = useLibraryContext();
  const create = useCreateLibraryContainer(libraryId);
  const updateItemsMutation = useAddItemsToCollection(libraryId, collectionId);
  const { showToast } = React.useContext(ToastContext);

  const handleCreate = React.useCallback(async (values) => {
    try {
      const container = await create.mutateAsync({
        containerType: ContainerType.Unit,
        ...values,
      });
      if (collectionId) {
        await updateItemsMutation.mutateAsync([container.id]);
      }
      // Navigate to the new unit
      navigate(`/library/${libraryId}/unit/${container.id}`);
      showToast(intl.formatMessage(messages.createUnitSuccess));
    } catch (error) {
      showToast(intl.formatMessage(messages.createUnitError));
    } finally {
      closeCreateUnitModal();
    }
  }, []);

  return (
    <ModalDialog
      title={intl.formatMessage(messages.createUnitModalTitle)}
      isOpen={isCreateUnitModalOpen}
      onClose={closeCreateUnitModal}
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.createUnitModalTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <Formik
        initialValues={{
          displayName: '',
        }}
        validationSchema={
          Yup.object().shape({
            displayName: Yup.string()
              .required(intl.formatMessage(messages.createUnitModalNameInvalid)),
          })
        }
        onSubmit={handleCreate}
      >
        {(formikProps) => (
          <Form onSubmit={formikProps.handleSubmit}>
            <ModalDialog.Body className="mw-sm">
              <FormikControl
                name="displayName"
                label={(
                  <Form.Label className="font-weight-bold h3">
                    {intl.formatMessage(messages.createUnitModalNameLabel)}
                  </Form.Label>
                )}
                value={formikProps.values.displayName}
                placeholder={intl.formatMessage(messages.createUnitModalNamePlaceholder)}
                controlClasses="pb-2"
              />
            </ModalDialog.Body>
            <ModalDialog.Footer>
              <ActionRow>
                <ModalDialog.CloseButton variant="tertiary">
                  {intl.formatMessage(messages.createUnitModalCancel)}
                </ModalDialog.CloseButton>
                <LoadingButton
                  variant="primary"
                  onClick={formikProps.submitForm}
                  disabled={!formikProps.isValid || !formikProps.dirty}
                  isLoading={formikProps.isSubmitting}
                  label={intl.formatMessage(messages.createUnitModalCreate)}
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

export default CreateUnitModal;
