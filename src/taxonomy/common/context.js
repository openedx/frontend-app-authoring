// @ts-check
/* eslint-disable import/prefer-default-export */
import React from 'react';

export const TaxonomyContext = React.createContext({
  toastMessage: /** @type{null|string} */ (null),
  setToastMessage: /** @type{null|function} */ (null),
  alertProps: /** @type{null|function} */ (null),
  setAlertProps: /** @type{null|function} */ (null),
});
