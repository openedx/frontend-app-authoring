import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Badge,
  Form,
  Hyperlink,
  StatefulButton,
  TransitionReplace,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

import { Formik } from 'formik';
import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Yup from 'yup';

import ConnectionErrorAlert from '@src/generic/ConnectionErrorAlert';
import FormSwitchGroup from '@src/generic/FormSwitchGroup';
import Loading from '@src/generic/Loading';
import PermissionDeniedAlert from '@src/generic/PermissionDeniedAlert';
import { RequestStatus } from '@src/data/constants';
import { useIsMobile } from '@src/utils';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useUpdateCourseAppStatus } from '@src/data/apiHooks';

import AppConfigFormDivider from '../discussions/app-config-form/apps/shared/AppConfigFormDivider';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';
import AppSettingsModalBase from './AppSettingsModalBase';
import messages from './messages';

export interface AppSettingsModalProps {
  title: string;
  appId: string;
  children?: Function;
  bodyChildren?: ReactNode;
  onSettingsSave?: Function;
  initialValues: Record<string, any>;
  validationSchema: Record<string, any>;
  onClose: () => void;
  enableAppLabel: string;
  enableAppHelp: string;
  learnMoreText?: string;
  configureBeforeEnable?: boolean;
  enableReinitialize?: boolean;
  hideAppToggle?: boolean;
}

const AppSettingsModal = ({
  appId,
  title,
  children,
  bodyChildren,
  configureBeforeEnable = false,
  initialValues = {},
  validationSchema = {},
  onClose,
  onSettingsSave,
  enableAppLabel,
  enableAppHelp,
  learnMoreText,
  enableReinitialize = false,
  hideAppToggle = false,
}: AppSettingsModalProps) => {
  const { formatMessage } = useIntl();
  const { isEditable } = useContext(PagesAndResourcesContext);
  const {
    courseId,
    courseApps,
    courseAppsStatus,
  } = useCourseAuthoringContext();
  const appInfo = courseApps.find((app) => app.id === appId);
  const updateCourseAppStatusMutation = useUpdateCourseAppStatus(courseId);

  const alertRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState(false);
  const [isSavingCallbackSuccess, setIsSavingCallbackSuccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inError = updateCourseAppStatusMutation.isError || !isSavingCallbackSuccess || formError;

  const submitButtonState = (isSubmitting || updateCourseAppStatusMutation.isPending) ? 'pending' : 'default';
  const isMobile = useIsMobile();
  const modalVariant = isMobile ? 'dark' : 'default';

  const handleFormSubmit = async (values) => {
    if (!appInfo) {
      return;
    }
    setIsSubmitting(true);
    try {
      if (appInfo.enabled !== values.enabled) {
        await updateCourseAppStatusMutation.mutateAsync({
          appId: appInfo.id,
          state: values.enabled,
        });
      }
      // Call the submit handler for the settings component to save its settings
      const success = onSettingsSave ? await onSettingsSave(values) : true;
      setIsSavingCallbackSuccess(success);
      if (success) {
        onClose();
      }
    } catch {
      setIsSavingCallbackSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (inError) {
      alertRef?.current?.scrollIntoView()
    }
  }, [inError])


  const handleFormikSubmit = ({ handleSubmit, errors }) => async (event) => {
    // Clear any error left over from a previous failed attempt so a successful
    // resubmit isn't blocked by stale state.
    setFormError(false);
    // If submitting the form with errors, show the alert and scroll to it.
    await handleSubmit(event);
    if (Object.keys(errors).length > 0) {
      /* istanbul ignore next: temp to unblock lint cleanup. We probably should test this. */
      setFormError(true);
    }
  };

  const learnMoreLink = appInfo?.documentationLinks?.learnMoreConfiguration && (
    <Hyperlink
      className="text-primary-500"
      destination={appInfo.documentationLinks.learnMoreConfiguration}
      target="_blank"
      rel="noreferrer noopener"
    >
      {learnMoreText}
    </Hyperlink>
  );

  if (courseAppsStatus === RequestStatus.SUCCESSFUL) {
    return (
      <Formik
        initialValues={{
          enabled: !!appInfo?.enabled,
          ...initialValues,
        }}
        validationSchema={Yup.object()
          .shape({
            enabled: Yup.boolean(),
            ...validationSchema,
          })}
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
              footer={
                <StatefulButton
                  labels={{
                    default: formatMessage(messages.save),
                    pending: formatMessage(messages.saving),
                    complete: formatMessage(messages.saved),
                  }}
                  state={submitButtonState}
                  onClick={handleFormikSubmit(formikProps)}
                  disabled={!isEditable}
                />
              }
            >
              {inError && (
                <Alert variant="danger" icon={Info} ref={alertRef}>
                  <Alert.Heading>
                    {/* @ts-expect-error -- errors.enabled is typed as string|FormikErrors<any> by Formik, but the API returns { title, message } here */}
                    {formikProps.errors.enabled?.title || formatMessage(messages.errorSavingTitle)}
                  </Alert.Heading>
                  {/* @ts-expect-error -- see above */}
                  {formikProps.errors.enabled?.message || formatMessage(messages.errorSavingMessage)}
                </Alert>
              )}
              {!hideAppToggle && (
                <FormSwitchGroup
                  id={`enable-${appId}-toggle`}
                  name="enabled"
                  onChange={(event) => formikProps.handleChange(event)}
                  onBlur={formikProps.handleBlur}
                  checked={formikProps.values.enabled}
                  disabled={!isEditable}
                  label={
                    <div className="d-flex align-items-center">
                      {enableAppLabel}
                      {formikProps.values.enabled && (
                        <Badge className="ml-2" variant="success" data-testid="enable-badge">
                          {formatMessage(messages.enabled)}
                        </Badge>
                      )}
                    </div>
                  }
                  helpText={
                    <div>
                      <p>{enableAppHelp}</p>
                      <span className="py-3">{learnMoreLink}</span>
                    </div>
                  }
                />
              )}
              {bodyChildren}
              {(formikProps.values.enabled || configureBeforeEnable) && children
                && <AppConfigFormDivider marginAdj={{ default: 0, sm: 0 }} />}
              {children && (
                <TransitionReplace>
                  {formikProps.values.enabled || configureBeforeEnable ?
                    (
                      <React.Fragment key="app-enabled">
                        {children(formikProps)}
                      </React.Fragment>
                    ) :
                    <React.Fragment key="app-disabled" />}
                </TransitionReplace>
              )}
            </AppSettingsModalBase>
          </Form>
        )}
      </Formik>
    );
  }
  return (
    <AppSettingsModalBase
      title={title}
      isOpen
      onClose={onClose}
      variant={modalVariant}
      isMobile={isMobile}
    >
      {courseAppsStatus === RequestStatus.PENDING && <Loading />}
      {courseAppsStatus === RequestStatus.FAILED && <ConnectionErrorAlert />}
      {courseAppsStatus === RequestStatus.DENIED && <PermissionDeniedAlert />}
    </AppSettingsModalBase>
  );
};

export default AppSettingsModal;
