import { useEffect, useState, useRef } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import {
  ActionRow,
  Alert,
  Badge,
  Form,
  Hyperlink,
  ModalDialog,
  StatefulButton,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

import { RequestStatus } from 'CourseAuthoring/data/constants';
import FormSwitchGroup from 'CourseAuthoring/generic/FormSwitchGroup';
import Loading from 'CourseAuthoring/generic/Loading';
import PermissionDeniedAlert from 'CourseAuthoring/generic/PermissionDeniedAlert';
import ConnectionErrorAlert from 'CourseAuthoring/generic/ConnectionErrorAlert';
import { useAppSetting, useIsMobile } from 'CourseAuthoring/utils';
import { useUpdateCourseAdvancedSettings } from 'CourseAuthoring/data/apiHooks';
import { useCourseAuthoringContext } from 'CourseAuthoring/CourseAuthoringContext';

import messages from './messages';

const ORASettings = ({ onClose }: { onClose: () => void; }) => {
  const { formatMessage } = useIntl();
  const alertRef = useRef<HTMLDivElement>(null);
  const {
    courseId,
    courseApps,
    courseAppsStatus,
  } = useCourseAuthoringContext();

  const isMobile = useIsMobile();
  const modalVariant = isMobile ? 'dark' : 'default';
  const appId = 'ora_settings';
  const appInfo = courseApps.find((app) => app.id === appId);

  const updateCourseAdvancedSettingsMutation = useUpdateCourseAdvancedSettings(courseId);
  const settingName = 'forceOnFlexiblePeerOpenassessments';

  const enableFlexiblePeerGrade = useAppSetting(settingName);

  const [formValues, setFormValues] = useState({ enableFlexiblePeerGrade });

  useEffect(() => {
    setFormValues({ enableFlexiblePeerGrade });
  }, [enableFlexiblePeerGrade]);

  const submitButtonState = updateCourseAdvancedSettingsMutation.isPending ? 'pending' : 'default';
  const handleSettingsSave = (values) =>
    updateCourseAdvancedSettingsMutation.mutate({
      setting: settingName,
      value: values.enableFlexiblePeerGrade,
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    handleSettingsSave(formValues);
  };

  const handleChange = (e) => {
    setFormValues({ enableFlexiblePeerGrade: e.target.checked });
  };

  useEffect(() => {
    if (updateCourseAdvancedSettingsMutation.isSuccess) {
      onClose();
    }
  }, [updateCourseAdvancedSettingsMutation.isSuccess]);

  useEffect(() => {
    if (updateCourseAdvancedSettingsMutation.isError) {
      alertRef?.current?.scrollIntoView?.();
    }
  }, [updateCourseAdvancedSettingsMutation.isError]);

  const renderBody = () => {
    switch (courseAppsStatus) {
      case RequestStatus.SUCCESSFUL:
        return (
          <>
            {updateCourseAdvancedSettingsMutation.isError && (
              <Alert variant="danger" icon={Info} ref={alertRef}>
                <Alert.Heading>
                  {formatMessage(messages.errorSavingTitle)}
                </Alert.Heading>
                {formatMessage(messages.errorSavingMessage)}
              </Alert>
            )}
            <FormSwitchGroup
              id="enable-flexible-peer-grade"
              name="enableFlexiblePeerGrade"
              label={
                <div className="d-flex align-items-center">
                  {formatMessage(messages.enableFlexPeerGradeLabel)}
                  {formValues.enableFlexiblePeerGrade && (
                    <Badge className="ml-2" variant="success" data-testid="enable-badge">
                      {formatMessage(messages.enabledBadgeLabel)}
                    </Badge>
                  )}
                </div>
              }
              helpText={
                <div>
                  <p>{formatMessage(messages.enableFlexPeerGradeHelp)}</p>
                  <span className="py-3">
                    <Hyperlink
                      className="text-primary-500 small"
                      destination={appInfo?.documentationLinks?.learnMoreConfiguration}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {formatMessage(messages.ORASettingsHelpLink)}
                    </Hyperlink>
                  </span>
                </div>
              }
              onChange={handleChange}
              checked={formValues.enableFlexiblePeerGrade}
            />
          </>
        );
      case RequestStatus.DENIED:
        return <PermissionDeniedAlert />;
      case RequestStatus.FAILED:
        return <ConnectionErrorAlert />;
      default:
        return <Loading />;
    }
  };

  return (
    <ModalDialog
      title={formatMessage(messages.heading)}
      isOpen
      onClose={onClose}
      size="lg"
      variant={modalVariant}
      hasCloseButton={isMobile}
      isFullscreenScroll
      isFullscreenOnMobile
      isOverflowVisible
    >
      <Form onSubmit={handleSubmit} data-testid="proctoringForm">
        <ModalDialog.Header>
          <ModalDialog.Title>
            {formatMessage(messages.heading)}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          {renderBody()}
        </ModalDialog.Body>
        <ModalDialog.Footer className="p-4">
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              {formatMessage(messages.cancelLabel)}
            </ModalDialog.CloseButton>
            <StatefulButton
              labels={{
                default: formatMessage(messages.saveLabel),
                pending: formatMessage(messages.pendingSaveLabel),
              }}
              description="Form save button"
              data-testid="submissionButton"
              disabled={submitButtonState === 'pending'}
              state={submitButtonState}
              type="submit"
            />
          </ActionRow>
        </ModalDialog.Footer>
      </Form>
    </ModalDialog>
  );
};

export default ORASettings;
