import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { selectors, thunkActions } from './data/redux';
import * as module from './hooks';

export const initializeApp = ({ dispatch, data }) => useEffect(
  () => dispatch(thunkActions.app.initialize(data)),
  [],
);

export const navigateTo = (destination) => {
  window.location.assign(destination);
};

export const navigateCallback = (destination) => () => module.navigateTo(destination);

export const nullMethod = () => ({});

export const saveBlock = ({
  content,
  dispatch,
}) => dispatch(thunkActions.app.saveBlock({
  returnToUnit: module.navigateCallback(useSelector(selectors.app.returnUrl)),
  content,
}));
