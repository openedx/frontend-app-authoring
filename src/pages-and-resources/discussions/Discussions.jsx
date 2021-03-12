import React, {
  useCallback, useEffect, useRef, useState,
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

import FullScreenModal from '../../generic/full-screen-modal/FullScreenModal';
import Stepper from '../../generic/stepper/Stepper';

import messages from './messages';
import AppList from './AppList';
import ConfigFormContainer from './ConfigFormContainer';
import { fetchApps, saveAppConfig } from './data/thunks';
import StepperFooter from '../../generic/stepper/StepperFooter';
import StepperHeader from '../../generic/stepper/StepperHeader';
import StepperBody from '../../generic/stepper/StepperBody';
import FullScreenModalHeader from '../../generic/full-screen-modal/FullScreenModalHeader';
import FullScreenModalBody from '../../generic/full-screen-modal/FullScreenModalBody';

function Discussions({ courseId, intl }) {
  const discussionsPath = `/course/${courseId}/pages-and-resources/discussions`;

  const [selectedAppId, setSelectedAppId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef();

  const { path } = useRouteMatch();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchApps(courseId));
  }, [courseId]);

  const onSelectApp = useCallback((appId) => {
    if (selectedAppId === appId) {
      setSelectedAppId(null);
    } else {
      setSelectedAppId(appId);
    }
  }, [selectedAppId]);

  const onClose = useCallback(() => {
    history.push(`/course/${courseId}/pages-and-resources`);
  }, [courseId]);

  const onStartConfig = useCallback(() => {
    history.push(`${discussionsPath}/configure/${selectedAppId}`);
  }, [discussionsPath, selectedAppId]);

  // This causes the form to be submitted from a button outside the form.
  const onApply = () => {
    setIsSubmitting(true);
    formRef.current.requestSubmit();
  };

  // This is a callback that gets called after the form has been submitted successfully.
  const onSubmit = useCallback((values) => {
    dispatch(saveAppConfig(courseId, selectedAppId, values)).then(() => {
      history.push(`/course/${courseId}/pages-and-resources`);
    });
  }, [courseId, selectedAppId, courseId]);

  const onBack = useCallback(() => {
    history.push(discussionsPath);
    setSelectedAppId(null);
  }, [discussionsPath]);

  const isFirstStep = pathname === discussionsPath;

  const steps = [{
    label: 'Select discussion tool',
    iconLabel: isFirstStep ? undefined : (
      <Check style={{ width: '1rem', height: '1rem' }} />
    ),
  },
  {
    label: 'Configure discussions',
  }];

  const submitButtonState = isSubmitting ? 'pending' : 'default';

  return (
    <FullScreenModal title={intl.formatMessage(messages.configure)} onClose={onClose}>
      <FullScreenModalHeader title={intl.formatMessage(messages.configure)} />
      <FullScreenModalBody className="d-flex flex-column">
        <Stepper className="h-100">
          <StepperHeader steps={steps} />
          <StepperBody>
            <Switch>
              <PageRoute exact path={`${path}`}>
                <AppList
                  onSelectApp={onSelectApp}
                  selectedAppId={selectedAppId}
                />
              </PageRoute>
              <PageRoute path={`${path}/configure/:appId`}>
                <ConfigFormContainer
                  courseId={courseId}
                  selectedAppId={selectedAppId}
                  onSubmit={onSubmit}
                  formRef={formRef}
                />
              </PageRoute>
            </Switch>
          </StepperBody>
          <StepperFooter className="d-flex justify-content-between align-items-center">
            <Button variant="outline-primary" onClick={onBack} disabled={isFirstStep}>
              {intl.formatMessage(messages.backButton)}
            </Button>
            {isFirstStep && (
              <Button variant="primary" onClick={onStartConfig} disabled={!selectedAppId}>
                {intl.formatMessage(messages.nextButton)}
              </Button>
            )}
            {!isFirstStep && (
              <StatefulButton
                labels={{
                  default: intl.formatMessage(messages.applyButton),
                  pending: intl.formatMessage(messages.savingConfig),
                  complete: intl.formatMessage(messages.savedConfig),
                }}
                state={submitButtonState}
                className="mr-3"
                onClick={onApply}
              />
            )}
          </StepperFooter>
        </Stepper>
      </FullScreenModalBody>
    </FullScreenModal>
  );
}

Discussions.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(Discussions);
