import React from 'react';
import type { AlertErrorProps } from '../../generic/alert-error';

// TODO: We shoud change the `toastMessage` and the `setToastMessage` to use the ToastContext
export interface TaxonomyContextData {
  toastMessage: null | string;
  setToastMessage: null | React.Dispatch<React.SetStateAction<null | string>>;
  alertError: null | AlertErrorProps;
  setAlertError: null | React.Dispatch<React.SetStateAction<null | AlertErrorProps>>;
}

export const TaxonomyContext = React.createContext<TaxonomyContextData>({
  toastMessage: null,
  setToastMessage: null,
  alertError: null,
  setAlertError: null,
});
