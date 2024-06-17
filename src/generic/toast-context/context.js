// @ts-check
import React from 'react';

const ToastContext = React.createContext({
  toastMessage: /** @type{null|string} */ (null),
  showToast: /** @type{function} */ (() => {}),
  closeToast: /** @type{function} */ (() => {}),
});

export default ToastContext;
