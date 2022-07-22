import { useEffect } from 'react';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import analyticsEvt from './data/constants/analyticsEvt';

import { thunkActions } from './data/redux';
import * as module from './hooks';

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
  content,
  destination,
  analytics,
  dispatch,
}) => {
  dispatch(thunkActions.app.saveBlock({
    returnToUnit: module.navigateCallback({
      destination,
      analyticsEvent: analyticsEvt.editorSaveClick,
      analytics,
    }),
    content,
  }));
};
