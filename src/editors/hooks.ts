import { useEffect, useState } from 'react';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import analyticsEvt from './data/constants/analyticsEvt';

import { actions, thunkActions } from './data/redux';
import { RequestKeys } from './data/constants/requests';

export const useInitializeApp = ({ dispatch, data }) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    dispatch(thunkActions.app.initialize(data));
    setLoading(false);
  }, [data?.blockId, data?.studioEndpointUrl, data?.learningContextId]);
  return loading;
};

export const navigateTo = (destination: string | URL) => {
  window.location.assign(destination);
};

export const navigateCallback = ({
  returnFunction,
  destination,
  analyticsEvent,
  analytics,
}) =>
(response) => {
  if (process.env.NODE_ENV !== 'development' && analyticsEvent && analytics) {
    sendTrackEvent(analyticsEvent, analytics);
  }
  if (returnFunction) {
    returnFunction()(response);
    return;
  }
  navigateTo(destination);
};

export const nullMethod = () => ({});

/**
 * What an `onSave` override may resolve with, so the container knows whether
 * the save actually persisted. A plain resolve (no result) still means
 * persisted, so existing overrides are unaffected; only a rejection is treated
 * as an unexpected failure.
 */
export interface EditorSaveOverrideResult {
  persisted: boolean;
  error?: unknown;
}

/** Whether an `onSave` override resolved with a persisted/not result. */
export const isSaveOverrideResult = (value: unknown): value is EditorSaveOverrideResult =>
  typeof value === 'object' && value !== null && 'persisted' in value;

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
      navigateCallback({
        destination,
        analyticsEvent: analyticsEvt.editorSaveClick,
        analytics,
        returnFunction,
      }),
    ));
  }
};
export const createBlock = ({
  analytics,
  content,
  destination,
  dispatch,
  returnFunction,
}) => {
  if (!content) {
    return;
  }
  dispatch(thunkActions.app.createBlock(
    content,
    navigateCallback({
      destination,
      analyticsEvent: analyticsEvt.editorSaveClick,
      analytics,
      returnFunction,
    }),
  ));
};
export const clearSaveError = ({
  dispatch,
}) =>
() => dispatch(actions.requests.clearRequest({ requestKey: RequestKeys.saveBlock }));

export const clearCreateError = ({
  dispatch,
}) =>
() => dispatch(actions.requests.clearRequest({ requestKey: RequestKeys.createBlock }));
