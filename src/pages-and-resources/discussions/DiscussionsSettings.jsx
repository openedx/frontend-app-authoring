import React, {
  useCallback, useContext,
} from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  useLocation,
  useRouteMatch,
} from 'react-router';
import { history } from '@edx/frontend-platform';
import { PageRoute } from '@edx/frontend-platform/react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { Check } from '@edx/paragon/icons';

import FullScreenModal from '../../generic/full-screen-modal';
import Stepper from '../../generic/stepper';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';
import AppList from './app-list';
import AppConfigForm from './app-config-form';
import messages from './messages';
import DiscussionsProvider from './DiscussionsProvider';

function DiscussionsSettings({ courseId, intl }) {
  const { path } = useRouteMatch();
  const { pathname } = useLocation();

  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);
  const discussionsPath = `${pagesAndResourcesPath}/discussions`;

  const isFirstStep = pathname === discussionsPath;

  const steps = [{
    label: intl.formatMessage(messages.providerSelection),
    iconLabel: isFirstStep ? undefined : (
      <Check style={{ width: '1rem', height: '1rem' }} />
    ),
    incomplete: false,
  },
  {
    label: intl.formatMessage(messages.settings),
    incomplete: isFirstStep,
  }];

  const handleClose = useCallback(() => {
    history.push(pagesAndResourcesPath);
  }, [courseId]);

  const handleBack = useCallback(() => {
    if (isFirstStep) {
      history.push(pagesAndResourcesPath);
    } else {
      history.push(discussionsPath);
    }
  }, [discussionsPath, isFirstStep, pagesAndResourcesPath]);

  return (
    <DiscussionsProvider path={discussionsPath}>
      <FullScreenModal title={intl.formatMessage(messages.configure)} onClose={handleClose}>
        <FullScreenModal.Header title={intl.formatMessage(messages.configure)} />
        <FullScreenModal.Body className="d-flex flex-column">
          <AppConfigForm.Provider>
            <Stepper className="h-100">
              <Stepper.Header steps={steps} />
              <Stepper.Body className="bg-light-200">
                <Switch>
                  <PageRoute exact path={`${path}`}>
                    <AppList
                      courseId={courseId}
                    />
                  </PageRoute>
                  <PageRoute path={`${path}/configure/:appId`}>
                    <AppConfigForm
                      courseId={courseId}
                    />
                  </PageRoute>
                </Switch>
              </Stepper.Body>
              <Stepper.Footer className={`d-flex ${isFirstStep ? 'justify-content-end' : 'justify-content-between'} align-items-center`}>
                {!isFirstStep && (
                  <Button variant="outline-primary" className="ml-2" onClick={handleBack}>
                    {intl.formatMessage(messages.backButton)}
                  </Button>
                )}
                {isFirstStep && (
                  <AppList.NextButton />
                )}
                {!isFirstStep && (
                  <AppConfigForm.ApplyButton />
                )}
              </Stepper.Footer>
            </Stepper>
          </AppConfigForm.Provider>
        </FullScreenModal.Body>
      </FullScreenModal>
    </DiscussionsProvider>
  );
}

DiscussionsSettings.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionsSettings);
