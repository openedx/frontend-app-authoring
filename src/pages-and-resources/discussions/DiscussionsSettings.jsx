import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  useRouteMatch,
} from 'react-router';
import { useDispatch } from 'react-redux';
import { history } from '@edx/frontend-platform';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, FullscreenModal, Stepper,
} from '@edx/paragon';

import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';

import messages from './messages';
import DiscussionsProvider from './DiscussionsProvider';
import { fetchApps } from './data/thunks';
import AppList from './app-list';
import AppConfigForm from './app-config-form';

const SELECTION_STEP = 'selection';
const SETTINGS_STEP = 'settings';

function DiscussionsSettings({ courseId, intl }) {
  const dispatch = useDispatch();
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);

  useEffect(() => {
    dispatch(fetchApps(courseId));
  }, [courseId]);

  const discussionsPath = `${pagesAndResourcesPath}/discussions`;
  const { params: { appId } } = useRouteMatch();

  const startStep = appId ? SETTINGS_STEP : SELECTION_STEP;
  const [currentStep, setCurrentStep] = useState(startStep);

  useEffect(() => {
    setCurrentStep(appId ? SETTINGS_STEP : SELECTION_STEP);
  }, [appId]);

  const handleClose = useCallback(() => {
    history.push(pagesAndResourcesPath);
  }, [pagesAndResourcesPath]);

  const handleBack = useCallback(() => {
    history.push(discussionsPath);
  }, [discussionsPath]);

  return (
    <DiscussionsProvider path={discussionsPath}>
      <AppConfigForm.Provider>
        <Stepper activeKey={currentStep}>
          <FullscreenModal
            className="bg-light-200"
            title={intl.formatMessage(messages.configure)}
            onClose={handleClose}
            isOpen
            footerNode={(
              <>
                <Stepper.ActionRow eventKey={SELECTION_STEP}>
                  <AppList.NextButton />
                </Stepper.ActionRow>
                <Stepper.ActionRow eventKey={SETTINGS_STEP}>
                  <div className="d-flex w-100 justify-content-between">
                    <Button
                      aria-label={intl.formatMessage(messages.backButton)}
                      variant="outline-primary"
                      onClick={handleBack}
                    >
                      {intl.formatMessage(messages.backButton)}
                    </Button>
                    <AppConfigForm.ApplyButton />
                  </div>
                </Stepper.ActionRow>
              </>
            )}
          >
            <Stepper.Step
              eventKey={SELECTION_STEP}
              title={intl.formatMessage(messages.providerSelection)}
            >
              <AppList />
            </Stepper.Step>
            <Stepper.Step
              eventKey={SETTINGS_STEP}
              title={intl.formatMessage(messages.settings)}
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
}

DiscussionsSettings.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionsSettings);
