import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Alert, Button, FullscreenModal, Stepper,
} from '@openedx/paragon';

import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';

import messages from './messages';
import DiscussionsProvider from './DiscussionsProvider';
import { fetchProviders } from './data/thunks';
import AppList from './app-list';
import AppConfigForm from './app-config-form';
import { DENIED, FAILED } from './data/slice';
import ConnectionErrorAlert from '../../generic/ConnectionErrorAlert';
import { useModel } from '../../generic/model-store';
import PermissionDeniedAlert from '../../generic/PermissionDeniedAlert';
import Loading from '../../generic/Loading';

const SELECTION_STEP = 'selection';
const SETTINGS_STEP = 'settings';

const DiscussionsSettings = ({ courseId, intl }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);
  const { status, hasValidationError } = useSelector(state => state.discussions);
  const { canChangeProviders } = useSelector(state => state.courseDetail);
  const courseDetail = useModel('courseDetails', courseId);

  useEffect(() => {
    dispatch(fetchProviders(courseId));
  }, [courseId]);

  const discussionsPath = `${pagesAndResourcesPath}/discussion`;
  const { appId } = useParams();

  const startStep = appId ? SETTINGS_STEP : SELECTION_STEP;
  const [currentStep, setCurrentStep] = useState(startStep);

  useEffect(() => {
    setCurrentStep(appId ? SETTINGS_STEP : SELECTION_STEP);
  }, [appId]);

  const handleClose = useCallback(() => {
    navigate(pagesAndResourcesPath);
  }, [pagesAndResourcesPath]);

  const handleBack = useCallback(() => {
    navigate(discussionsPath);
  }, [discussionsPath]);

  if (!courseDetail) {
    return <Loading />;
  }

  if (status === FAILED) {
    return (
      <FullscreenModal
        className="bg-light-200"
        title={intl.formatMessage(messages.configure)}
        onClose={handleClose}
        isOpen
      >
        <ConnectionErrorAlert />
      </FullscreenModal>
    );
  }

  if (status === DENIED) {
    return (
      <FullscreenModal
        className="bg-light-200"
        title={intl.formatMessage(messages.configure)}
        onClose={handleClose}
        isOpen
      >
        <PermissionDeniedAlert />
      </FullscreenModal>
    );
  }

  return (
    <DiscussionsProvider path={discussionsPath}>
      <AppConfigForm.Provider>
        <Stepper activeKey={currentStep}>
          <FullscreenModal
            className="bg-light-200"
            modalBodyClassName="px-sm-4"
            title={intl.formatMessage(messages.configure)}
            onClose={handleClose}
            isOpen
            beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
            isOverflowVisible={false}
            footerNode={(
              <>
                <Stepper.ActionRow eventKey={SELECTION_STEP}>
                  <AppList.NextButton />
                </Stepper.ActionRow>
                <Stepper.ActionRow eventKey={SETTINGS_STEP}>
                  <div className="d-flex w-100 justify-content-between">
                    <Button
                      variant="outline-primary"
                      onClick={handleBack}
                    >
                      {intl.formatMessage(messages.backButton)}
                    </Button>
                    <AppConfigForm.SaveButton />
                  </div>
                </Stepper.ActionRow>
              </>
            )}
          >
            <Stepper.Step
              eventKey={SELECTION_STEP}
              title={intl.formatMessage(messages.providerSelection)}
            >
              {
                !canChangeProviders && (
                  <Alert variant="warning">
                    {intl.formatMessage(messages.noProviderSwitchAfterCourseStarted)}
                  </Alert>
                )
              }
              <AppList />
            </Stepper.Step>
            <Stepper.Step
              eventKey={SETTINGS_STEP}
              title={intl.formatMessage(messages.settings)}
              description={hasValidationError ? intl.formatMessage(messages.Incomplete) : ''}
              hasError={hasValidationError}
            >
              <AppConfigForm
                courseId={courseId}
              />
            </Stepper.Step>
          </FullscreenModal>
        </Stepper>
      </AppConfigForm.Provider>
    </DiscussionsProvider>
  );
};

DiscussionsSettings.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionsSettings);
