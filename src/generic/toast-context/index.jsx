/* eslint-disable react/prop-types */
// @ts-check
import { Toast } from '@openedx/paragon';
import React from 'react';

/**
 * Global context to keep track of popup message(s) that appears to user after
 * they take an action like creating or deleting something.
 */
export const ToastContext = React.createContext({
  toastMessage: /** @type{null|string} */ (null),
  showToast: /** @type{function} */ (() => {}),
  closeToast: /** @type{function} */ (() => {}),
});

/**
 * React component to provide `ToastContext` to the app
 * @param {{children?: React.ReactNode}} props The components to wrap
 */
export const ToastProvider = (props) => {
  // TODO, We can convert this to a queue of messages,
  // see: https://github.com/open-craft/frontend-app-course-authoring/pull/38#discussion_r1638990647

  const [toastMessage, setToastMessage] = React.useState(/** @type{null|string} */ (null));

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
