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
import { useAddItemsToContainer, useAddItemsToCollection, useCreateLibraryContainer } from '../data/apiHooks';
import { ToastContext } from '../../generic/toast-context';
import LoadingButton from '../../generic/loading-button';
import { ContainerType } from '../../generic/key-utils';
import { useLibraryRoutes } from '../routes';

/** Common modal to create section, subsection or unit in library */
const CreateContainerModal = () => {
  const intl = useIntl();
  const {
    collectionId,
    libraryId,
    containerId,
    createContainerModalType,
    setCreateContainerModalType,
  } = useLibraryContext();
  const {
    navigateTo,
    insideCollection,
    insideSection,
    insideSubsection,
  } = useLibraryRoutes();
  const create = useCreateLibraryContainer(libraryId);
  const updateCollectionItemsMutation = useAddItemsToCollection(libraryId, collectionId);
  const updateContainerItemsMutation = useAddItemsToContainer(containerId);
  const { showToast } = React.useContext(ToastContext);

  /** labels based on the type of modal open, i.e., section, subsection or unit */
  const labels = React.useMemo(() => {
    if (createContainerModalType === ContainerType.Section) {
      return {
        modalTitle: intl.formatMessage(messages.createSectionModalTitle),
        validationError: intl.formatMessage(messages.createSectionModalNameInvalid),
        nameLabel: intl.formatMessage(messages.createSectionModalNameLabel),
        placeholder: intl.formatMessage(messages.createSectionModalNamePlaceholder),
        successMsg: intl.formatMessage(messages.createSectionSuccess),
        errorMsg: intl.formatMessage(messages.createSectionError),
      };
    }
    if (createContainerModalType === ContainerType.Subsection) {
      return {
        modalTitle: intl.formatMessage(messages.createSubsectionModalTitle),
        validationError: intl.formatMessage(messages.createSubsectionModalNameInvalid),
        nameLabel: intl.formatMessage(messages.createSubsectionModalNameLabel),
        placeholder: intl.formatMessage(messages.createSubsectionModalNamePlaceholder),
        successMsg: intl.formatMessage(messages.createSubsectionSuccess),
        errorMsg: intl.formatMessage(messages.createSubsectionError),
      };
    }
    return {
      modalTitle: intl.formatMessage(messages.createUnitModalTitle),
      validationError: intl.formatMessage(messages.createUnitModalNameInvalid),
      nameLabel: intl.formatMessage(messages.createUnitModalNameLabel),
      placeholder: intl.formatMessage(messages.createUnitModalNamePlaceholder),
      successMsg: intl.formatMessage(messages.createUnitSuccess),
      errorMsg: intl.formatMessage(messages.createUnitError),
    };
  }, [createContainerModalType]);

  /** Call close for section, subsection and unit as the operation is idempotent */
  const handleClose = () => setCreateContainerModalType(undefined);

  const handleCreate = React.useCallback(async (values) => {
    try {
      const canStandAlone = !(insideCollection || insideSection || insideSubsection);
      const container = await create.mutateAsync({
        canStandAlone,
        containerType: createContainerModalType,
        ...values,
      });

      // Navigate to the new container
      navigateTo({ containerId: container.id });

      // Link container to parent after navigating -- we may still show an
      // error if this linking fails, but at least the user can see that
      // the container was created.
      if (collectionId && insideCollection) {
        await updateCollectionItemsMutation.mutateAsync([container.id]);
      } else if (containerId && (insideSection || insideSubsection)) {
        await updateContainerItemsMutation.mutateAsync([container.id]);
      }

      showToast(labels.successMsg);
    } catch (error) {
      showToast(labels.errorMsg);
    } finally {
      handleClose();
    }
  }, [
    createContainerModalType,
    handleClose,
    labels,
    navigateTo,
    updateCollectionItemsMutation,
    updateContainerItemsMutation,
  ]);

  return (
    <ModalDialog
      title={labels.modalTitle}
      isOpen={!!createContainerModalType}
      onClose={handleClose}
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {labels.modalTitle}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <Formik
        initialValues={{
          displayName: '',
        }}
        validationSchema={
          Yup.object().shape({
            displayName: Yup.string()
              .required(labels.validationError),
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
                    {labels.nameLabel}
                  </Form.Label>
                )}
                value={formikProps.values.displayName}
                placeholder={labels.placeholder}
                controlClasses="pb-2"
              />
            </ModalDialog.Body>
            <ModalDialog.Footer>
              <ActionRow>
                <ModalDialog.CloseButton variant="tertiary">
                  {intl.formatMessage(messages.createModalCancel)}
                </ModalDialog.CloseButton>
                <LoadingButton
                  variant="primary"
                  onClick={formikProps.submitForm}
                  disabled={!formikProps.isValid || !formikProps.dirty}
                  isLoading={formikProps.isSubmitting}
                  label={intl.formatMessage(messages.createContainerModalCreate)}
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

export default CreateContainerModal;
