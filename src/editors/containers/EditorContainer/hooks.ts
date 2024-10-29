import { useState } from 'react';
import { useSelector } from 'react-redux';

import analyticsEvt from '../../data/constants/analyticsEvt';
import { RequestKeys } from '../../data/constants/requests';
import { selectors } from '../../data/redux';
import { StrictDict } from '../../utils';
import * as appHooks from '../../hooks';

export const {
  clearSaveError,
  navigateCallback,
  nullMethod,
  saveBlock,
} = appHooks;

export const state = StrictDict({
  // eslint-disable-next-line react-hooks/rules-of-hooks
  isCancelConfirmModalOpen: (val) => useState(val),
});

export const handleSaveClicked = ({
  dispatch,
  getContent,
  validateEntry,
  returnFunction,
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const returnUrl = useSelector(selectors.app.returnUrl);
  const destination = returnFunction ? '' : returnUrl;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const analytics = useSelector(selectors.app.analytics);

  return () => saveBlock({
    analytics,
    content: getContent({ dispatch }),
    destination,
    dispatch,
    returnFunction,
    validateEntry,
  });
};

export const cancelConfirmModalToggle = () => {
  const [isCancelConfirmOpen, setIsOpen] = state.isCancelConfirmModalOpen(false);
  return {
    isCancelConfirmOpen,
    openCancelConfirmModal: () => setIsOpen(true),
    closeCancelConfirmModal: () => setIsOpen(false),
  };
};

export const handleCancel = ({
  onClose = null,
  returnFunction = null,
}: {
  onClose?: (() => void) | null;
  returnFunction?: (() => (result: any) => void) | null;
}): ((result?: any) => void) => {
  if (onClose) {
    return onClose;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const returnUrl = useSelector(selectors.app.returnUrl);
  return navigateCallback({
    returnFunction,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    destination: returnFunction ? '' : returnUrl,
    analyticsEvent: analyticsEvt.editorCancelClick,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    analytics: useSelector(selectors.app.analytics),
  });
};

// eslint-disable-next-line react-hooks/rules-of-hooks
export const isInitialized = () => useSelector(selectors.app.isInitialized);

// eslint-disable-next-line react-hooks/rules-of-hooks
export const saveFailed = () => useSelector((rootState) => (
  selectors.requests.isFailed(rootState, { requestKey: RequestKeys.saveBlock })
));
