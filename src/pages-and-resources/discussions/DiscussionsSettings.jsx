import React, {
  useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Switch,
  useLocation,
  useRouteMatch,
} from 'react-router';
import { history } from '@edx/frontend-platform';
import { PageRoute } from '@edx/frontend-platform/react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, StatefulButton } from '@edx/paragon';
import { Check } from '@edx/paragon/icons';

import FullScreenModal from '../../generic/full-screen-modal';
import Stepper from '../../generic/stepper';
import { useModel } from '../../generic/model-store';

import AppList from './app-list';
import ConfigFormContainer from './app-config-form';
import messages from './messages';
import { fetchApps, saveAppConfig } from './data/thunks';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';

function DiscussionsSettings({ courseId, intl }) {
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef();
  const { path } = useRouteMatch();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const app = useModel('apps', selectedAppId);

  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);

  // Route paths
  const discussionsPath = `${pagesAndResourcesPath}/discussions`;
  const selectedAppConfigPath = `${discussionsPath}/configure/${selectedAppId}`;

  const isFirstStep = pathname === discussionsPath;
  const submitButtonState = isSubmitting ? 'pending' : 'default';

  const steps = [{
    label: intl.formatMessage(messages.selectDiscussionTool),
    iconLabel: isFirstStep ? undefined : (
      <Check style={{ width: '1rem', height: '1rem' }} />
    ),
    incomplete: false,
  },
  {
    label: intl.formatMessage(messages.configureApp, {
      name: app ? app.name : 'discussions',
    }),
    incomplete: isFirstStep,
  }];

  useEffect(() => {
    dispatch(fetchApps(courseId));
  }, [courseId]);

  const handleSelectApp = useCallback((appId) => {
    if (selectedAppId === appId) {
      setSelectedAppId(null);
    } else {
      setSelectedAppId(appId);
    }
  }, [selectedAppId]);

  const handleClose = useCallback(() => {
    history.push(pagesAndResourcesPath);
  }, [courseId]);

  const handleStartConfig = useCallback(() => {
    history.push(selectedAppConfigPath);
  }, [discussionsPath, selectedAppId]);

  // This causes the form to be submitted from a button outside the form.
  const handleApply = () => {
    setIsSubmitting(true);
    formRef.current.requestSubmit();
  };

  // This is a callback that gets called after the form has been submitted successfully.
  const handleSubmit = useCallback((values) => {
    dispatch(saveAppConfig(courseId, selectedAppId, values)).then(() => {
      history.push(pagesAndResourcesPath);
    });
  }, [courseId, selectedAppId, courseId]);

  const handleBack = useCallback(() => {
    if (isFirstStep) {
      history.push(pagesAndResourcesPath);
    } else {
      history.push(discussionsPath);
      setSelectedAppId(null);
    }
  }, [discussionsPath]);

  return (
    <FullScreenModal title={intl.formatMessage(messages.configure)} onClose={handleClose}>
      <FullScreenModal.Header title={intl.formatMessage(messages.configure)} />
      <FullScreenModal.Body className="d-flex flex-column">
        <Stepper className="h-100">
          <Stepper.Header steps={steps} />
          <Stepper.Body className="bg-light-200">
            <Switch>
              <PageRoute exact path={`${path}`}>
                <AppList
                  onSelectApp={handleSelectApp}
                  selectedAppId={selectedAppId}
                />
              </PageRoute>
              <PageRoute path={`${path}/configure/:appId`}>
                <ConfigFormContainer
                  courseId={courseId}
                  selectedAppId={selectedAppId}
                  onSubmit={handleSubmit}
                  formRef={formRef}
                />
              </PageRoute>
            </Switch>
          </Stepper.Body>
          <Stepper.Footer className="d-flex justify-content-end align-items-center">
            <Button variant="outline-primary" className="mr-2" onClick={handleBack}>
              {intl.formatMessage(messages.backButton)}
            </Button>
            {isFirstStep && (
              <Button variant="primary" onClick={handleStartConfig} disabled={!selectedAppId}>
                {intl.formatMessage(messages.nextButton)}
              </Button>
            )}
            {!isFirstStep && (
              <StatefulButton
                labels={{
                  default: intl.formatMessage(messages.applyButton),
                  pending: intl.formatMessage(messages.applyingButton),
                  complete: intl.formatMessage(messages.appliedButton),
                }}
                state={submitButtonState}
                className="mr-3"
                onClick={handleApply}
              />
            )}
          </Stepper.Footer>
        </Stepper>
      </FullScreenModal.Body>
    </FullScreenModal>
  );
}

DiscussionsSettings.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionsSettings);
