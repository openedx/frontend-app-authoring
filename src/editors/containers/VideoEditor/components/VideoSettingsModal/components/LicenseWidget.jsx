import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import hooks from './hooks';
import CollapsibleFormWidget from './CollapsibleFormWidget';

/**
 * Collapsible Form widget controlling videe licence type and details
 */
export const LicenseWidget = () => {
  const dispatch = useDispatch();
  const { licenseType, licenseDetails } = hooks.widgetValues({
    dispatch,
    fields: {
      [hooks.selectorKeys.licenseType]: hooks.genericWidget,
      [hooks.selectorKeys.licenseDetails]: hooks.objectWidget,
    },
  });
  return (
    <CollapsibleFormWidget title="License">
      <div>License Widget</div>
      <p>License Type: {licenseType.formValue}</p>
      <p>Attribution: {licenseDetails.formValue.attribution ? 'True' : 'False'}</p>
      <p>Non-Commercial: {licenseDetails.formValue.noCommercial ? 'True' : 'False'}</p>
      <p>No-Derivatives: {licenseDetails.formValue.noDerivatives ? 'True' : 'False'}</p>
      <p>Share-Alike: {licenseDetails.formValue.shareAlike ? 'True' : 'False'}</p>
    </CollapsibleFormWidget>
  );
};

export default LicenseWidget;
