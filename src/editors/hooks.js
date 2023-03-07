import { useEffect } from 'react';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import analyticsEvt from './data/constants/analyticsEvt';

import { actions, thunkActions } from './data/redux';
import * as module from './hooks';
import { RequestKeys } from './data/constants/requests';

export const initializeApp = ({ dispatch, data }) => useEffect(
  () => dispatch(thunkActions.app.initialize(data)),
  [data],
);

export const navigateTo = (destination) => {
  window.location.assign(destination);
};

export const navigateCallback = ({
  destination,
  analyticsEvent,
  analytics,
}) => () => {
  if (process.env.NODE_ENV !== 'development' && analyticsEvent && analytics) {
    sendTrackEvent(analyticsEvent, analytics);
  }
  module.navigateTo(destination);
};

export const nullMethod = () => ({});

export const saveBlock = ({
  analytics,
  content,
  destination,
  dispatch,
  validateEntry,
}) => {
  let attemptSave = false;
  if (validateEntry) {
    if (validateEntry()) {
      attemptSave = true;
    }
  } else {
    attemptSave = true;
  }
  if (attemptSave) {
    dispatch(thunkActions.app.saveBlock({
      returnToUnit: module.navigateCallback({
        destination,
        analyticsEvent: analyticsEvt.editorSaveClick,
        analytics,
      }),
      content,
    }));
  }
};

export const clearSaveError = ({
  dispatch,
}) => () => dispatch(actions.requests.clearRequest({ requestKey: RequestKeys.saveBlock }));
