import React from 'react';
import {
  ActionRow,
  Form,
  ModalDialog,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormikControl from '../../generic/FormikControl';
import { useLibraryContext } from '../common/context/LibraryContext';
import messages from './messages';
import { useCreateLibraryContainer } from '../data/apiHooks';
import { ToastContext } from '../../generic/toast-context';
import LoadingButton from '../../generic/loading-button';

const CreateUnitModal = () => {
  const intl = useIntl();
  const {
    libraryId,
    isCreateUnitModalOpen,
    closeCreateUnitModal,
  } = useLibraryContext();
  const create = useCreateLibraryContainer(libraryId);
  const { showToast } = React.useContext(ToastContext);

  const handleCreate = React.useCallback(async (values) => {
    try {
      await create.mutateAsync({
        containerType: 'unit',
        ...values,
      });
      // TODO: Navigate to the new unit
      // navigate(`/library/${libraryId}/units/${data.key}`);
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
          <>
            <ModalDialog.Body className="mw-sm">
              <Form onSubmit={formikProps.handleSubmit}>
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
              </Form>
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
                  label={intl.formatMessage(messages.createUnitModalCreate)}
                />
              </ActionRow>
            </ModalDialog.Footer>
          </>
        )}
      </Formik>
    </ModalDialog>
  );
};

export default CreateUnitModal;
