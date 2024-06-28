import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
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
  Info, CheckCircleOutline, SpinnerSimple,
} from '@openedx/paragon/icons';

import { Formik } from 'formik';
import PropTypes from 'prop-types';
import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import { RequestStatus } from 'CourseAuthoring/data/constants';
import ConnectionErrorAlert from 'CourseAuthoring/generic/ConnectionErrorAlert';
import FormSwitchGroup from 'CourseAuthoring/generic/FormSwitchGroup';
import Loading from 'CourseAuthoring/generic/Loading';
import { useModel } from 'CourseAuthoring/generic/model-store';
import PermissionDeniedAlert from 'CourseAuthoring/generic/PermissionDeniedAlert';
import { useIsMobile } from 'CourseAuthoring/utils';
import { getLoadingStatus, getSavingStatus, getResetStatus } from 'CourseAuthoring/pages-and-resources/data/selectors';
import { updateSavingStatus, updateResetStatus } from 'CourseAuthoring/pages-and-resources/data/slice';
import AppConfigFormDivider from 'CourseAuthoring/pages-and-resources/discussions/app-config-form/apps/shared/AppConfigFormDivider';
import { PagesAndResourcesContext } from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';

import { updateXpertSettings, resetXpertSettings, removeXpertSettings } from '../data/thunks';
import messages from './messages';
import appInfo from '../appInfo';
import ResetIcon from './ResetIcon';

import './SettingsModal.scss';

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

const SettingsModalBase = ({
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

SettingsModalBase.propTypes = {
  intl: intlShape.isRequired,
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
  intl,
  courseId,
  checked,
  visible,
}) => {
  const resetStatusRequestStatus = useSelector(getResetStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    if (resetStatusRequestStatus === RequestStatus.SUCCESSFUL) {
      setTimeout(() => {
        dispatch(updateResetStatus({ status: '' }));
      }, 2000);
    }
  }, [resetStatusRequestStatus]);

  const handleResetUnits = () => {
    dispatch(resetXpertSettings(courseId, { enabled: checked === 'true', reset: true }));
  };

  const getResetButtonState = () => {
    switch (resetStatusRequestStatus) {
      case RequestStatus.PENDING:
        return 'pending';
      case RequestStatus.SUCCESSFUL:
        return 'finish';
      default:
        return 'default';
    }
  };

  if (!visible) { return null; }

  const messageKey = checked === 'true' ? 'resetAllUnitsTooltipChecked' : 'resetAllUnitsTooltipUnchecked';

  return (
    <OverlayTrigger
      placement="right"
      overlay={(
        <Tooltip
          id={`tooltip-reset-${checked}`}
          className="reset-tooltip"
        >
          {intl.formatMessage(messages[messageKey])}
        </Tooltip>
      )}
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
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  checked: PropTypes.oneOf(['true', 'false']).isRequired,
  visible: PropTypes.bool,
};

ResetUnitsButton.defaultProps = {
  visible: false,
};

const SettingsModal = ({
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
  helpPrivacyText,
  enableReinitialize,
  allUnitsEnabledText,
  noUnitsEnabledText,
}) => {
  const { courseId } = useContext(PagesAndResourcesContext);
  const loadingStatus = useSelector(getLoadingStatus);
  const updateSettingsRequestStatus = useSelector(getSavingStatus);
  const alertRef = useRef(null);
  const [saveError, setSaveError] = useState(false);
  const dispatch = useDispatch();
  const submitButtonState = updateSettingsRequestStatus === RequestStatus.IN_PROGRESS ? 'pending' : 'default';
  const isMobile = useIsMobile();
  const modalVariant = isMobile ? 'dark' : 'default';

  const xpertSettings = useModel('XpertSettings', appId);

  useEffect(() => {
    if (updateSettingsRequestStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateSavingStatus({ status: '' }));
      onClose();
    }
  }, [updateSettingsRequestStatus]);

  const handleFormSubmit = async ({ enabled, checked, ...rest }) => {
    let success;
    const values = { ...rest, enabled: enabled ? checked === 'true' : undefined };

    if (enabled) {
      success = await dispatch(updateXpertSettings(courseId, values));
    } else {
      success = await dispatch(removeXpertSettings(courseId));
    }

    if (onSettingsSave) {
      success = success && await onSettingsSave(values);
    }
    setSaveError(!success);
    !success && alertRef?.current.scrollIntoView(); // eslint-disable-line @typescript-eslint/no-unused-expressions
  };

  const handleFormikSubmit = ({ handleSubmit, errors }) => async (event) => {
    // If submitting the form with errors, show the alert and scroll to it.
    await handleSubmit(event);
    if (Object.keys(errors).length > 0) {
      setSaveError(true);
      alertRef?.current.scrollIntoView?.(); // eslint-disable-line no-unused-expressions
    }
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
        destination="https://openai.com/api-data-privacy"
        target="_blank"
        rel="noreferrer noopener"
      >
        {helpPrivacyText}
      </Hyperlink>
    </div>
  );

  if (loadingStatus === RequestStatus.SUCCESSFUL) {
    return (
      <Formik
        initialValues={{
          enabled: xpertSettings?.enabled !== undefined,
          checked: xpertSettings?.enabled?.toString() || 'true',
          ...initialValues,
        }}
        validationSchema={
          Yup.object()
            .shape({
              enabled: Yup.boolean(),
              checked: Yup.string().oneOf(['true', 'false']),
              ...validationSchema,
            })
        }
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
              footer={(
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
              <FormSwitchGroup
                id={`enable-${appId}-toggle`}
                name="enabled"
                onChange={formikProps.handleChange}
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
                    {helpPrivacyLink}
                    {learnMoreLink}
                  </div>
                )}
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
                      intl={intl}
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
                      intl={intl}
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
      {loadingStatus === RequestStatus.IN_PROGRESS && <Loading />}
      {loadingStatus === RequestStatus.FAILED && <ConnectionErrorAlert />}
      {loadingStatus === RequestStatus.DENIED && <PermissionDeniedAlert />}
    </SettingsModalBase>
  );
};

SettingsModal.propTypes = {
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

export default injectIntl(SettingsModal);
