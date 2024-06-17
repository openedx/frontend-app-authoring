// @ts-check
import React from 'react';

const useToastContext = () => {
  // TODO, We can convert this to a queue of messages,
  // see: https://github.com/open-craft/frontend-app-course-authoring/pull/38#discussion_r1638990647

  const [toastMessage, setToastMessage] = React.useState(/** @type{null|string} */ (null));

  React.useEffect(() => () => {
    // Cleanup function to avoid updating state on unmounted component
    setToastMessage(null);
  }, []);

  const showToast = React.useCallback((message) => setToastMessage(message), [setToastMessage]);
  const closeToast = React.useCallback(() => setToastMessage(null), [setToastMessage]);

  return {
    toastMessage,
    showToast,
    closeToast,
  };
};

export default useToastContext;
