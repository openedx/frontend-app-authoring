import { useIntl } from '@edx/frontend-platform/i18n';
import { getExternalLinkUrl } from '@edx/frontend-platform';
import {
  ActionRow,
  Alert,
  Badge,
  Form,
  Icon,
  ModalDialog,
  OverlayTrigger,
  StatefulButton,
  Tooltip,
  TransitionReplace,
  Hyperlink,
} from '@openedx/paragon';
import {
  Info,
  CheckCircleOutline,
  SpinnerSimple,
} from '@openedx/paragon/icons';

import { Formik } from 'formik';
import PropTypes from 'prop-types';
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Yup from 'yup';

import ConnectionErrorAlert from 'CourseAuthoring/generic/ConnectionErrorAlert';
import FormSwitchGroup from 'CourseAuthoring/generic/FormSwitchGroup';
import Loading from 'CourseAuthoring/generic/Loading';
import PermissionDeniedAlert from 'CourseAuthoring/generic/PermissionDeniedAlert';
import { useIsMobile } from 'CourseAuthoring/utils';
import AppConfigFormDivider from 'CourseAuthoring/pages-and-resources/discussions/app-config-form/apps/shared/AppConfigFormDivider';
import { PagesAndResourcesContext } from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';

import messages from './messages';
import appInfo from '../appInfo';
import ResetIcon from './ResetIcon';

import './SettingsModal.scss';
import { useDeleteXpertSettings, useUpdateXpertSettings, useXpertSettings } from '../data/apiHooks';

const AppSettingsForm = ({
  formikProps,
  children,
  showForm,
}) =>
  children && (
    <TransitionReplace>
      {showForm ?
        (
          <React.Fragment key="app-enabled">
            {children(formikProps)}
          </React.Fragment>
        ) :
        <React.Fragment key="app-disabled" />}
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

const SettingsModalBase = ({
  title,
  onClose,
  variant,
  isMobile,
  children,
  footer,
}) => {
  const intl = useIntl();
  return (
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
};

SettingsModalBase.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'dark']).isRequired,
  isMobile: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

SettingsModalBase.defaultProps = {
  footer: null,
};

const ResetUnitsButton = ({
  courseId,
  checked,
  visible,
}) => {
  const intl = useIntl();
  const updateSettingsMutation = useUpdateXpertSettings(courseId);

  useEffect(() => {
    if (updateSettingsMutation.isSuccess) {
      setTimeout(() => {
        updateSettingsMutation.reset();
      }, 2000);
    }
  }, [updateSettingsMutation]);

  const handleResetUnits = () => {
    updateSettingsMutation.mutate({ enabled: checked === 'true', reset: true });    
  };

  const getResetButtonState = () => {
    if (updateSettingsMutation.isPending) {
      return 'pending';
    } else if (updateSettingsMutation.isSuccess) {
      return 'finish';
    }
    return 'default';
  };

  if (!visible) { return null; }

  const messageKey = checked === 'true' ? 'resetAllUnitsTooltipChecked' : 'resetAllUnitsTooltipUnchecked';

  return (
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip
          id={`tooltip-reset-${checked}`}
          className="reset-tooltip"
        >
          {intl.formatMessage(messages[messageKey])}
        </Tooltip>
      }
    >
      <StatefulButton
        className="reset-units-button"
        labels={{
          default: intl.formatMessage(messages.resetAllUnits),
          pending: '',
          finish: intl.formatMessage(messages.reset),
        }}
        icons={{
          default: <Icon src={ResetIcon} />,
          pending: <Icon src={SpinnerSimple} className="icon-spin" />,
          finish: <Icon src={CheckCircleOutline} />,
        }}
        state={getResetButtonState()}
        onClick={handleResetUnits}
        disabledStates={['pending', 'finish']}
        variant="outline"
        data-testid="reset-units"
      />
    </OverlayTrigger>
  );
};

ResetUnitsButton.propTypes = {
  courseId: PropTypes.string.isRequired,
  checked: PropTypes.oneOf(['true', 'false']).isRequired,
  visible: PropTypes.bool,
};

ResetUnitsButton.defaultProps = {
  visible: false,
};

const SettingsModal = ({
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
  helpPrivacyText,
  enableReinitialize,
  allUnitsEnabledText,
  noUnitsEnabledText,
}) => {
  const intl = useIntl();
  const { courseId } = useContext(PagesAndResourcesContext);
  const alertRef = useRef(null);
  const [formIsError, setFormIsError] = useState(false);
  const isMobile = useIsMobile();
  const modalVariant = isMobile ? 'dark' : 'default';

  const {
    data: xpertSettings,
    isPending: xpertSettingsIsPending,
    isError: xpertSettingsIsFailed,
    isSuccess: xpertSettingsIsSuccess,
    failureReason: xpertSettingsError,
  } = useXpertSettings(courseId);

  const updateSettingsMutation = useUpdateXpertSettings(courseId);
  const deleteSettingsMutation = useDeleteXpertSettings(courseId);

  const saveInProgress = updateSettingsMutation.isPending || deleteSettingsMutation.isPending;
  const saveIsSuccess = updateSettingsMutation.isSuccess || deleteSettingsMutation.isSuccess;
  const saveIsError = updateSettingsMutation.isError || deleteSettingsMutation.isError || formIsError;

  const submitButtonState = saveInProgress ? 'pending' : 'default';

  useEffect(() => {
    if (saveIsSuccess) {
      updateSettingsMutation.reset();
      deleteSettingsMutation.reset();
      onClose();
    } else if (saveIsError) {
      alertRef?.current.scrollIntoView();
    }
  }, [
    saveIsSuccess,
    saveIsError,
    updateSettingsMutation,
    deleteSettingsMutation
  ]);

  const handleFormSubmit = async ({ enabled, checked, ...rest }) => {
    const values = { ...rest, enabled: enabled ? checked === 'true' : undefined };
    let success = false;
    if (enabled) {
      await updateSettingsMutation.mutateAsync(values);
      success = updateSettingsMutation.isSuccess;
    } else {
      await deleteSettingsMutation.mutateAsync();
      success = updateSettingsMutation.isSuccess;
    }
    if (success && onSettingsSave) {
      await onSettingsSave(values);
    }
  };

  const handleFormikSubmit = ({ handleSubmit, errors }) => async (event) => {
    // If submitting the form with errors, show the alert and scroll to it.
    await handleSubmit(event);
    setFormIsError(Object.keys(errors).length > 0);
  };

  const learnMoreLink = appInfo.documentationLinks?.learnMoreConfiguration && (
    <div className="py-1">
      <Hyperlink
        className="text-primary-500"
        destination={appInfo.documentationLinks.learnMoreConfiguration}
        target="_blank"
        rel="noreferrer noopener"
      >
        {learnMoreText}
      </Hyperlink>
    </div>
  );

  const helpPrivacyLink = (
    <div className="py-1">
      <Hyperlink
        className="text-primary-500"
        destination={getExternalLinkUrl('https://openai.com/api-data-privacy')}
        target="_blank"
        rel="noreferrer noopener"
      >
        {helpPrivacyText}
      </Hyperlink>
    </div>
  );

  if (xpertSettingsIsSuccess) {
    return (
      <Formik
        initialValues={{
          enabled: xpertSettings?.enabled !== undefined,
          checked: xpertSettings?.enabled?.toString() || 'true',
          ...initialValues,
        }}
        validationSchema={Yup.object()
          .shape({
            enabled: Yup.boolean(),
            checked: Yup.string().oneOf(['true', 'false']),
            ...validationSchema,
          })}
        onSubmit={handleFormSubmit}
        enableReinitialize={enableReinitialize}
      >
        {(formikProps) => (
          <Form onSubmit={handleFormikSubmit(formikProps)}>
            <SettingsModalBase
              title={title}
              isOpen
              onClose={onClose}
              variant={modalVariant}
              isMobile={isMobile}
              isFullscreenOnMobile
              intl={intl}
              footer={
                <StatefulButton
                  labels={{
                    default: intl.formatMessage(messages.save),
                    pending: intl.formatMessage(messages.saving),
                    complete: intl.formatMessage(messages.saved),
                  }}
                  state={submitButtonState}
                  onClick={handleFormikSubmit(formikProps)}
                  disabled={!formikProps.dirty}
                />
              }
            >
              {saveIsError && (
                <Alert variant="danger" icon={Info} ref={alertRef}>
                  <Alert.Heading>
                    {formikProps.errors.enabled?.title || intl.formatMessage(messages.errorSavingTitle)}
                  </Alert.Heading>
                  {formikProps.errors.enabled?.message || intl.formatMessage(messages.errorSavingMessage)}
                </Alert>
              )}
              <FormSwitchGroup
                id={`enable-${appId}-toggle`}
                name="enabled"
                onChange={formikProps.handleChange}
                onBlur={formikProps.handleBlur}
                checked={formikProps.values.enabled}
                label={
                  <div className="d-flex align-items-center">
                    {enableAppLabel}
                    {formikProps.values.enabled && (
                      <Badge className="ml-2" variant="success" data-testid="enable-badge">
                        {intl.formatMessage(messages.enabled)}
                      </Badge>
                    )}
                  </div>
                }
                helpText={
                  <div>
                    <p>{enableAppHelp}</p>
                    {helpPrivacyLink}
                    {learnMoreLink}
                  </div>
                }
              />
              {(formikProps.values.enabled || configureBeforeEnable) && (
                <Form.RadioSet
                  name="checked"
                  onChange={formikProps.handleChange}
                  onBlur={formikProps.handleBlur}
                  value={formikProps.values.checked}
                >
                  <Form.Radio
                    className="summary-radio m-2 px-3"
                    data-testid="enable-radio"
                    value="true"
                  >
                    {allUnitsEnabledText}
                    <ResetUnitsButton
                      courseId={courseId}
                      checked={formikProps.values.checked}
                      visible={formikProps.values.checked === 'true'}
                    />
                  </Form.Radio>
                  <Form.Radio
                    className="summary-radio m-2 px-3"
                    data-testid="disable-radio"
                    value="false"
                  >
                    {noUnitsEnabledText}
                    <ResetUnitsButton
                      courseId={courseId}
                      checked={formikProps.values.checked}
                      visible={formikProps.values.checked === 'false'}
                    />
                  </Form.Radio>
                </Form.RadioSet>
              )}
              {(formikProps.values.enabled || configureBeforeEnable) && children
                && <AppConfigFormDivider marginAdj={{ default: 0, sm: 0 }} />}
              <AppSettingsForm formikProps={formikProps} showForm={formikProps.values.enabled || configureBeforeEnable}>
                {children}
              </AppSettingsForm>
            </SettingsModalBase>
          </Form>
        )}
      </Formik>
    );
  }
  return (
    <SettingsModalBase
      intl={intl}
      title={title}
      isOpen
      onClose={onClose}
      size="sm"
      variant={modalVariant}
      isMobile={isMobile}
      isFullscreenOnMobile
    >
      {xpertSettingsIsPending && <Loading />}
      {xpertSettingsIsFailed && <ConnectionErrorAlert />}
      {xpertSettingsError?.response?.status === 403 && <PermissionDeniedAlert />}
    </SettingsModalBase>
  );
};

SettingsModal.propTypes = {
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
  helpPrivacyText: PropTypes.string.isRequired,
  allUnitsEnabledText: PropTypes.string.isRequired,
  noUnitsEnabledText: PropTypes.string.isRequired,
  configureBeforeEnable: PropTypes.bool,
  enableReinitialize: PropTypes.bool,
};

SettingsModal.defaultProps = {
  children: null,
  onSettingsSave: null,
  initialValues: {},
  validationSchema: {},
  configureBeforeEnable: false,
  enableReinitialize: false,
};

export default SettingsModal;
