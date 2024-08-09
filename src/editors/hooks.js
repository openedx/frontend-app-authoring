import { useEffect } from 'react';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import analyticsEvt from './data/constants/analyticsEvt';

import { actions, thunkActions } from './data/redux';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';
import { RequestKeys } from './data/constants/requests';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const initializeApp = ({ dispatch, data }) => useEffect(
  () => dispatch(thunkActions.app.initialize(data)),
  [data],
);

export const navigateTo = (destination) => {
  window.location.assign(destination);
};

export const navigateCallback = ({
  returnFunction,
  destination,
  analyticsEvent,
  analytics,
}) => (response) => {
  if (process.env.NODE_ENV !== 'development' && analyticsEvent && analytics) {
    sendTrackEvent(analyticsEvent, analytics);
  }
  if (returnFunction) {
    returnFunction()(response);
    return;
  }
  module.navigateTo(destination);
};

export const nullMethod = () => ({});

export const saveBlock = ({
  analytics,
  content,
  destination,
  dispatch,
  returnFunction,
  validateEntry,
}) => {
  if (!content) {
    return;
  }
  let attemptSave = false;
  if (validateEntry) {
    if (validateEntry()) {
      attemptSave = true;
    }
  } else {
    attemptSave = true;
  }
  if (attemptSave) {
    dispatch(thunkActions.app.saveBlock(
      content,
      module.navigateCallback({
        destination,
        analyticsEvent: analyticsEvt.editorSaveClick,
        analytics,
        returnFunction,
      }),
    ));
  }
};

export const clearSaveError = ({
  dispatch,
}) => () => dispatch(actions.requests.clearRequest({ requestKey: RequestKeys.saveBlock }));
