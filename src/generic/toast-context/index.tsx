import React from 'react';

import ProcessingNotification from '../processing-notification';

export interface ToastActionData {
  label: string;
  onClick: () => void;
}

export interface ToastContextData {
  toastMessage: string | null;
  toastAction?: ToastActionData;
  showToast: (message: string, action?: ToastActionData) => void;
  closeToast: () => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Global context to keep track of popup message(s) that appears to user after
 * they take an action like creating or deleting something.
 */
export const ToastContext = React.createContext<ToastContextData>({
  toastMessage: null,
  toastAction: undefined,
  showToast: () => {},
  closeToast: () => {},
});

/**
 * React component to provide `ToastContext` to the app
 */
export const ToastProvider = (props: ToastProviderProps) => {
  // TODO, We can convert this to a queue of messages,
  // see: https://github.com/open-craft/frontend-app-course-authoring/pull/38#discussion_r1638990647

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [toastAction, setToastAction] = React.useState<ToastActionData | undefined>(undefined);

  const resetState = React.useCallback(() => {
    setToastMessage(null);
    setToastAction(undefined);
  }, []);

  React.useEffect(() => () => {
    // Cleanup function to avoid updating state on unmounted component
    resetState();
  }, []);

  const showToast = React.useCallback((message, action?: ToastActionData) => {
    setToastMessage(message);
    setToastAction(action);
  }, [setToastMessage, setToastAction]);
  const closeToast = React.useCallback(() => resetState(), [setToastMessage, setToastAction]);

  const context = React.useMemo(() => ({
    toastMessage,
    toastAction,
    showToast,
    closeToast,
  }), [toastMessage, toastAction, showToast, closeToast]);

  return (
    <ToastContext.Provider value={context}>
      {props.children}
      { toastMessage && (
        <ProcessingNotification
          isShow={toastMessage !== null}
          title={toastMessage}
          action={toastAction}
          close={closeToast}
        />
      )}
    </ToastContext.Provider>
  );
};
