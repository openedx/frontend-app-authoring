import React from 'react';

export interface AlertProps {
  /** title of the alert */
  title: React.ReactNode;
  /** description of the alert */
  description: React.ReactNode;
}

export interface TaxonomyContextData {
  toastMessage: null | string;
  setToastMessage: null | React.Dispatch<React.SetStateAction<null | string>>;
  alertProps: null | AlertProps;
  setAlertProps: null | React.Dispatch<React.SetStateAction<null | AlertProps>>;
}

export const TaxonomyContext = React.createContext<TaxonomyContextData>({
  toastMessage: null,
  setToastMessage: null,
  alertProps: null,
  setAlertProps: null,
});
