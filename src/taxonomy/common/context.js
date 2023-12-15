// @ts-check
/* eslint-disable import/prefer-default-export */
import React from 'react';

/**
 * @typedef AlertProps
 * @type {Object}
 * @property {React.ReactNode} title - title of the alert.
 * @property {React.ReactNode} description - description of the alert.
 */
export const TaxonomyContext = React.createContext({
  toastMessage: /** @type{null|string} */ (null),
  setToastMessage: /** @type{null|React.Dispatch<React.SetStateAction<null|string>>} */ (null),
  alertProps: /** @type{null|AlertProps} */ (null),
  setAlertProps: /** @type{null|React.Dispatch<React.SetStateAction<null|AlertProps>>} */ (null),
});
