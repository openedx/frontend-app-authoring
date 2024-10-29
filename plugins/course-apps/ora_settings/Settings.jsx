import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';

import {
  ActionRow, Alert, Badge, Form, Hyperlink, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { updateModel, useModel } from 'CourseAuthoring/generic/model-store';

import { RequestStatus } from 'CourseAuthoring/data/constants';
import FormSwitchGroup from 'CourseAuthoring/generic/FormSwitchGroup';
import Loading from 'CourseAuthoring/generic/Loading';
import PermissionDeniedAlert from 'CourseAuthoring/generic/PermissionDeniedAlert';
import ConnectionErrorAlert from 'CourseAuthoring/generic/ConnectionErrorAlert';
import { useAppSetting, useIsMobile } from 'CourseAuthoring/utils';
import { getLoadingStatus, getSavingStatus } from 'CourseAuthoring/pages-and-resources/data/selectors';
import { updateSavingStatus } from 'CourseAuthoring/pages-and-resources/data/slice';

import messages from './messages';

const ORASettings = ({ onClose }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const alertRef = useRef(null);
  const updateSettingsRequestStatus = useSelector(getSavingStatus);
  const loadingStatus = useSelector(getLoadingStatus);
  const isMobile = useIsMobile();
  const modalVariant = isMobile ? 'dark' : 'default';
  const appId = 'ora_settings';
  const appInfo = useModel('courseApps', appId);

  const [enableFlexiblePeerGrade, saveSetting] = useAppSetting(
    'forceOnFlexiblePeerOpenassessments',
  );
  const initialFormValues = { enableFlexiblePeerGrade };

  const [formValues, setFormValues] = useState(initialFormValues);
  const [saveError, setSaveError] = useState(false);

  const submitButtonState = updateSettingsRequestStatus === RequestStatus.IN_PROGRESS ? 'pending' : 'default';
  const handleSettingsSave = (values) => saveSetting(values.enableFlexiblePeerGrade);

  const handleSubmit = async (event) => {
    let success = true;
    event.preventDefault();

    success = success && await handleSettingsSave(formValues);
    await setSaveError(!success);
    if ((initialFormValues.enableFlexiblePeerGrade !== formValues.enableFlexiblePeerGrade) && success) {
      success = await dispatch(updateModel({
        modelType: 'courseApps',
        model: {
          id: appId, enabled: formValues.enableFlexiblePeerGrade,
        },
      }));
    }
    !success && alertRef?.current.scrollIntoView(); // eslint-disable-line @typescript-eslint/no-unused-expressions
  };

  const handleChange = (e) => {
    setFormValues({ enableFlexiblePeerGrade: e.target.checked });
  };

  useEffect(() => {
    if (updateSettingsRequestStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateSavingStatus({ status: '' }));
      onClose();
    }
  }, [updateSettingsRequestStatus]);

  const renderBody = () => {
    switch (loadingStatus) {
      case RequestStatus.SUCCESSFUL:
        return (
          <>
            {saveError && (
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
              label={(
                <div className="d-flex align-items-center">
                  {formatMessage(messages.enableFlexPeerGradeLabel)}
                  {formValues.enableFlexiblePeerGrade && (
                    <Badge className="ml-2" variant="success" data-testid="enable-badge">
                      {formatMessage(messages.enabledBadgeLabel)}
                    </Badge>
                  )}
                </div>
              )}
              helpText={(
                <div>
                  <p>{formatMessage(messages.enableFlexPeerGradeHelp)}</p>
                  <span className="py-3">
                    <Hyperlink
                      className="text-primary-500 small"
                      destination={appInfo.documentationLinks?.learnMoreConfiguration}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {formatMessage(messages.ORASettingsHelpLink)}
                    </Hyperlink>
                  </span>
                </div>
              )}
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
              disabled={submitButtonState === RequestStatus.IN_PROGRESS}
              state={submitButtonState}
              type="submit"
            />
          </ActionRow>
        </ModalDialog.Footer>
      </Form>
    </ModalDialog>
  );
};

ORASettings.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ORASettings;
