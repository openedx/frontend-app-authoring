import { useSelector } from 'react-redux';

import { RequestKeys } from '../../data/constants/requests';
import { selectors } from '../../data/redux';
import * as appHooks from '../../hooks';
import analyticsEvt from '../../data/constants/analyticsEvt';

export const {
  navigateCallback,
  nullMethod,
  saveBlock,
} = appHooks;

export const handleSaveClicked = ({ getContent, dispatch }) => {
  const destination = useSelector(selectors.app.returnUrl);
  const analytics = useSelector(selectors.app.analytics);
  return () => saveBlock({
    content: getContent(),
    destination,
    analytics,
    dispatch,
  });
};
export const handleCancelClicked = ({ onClose }) => {
  if (onClose) {
    return onClose;
  }
  return navigateCallback({
    destination: useSelector(selectors.app.returnUrl),
    analyticsEvent: analyticsEvt.editorCancelClick,
    analytics: useSelector(selectors.app.analytics),
  });
};
export const isInitialized = () => useSelector(selectors.app.isInitialized);
export const saveFailed = () => useSelector((state) => (
  selectors.requests.isFailed(state, { requestKey: RequestKeys.saveBlock })
));
