/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';

/**
 * Displays a friendly, localized text name for the given XBlock/component type
 * e.g. `vertical` becomes `"Unit"`
 * @type {React.FC<{type: string}>}
 */
const BlockTypeLabel = ({ type }) => {
  // TODO: Load the localized list of Component names from Studio REST API?
  const msg = messages[`blockType.${type}`];

  if (msg) {
    return <FormattedMessage {...msg} />;
  }
  // Replace underscores and hypens with spaces, then let the browser capitalize this
  // in a locale-aware way to get a reasonable display value.
  // e.g. 'drag-and-drop-v2' -> "Drag And Drop V2"
  return <span style={{ textTransform: 'capitalize' }}>XXX {type.replace(/[_-]/g, ' ')}</span>;
};

export default BlockTypeLabel;
