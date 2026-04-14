import React, { useContext } from 'react';

import ProcessingNotification from '../processing-notification';

export interface ToastActionData {
  label: string;
  onClick: () => void;
}

export interface ToastContextData {
  toastMessage: string | null;
  toastAction?: ToastActionData;
  toastDelay?: number;
  showToast: (
    message: string,
    action?: ToastActionData,
    delay?: number,
  ) => void;
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

// TODO: Temporary solution. Module-level references to showToast and closeToast, kept in sync by ToastProvider.
// This allows calling them from outside React (e.g. Redux thunks)
// without violating the Rules of Hooks.
// This approach is used in Redux thunks as a workaround and will be migrated to React Query soon.
let internalShowToast: ToastContextData['showToast'] = () => {};
let internalCloseToast: ToastContextData['closeToast'] = () => {};

/**
 * React component to provide `ToastContext` to the app
 */
export const ToastProvider = (props: ToastProviderProps) => {
  // TODO, We can convert this to a queue of messages,
  // see: https://github.com/open-craft/frontend-app-course-authoring/pull/38#discussion_r1638990647

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [toastAction, setToastAction] = React.useState<ToastActionData>();
  const [toastDelay, setToastDelay] = React.useState<number>();

  const resetState = React.useCallback(() => {
    setToastMessage(null);
    setToastAction(undefined);
    // Set Toast delay by default, currently,
    // it is not possible to disable the timer in Paragon's toast menu.
    setToastDelay(undefined);
  }, []);

  React.useEffect(() => () => {
    // Cleanup function to avoid updating state on unmounted component
    resetState();
  }, []);

  const showToast = React.useCallback((
    message,
    action?: ToastActionData,
    delay?: number,
  ) => {
    setToastMessage(message);
    setToastAction(action);
    setToastDelay(delay);
  }, [setToastMessage, setToastAction]);
  const closeToast = React.useCallback(() => resetState(), [setToastMessage, setToastAction]);

  // Keep the module-level references up to date whenever the callbacks change.
  React.useEffect(() => {
    internalShowToast = showToast;
    internalCloseToast = closeToast;
  }, [showToast, closeToast]);

  const context = React.useMemo(() => ({
    toastMessage,
    toastAction,
    toastDelay,
    showToast,
    closeToast,
  }), [
    toastMessage,
    toastAction,
    toastDelay,
    showToast,
    closeToast,
  ]);

  return (
    <ToastContext.Provider value={context}>
      {props.children}
      {toastMessage && (
        <ProcessingNotification
          isShow={toastMessage !== null}
          title={toastMessage}
          action={toastAction}
          delay={toastDelay}
          close={closeToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export function useToastContext(): ToastContextData {
  const ctx = useContext(ToastContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useToastContext() was used in a component without a <ToastProvider> ancestor.');
  }
  return ctx;
}

/**
 * Imperative API for triggering a toast notification from outside React
 * (e.g. Redux thunks, plain async functions). Requires that a <ToastProvider>
 * is mounted in the tree before this is called.
 */
export function showToastOutsideReact(message: string, action?: ToastActionData) {
  internalShowToast(message, action);
}

/**
 * Imperative API for closing the active toast from outside React
 * (e.g. Redux thunks, plain async functions). Requires that a <ToastProvider>
 * is mounted in the tree before this is called.
 */
export function closeToastOutsideReact() {
  internalCloseToast();
}
