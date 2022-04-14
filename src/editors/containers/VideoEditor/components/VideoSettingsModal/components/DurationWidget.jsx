import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import CollapsibleFormWidget from './CollapsibleFormWidget';
import hooks from './hooks';

export const DurationWidget = () => {
  const dispatch = useDispatch();
  const duration = hooks.widgetValue(hooks.selectorKeys.duration, dispatch);
  return (
    <CollapsibleFormWidget title="Duration">
      <div>Duration Widget</div>
      <p>Start: {duration.formValue.startTime}</p>
      <p>Stop: {duration.formValue.stopTime}</p>
      <p>Total: {duration.formValue.total}</p>
    </CollapsibleFormWidget>
  );
};

export default DurationWidget;
