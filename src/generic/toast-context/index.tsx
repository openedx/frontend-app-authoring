import React from 'react';

import ProcessingNotification from '../processing-notification';

export interface ToastActionData {
  label: string;
  onClick: () => void;
}

export interface ToastContextData {
  toastMessage: string | null;
  toastAction?: ToastActionData;
  capitilize?: boolean;
  showToast: (message: string, action?: ToastActionData, capitilize?: boolean) => void;
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
  capitilize: false,
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
  const [capitilize, setCapitilize] = React.useState<boolean>(false);

  const resetState = React.useCallback(() => {
    setToastMessage(null);
    setToastAction(undefined);
    setCapitilize(false);
  }, []);

  React.useEffect(() => () => {
    // Cleanup function to avoid updating state on unmounted component
    resetState();
  }, []);

  const showToast = React.useCallback((message, action?: ToastActionData, isCapitilize?: boolean) => {
    setToastMessage(message);
    setToastAction(action);
    setCapitilize(isCapitilize ?? false);
  }, [setToastMessage, setToastAction]);
  const closeToast = React.useCallback(() => resetState(), [setToastMessage, setToastAction, setCapitilize]);

  const context = React.useMemo(() => ({
    toastMessage,
    toastAction,
    capitilize,
    showToast,
    closeToast,
  }), [toastMessage, toastAction, capitilize, showToast, closeToast]);

  return (
    <ToastContext.Provider value={context}>
      {props.children}
      { toastMessage && (
        <ProcessingNotification
          isShow={toastMessage !== null}
          title={toastMessage}
          action={toastAction}
          close={closeToast}
          disableCapitalize={!capitilize}
        />
      )}
    </ToastContext.Provider>
  );
};
