import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Alert,
  Badge,
  Form,
  Hyperlink,
  ModalDialog,
  StatefulButton,
  TransitionReplace,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

import { Formik } from 'formik';
import PropTypes from 'prop-types';
import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import { RequestStatus } from '../../data/constants';
import ConnectionErrorAlert from '../../generic/ConnectionErrorAlert';
import FormSwitchGroup from '../../generic/FormSwitchGroup';
import Loading from '../../generic/Loading';
import { useModel } from '../../generic/model-store';
import PermissionDeniedAlert from '../../generic/PermissionDeniedAlert';
import { useIsMobile } from '../../utils';
import { getLoadingStatus, getSavingStatus } from '../data/selectors';
import { updateSavingStatus } from '../data/slice';
import { updateAppStatus } from '../data/thunks';
import AppConfigFormDivider from '../discussions/app-config-form/apps/shared/AppConfigFormDivider';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';
import messages from './messages';

const AppSettingsForm = ({
  formikProps, children, showForm,
}) => children && (
  <TransitionReplace>
    {showForm ? (
      <React.Fragment key="app-enabled">
        {children(formikProps)}
      </React.Fragment>
    ) : (
      <React.Fragment key="app-disabled" />
    )}
  </TransitionReplace>
);

AppSettingsForm.propTypes = {
  // Ignore the warning here since we're just passing along the props as-is and the child component should validate
  // eslint-disable-next-line react/forbid-prop-types
  formikProps: PropTypes.object.isRequired,
  showForm: PropTypes.bool.isRequired,
  children: PropTypes.func,
};

AppSettingsForm.defaultProps = {
  children: null,
};

const AppSettingsModalBase = ({
  intl, title, onClose, variant, isMobile, children, footer,
}) => (
  <ModalDialog
    title={title}
    isOpen
    onClose={onClose}
    size="lg"
    variant={variant}
    hasCloseButton={isMobile}
    isFullscreenOnMobile
  >
    <ModalDialog.Header>
      <ModalDialog.Title data-testid="modal-title">
        {title}
      </ModalDialog.Title>
    </ModalDialog.Header>
    <ModalDialog.Body>
      {children}
    </ModalDialog.Body>
    <ModalDialog.Footer className="p-4">
      <ActionRow>
        <ModalDialog.CloseButton variant="tertiary">
          {intl.formatMessage(messages.cancel)}
        </ModalDialog.CloseButton>
        {footer}
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

AppSettingsModalBase.propTypes = {
  intl: intlShape.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'dark']).isRequired,
  isMobile: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

AppSettingsModalBase.defaultProps = {
  footer: null,
};

const AppSettingsModal = ({
  intl,
  appId,
  title,
  children,
  configureBeforeEnable,
  initialValues,
  validationSchema,
  onClose,
  onSettingsSave,
  enableAppLabel,
  enableAppHelp,
  learnMoreText,
  enableReinitialize,
  hideAppToggle,
}) => {
  const { courseId } = useContext(PagesAndResourcesContext);
  const loadingStatus = useSelector(getLoadingStatus);
  const updateSettingsRequestStatus = useSelector(getSavingStatus);
  const alertRef = useRef(null);
  const [saveError, setSaveError] = useState(false);
  const appInfo = useModel('courseApps', appId);
  const dispatch = useDispatch();
  const submitButtonState = updateSettingsRequestStatus === RequestStatus.IN_PROGRESS ? 'pending' : 'default';
  const isMobile = useIsMobile();
  const modalVariant = isMobile ? 'dark' : 'default';

  useEffect(() => {
    if (updateSettingsRequestStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateSavingStatus({ status: '' }));
      onClose();
    }
  }, [updateSettingsRequestStatus]);

  const handleFormSubmit = async (values) => {
    let success = true;
    if (appInfo.enabled !== values.enabled) {
      success = await dispatch(updateAppStatus(courseId, appInfo.id, values.enabled));
    }
    // Call the submit handler for the settings component to save its settings
    if (onSettingsSave) {
      success = success && await onSettingsSave(values);
    }
    await setSaveError(!success);
    !success && alertRef?.current.scrollIntoView(); // eslint-disable-line no-unused-expressions
  };

  const handleFormikSubmit = ({ handleSubmit, errors }) => async (event) => {
    // If submitting the form with errors, show the alert and scroll to it.
    await handleSubmit(event);
    if (Object.keys(errors).length > 0) {
      await setSaveError(true);
      alertRef?.current.scrollIntoView?.(); // eslint-disable-line no-unused-expressions
    }
  };

  const learnMoreLink = appInfo.documentationLinks?.learnMoreConfiguration && (
    <Hyperlink
      className="text-primary-500"
      destination={appInfo.documentationLinks.learnMoreConfiguration}
      target="_blank"
      rel="noreferrer noopener"
    >
      {learnMoreText}
    </Hyperlink>
  );

  if (loadingStatus === RequestStatus.SUCCESSFUL) {
    return (
      <Formik
        initialValues={{
          enabled: !!appInfo?.enabled,
          ...initialValues,
        }}
        validationSchema={
          Yup.object()
            .shape({
              enabled: Yup.boolean(),
              ...validationSchema,
            })
        }
        onSubmit={handleFormSubmit}
        enableReinitialize={enableReinitialize}
      >
        {(formikProps) => (
          <Form onSubmit={handleFormikSubmit(formikProps)}>
            <AppSettingsModalBase
              title={title}
              isOpen
              onClose={onClose}
              variant={modalVariant}
              isMobile={isMobile}
              isFullscreenOnMobile
              intl={intl}
              footer={(
                <StatefulButton
                  labels={{
                    default: intl.formatMessage(messages.save),
                    pending: intl.formatMessage(messages.saving),
                    complete: intl.formatMessage(messages.saved),
                  }}
                  state={submitButtonState}
                  onClick={handleFormikSubmit(formikProps)}
                />
              )}
            >
              {saveError && (
                <Alert variant="danger" icon={Info} ref={alertRef}>
                  <Alert.Heading>
                    {formikProps.errors.enabled?.title || intl.formatMessage(messages.errorSavingTitle)}
                  </Alert.Heading>
                  {formikProps.errors.enabled?.message || intl.formatMessage(messages.errorSavingMessage)}
                </Alert>
              )}
              {!hideAppToggle && (
                <FormSwitchGroup
                  id={`enable-${appId}-toggle`}
                  name="enabled"
                  onChange={(event) => formikProps.handleChange(event)}
                  onBlur={formikProps.handleBlur}
                  checked={formikProps.values.enabled}
                  label={(
                    <div className="d-flex align-items-center">
                      {enableAppLabel}
                      {formikProps.values.enabled && (
                        <Badge className="ml-2" variant="success" data-testid="enable-badge">
                          {intl.formatMessage(messages.enabled)}
                        </Badge>
                      )}
                    </div>
                  )}
                  helpText={(
                    <div>
                      <p>{enableAppHelp}</p>
                      <span className="py-3">{learnMoreLink}</span>
                    </div>
                  )}
                />
              )}
              {(formikProps.values.enabled || configureBeforeEnable) && children
                && <AppConfigFormDivider marginAdj={{ default: 0, sm: 0 }} />}
              <AppSettingsForm formikProps={formikProps} showForm={formikProps.values.enabled || configureBeforeEnable}>
                {children}
              </AppSettingsForm>
            </AppSettingsModalBase>
          </Form>
        )}
      </Formik>
    );
  }
  return (
    <AppSettingsModalBase
      intl={intl}
      title={title}
      isOpen
      onClose={onClose}
      size="sm"
      variant={modalVariant}
      isMobile={isMobile}
      isFullscreenOnMobile
    >
      {loadingStatus === RequestStatus.IN_PROGRESS && <Loading />}
      {loadingStatus === RequestStatus.FAILED && <ConnectionErrorAlert />}
      {loadingStatus === RequestStatus.DENIED && <PermissionDeniedAlert />}
    </AppSettingsModalBase>
  );
};

AppSettingsModal.propTypes = {
  intl: intlShape.isRequired,
  title: PropTypes.string.isRequired,
  appId: PropTypes.string.isRequired,
  children: PropTypes.func,
  onSettingsSave: PropTypes.func,
  initialValues: PropTypes.shape({}),
  validationSchema: PropTypes.shape({}),
  onClose: PropTypes.func.isRequired,
  enableAppLabel: PropTypes.string.isRequired,
  enableAppHelp: PropTypes.string.isRequired,
  learnMoreText: PropTypes.string.isRequired,
  configureBeforeEnable: PropTypes.bool,
  enableReinitialize: PropTypes.bool,
  hideAppToggle: PropTypes.bool,
};

AppSettingsModal.defaultProps = {
  children: null,
  onSettingsSave: null,
  initialValues: {},
  validationSchema: {},
  configureBeforeEnable: false,
  enableReinitialize: false,
  hideAppToggle: false,
};

export default injectIntl(AppSettingsModal);
