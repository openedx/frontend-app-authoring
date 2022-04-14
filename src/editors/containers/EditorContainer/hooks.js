import { useSelector } from 'react-redux';

import { RequestKeys } from '../../data/constants/requests';
import { selectors } from '../../data/redux';
import * as appHooks from '../../hooks';

export const {
  navigateCallback,
  nullMethod,
  saveBlock,
} = appHooks;

export const handleSaveClicked = ({ getContent, dispatch }) => (
  () => saveBlock({ content: getContent(), dispatch })
);
export const handleCancelClicked = ({ onClose }) => {
  if (onClose) {
    return onClose;
  }
  return navigateCallback(useSelector(selectors.app.returnUrl));
};
export const isInitialized = () => useSelector(selectors.app.isInitialized);
export const saveFailed = () => useSelector((state) => (
  selectors.requests.isFailed(state, { requestKey: RequestKeys.saveBlock })
));
