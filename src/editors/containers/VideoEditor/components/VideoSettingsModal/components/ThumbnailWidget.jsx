import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import hooks from './hooks';
import CollapsibleFormWidget from './CollapsibleFormWidget';

/**
 * Collapsible Form widget controlling video thumbnail
 */
export const ThumbnailWidget = () => {
  const dispatch = useDispatch();
  const { thumbnail } = hooks.widgetValues({
    dispatch,
    fields: { [hooks.selectorKeys.thumbnail]: hooks.genericWidget },
  });
  return (
    <CollapsibleFormWidget title="Thumbnail">
      <p>{thumbnail.formValue}</p>
    </CollapsibleFormWidget>
  );
};

export default ThumbnailWidget;
