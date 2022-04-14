import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import hooks from './hooks';
import CollapsibleFormWidget from './CollapsibleFormWidget';

export const HandoutWidget = () => {
  const dispatch = useDispatch();
  const handout = hooks.widgetValue(hooks.selectorKeys.handout, dispatch);
  return (
    <CollapsibleFormWidget title="Handout">
      <p>{handout.formValue}</p>
    </CollapsibleFormWidget>
  );
};

export default HandoutWidget;
