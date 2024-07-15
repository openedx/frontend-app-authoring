import React from 'react';
import { Toast } from '@openedx/paragon';

export interface ToastContextData {
  toastMessage: string | null;
  showToast: (message: string) => void;
  closeToast: () => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Global context to keep track of popup message(s) that appears to user after
 * they take an action like creating or deleting something.
 */
export const ToastContext = React.createContext({
  toastMessage: null,
  showToast: () => {},
  closeToast: () => {},
} as ToastContextData);

/**
 * React component to provide `ToastContext` to the app
 */
export const ToastProvider = (props: ToastProviderProps) => {
  // TODO, We can convert this to a queue of messages,
  // see: https://github.com/open-craft/frontend-app-course-authoring/pull/38#discussion_r1638990647

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => () => {
    // Cleanup function to avoid updating state on unmounted component
    setToastMessage(null);
  }, []);

  const showToast = React.useCallback((message) => setToastMessage(message), [setToastMessage]);
  const closeToast = React.useCallback(() => setToastMessage(null), [setToastMessage]);

  const context = React.useMemo(() => ({
    toastMessage,
    showToast,
    closeToast,
  }), [toastMessage, showToast, closeToast]);

  return (
    <ToastContext.Provider value={context}>
      {props.children}
      { toastMessage && (
        <Toast show={toastMessage !== null} onClose={closeToast}>
          {toastMessage}
        </Toast>
      )}
    </ToastContext.Provider>
  );
};
