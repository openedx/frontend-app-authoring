import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import hooks from './hooks';
import CollapsibleFormWidget from './CollapsibleFormWidget';

export const ThumbnailWidget = () => {
  const dispatch = useDispatch();
  const thumbnail = hooks.widgetValue(hooks.selectorKeys.thumbnail, dispatch);
  return (
    <CollapsibleFormWidget title="Thumbnail">
      <p>{thumbnail.formValue}</p>
    </CollapsibleFormWidget>
  );
};

export default ThumbnailWidget;
