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
  const canExpand = !!row?.getCanExpand() && !forceHide;

  if (!canExpand) {
    return (
      <IconButton
        src={ExpandMore}
        alt=""
        size="sm"
        className="mr-1 invisible"
        disabled
        tabIndex={-1}
        aria-hidden
      />
    );
  }

  const isExpanded = !!row?.getIsExpanded();
  const buttonLabel = isExpanded
    ? intl.formatMessage(messages.hideSubtagsButtonLabel)
    : intl.formatMessage(messages.showSubtagsButtonLabel);

  return (
    <IconButton
      src={isExpanded ? ExpandLess : ExpandMore}
      onClick={row?.getToggleExpandedHandler()}
      alt={buttonLabel}
      aria-label={buttonLabel}
      aria-expanded={isExpanded}
      size="sm"
      className="mr-1"
    />
  );
};

export default OptionalExpandLink;
