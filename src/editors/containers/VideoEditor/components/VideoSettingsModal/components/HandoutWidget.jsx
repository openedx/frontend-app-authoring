import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import hooks from './hooks';
import CollapsibleFormWidget from './CollapsibleFormWidget';

/**
 * Collapsible Form widget controlling video handouts
 */
export const HandoutWidget = () => {
  const dispatch = useDispatch();
  const { handout } = hooks.widgetValues({
    dispatch,
    fields: { [hooks.selectorKeys.handout]: hooks.genericWidget },
  });
  return (
    <CollapsibleFormWidget title="Handout">
      <p>{handout.formValue}</p>
    </CollapsibleFormWidget>
  );
};

export default HandoutWidget;
