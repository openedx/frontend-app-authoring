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
  }, [data?.blockId, data?.studioEndpointUrl, data?.learningContextId, data?.isMarkdownEditorEnabledForCourse]);
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
}) => (response) => {
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
}) => () => dispatch(actions.requests.clearRequest({ requestKey: RequestKeys.saveBlock }));

export const clearCreateError = ({
  dispatch,
}) => () => dispatch(actions.requests.clearRequest({ requestKey: RequestKeys.createBlock }));
