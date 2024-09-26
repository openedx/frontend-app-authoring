import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';

/**
 * Displays a friendly, localized text name for the given XBlock/component type
 * e.g. `vertical` becomes `"Unit"`
 *
 * Also accepts an optional `count` number, which will be displayed if
 * it's non-zero and the block label supports it.
 */
const BlockTypeLabel: React.FC<{ blockType: string, count?: number }> = ({ blockType, count }) => {
  const msg = messages[`blockType.${blockType}`];
  const msgWithCount = messages[`blockType.${blockType}.with_count`];

  if (count && msgWithCount) {
    return <FormattedMessage values={{ count }} {...msgWithCount} />;
  }

  if (msg) {
    return <FormattedMessage {...msg} />;
  }

  // Replace underscores and hypens with spaces, then let the browser capitalize this
  // in a locale-aware way to get a reasonable display value.
  // e.g. 'drag-and-drop-v2' -> "Drag And Drop V2"
  return <span style={{ textTransform: 'capitalize' }}>{blockType.replace(/[_-]/g, ' ')}</span>;
};

export default BlockTypeLabel;
