import React from 'react';
import { IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import { Row } from '@tanstack/react-table';
import { useIntl } from '@edx/frontend-platform/i18n';

import type { TreeRowData } from '../tree-table/types';
import messages from './messages';

interface OptionalExpandLinkProps {
  row?: Row<TreeRowData>;
  forceHide?: boolean;
}

/** OptionalExpandLink
 * Renders an optional expand/collapse button for a tanstack/react-table row.
 *
 * For simplicity, this just hides the button if the row can't be expanded,
 * in order to maintain a correctly-sized placeholder.
 */
const OptionalExpandLink = ({ row, forceHide = false }: OptionalExpandLinkProps) => {
  const intl = useIntl();

  return (
    <IconButton
      src={row?.getIsExpanded() ? ExpandLess : ExpandMore}
      onClick={row?.getToggleExpandedHandler()}
      alt={intl.formatMessage(messages.showSubtagsButtonLabel)}
      size="sm"
      style={{ visibility: row?.getCanExpand() && !forceHide ? 'visible' : 'hidden' }}
      className="mr-1"
    />
  );
};

export default OptionalExpandLink;
