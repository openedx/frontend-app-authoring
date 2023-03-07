import { useState } from 'react';
import { useSelector } from 'react-redux';

import analyticsEvt from '../../data/constants/analyticsEvt';
import { RequestKeys } from '../../data/constants/requests';
import { selectors } from '../../data/redux';
import { StrictDict } from '../../utils';
import * as appHooks from '../../hooks';
import * as module from './hooks';

export const {
  clearSaveError,
  navigateCallback,
  nullMethod,
  saveBlock,
} = appHooks;

export const state = StrictDict({
  isCancelConfirmModalOpen: (val) => useState(val),
});

export const handleSaveClicked = ({ dispatch, getContent, validateEntry }) => {
  const destination = useSelector(selectors.app.returnUrl);
  const analytics = useSelector(selectors.app.analytics);

  return () => saveBlock({
    analytics,
    content: getContent({ dispatch }),
    destination,
    dispatch,
    validateEntry,
  });
};

export const cancelConfirmModalToggle = () => {
  const [isCancelConfirmOpen, setIsOpen] = module.state.isCancelConfirmModalOpen(false);
  return {
    isCancelConfirmOpen,
    openCancelConfirmModal: () => setIsOpen(true),
    closeCancelConfirmModal: () => setIsOpen(false),
  };
};

export const handleCancel = ({ onClose }) => {
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

export const saveFailed = () => useSelector((rootState) => (
  selectors.requests.isFailed(rootState, { requestKey: RequestKeys.saveBlock })
));
