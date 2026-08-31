import React from 'react';
import { Row } from '@tanstack/react-table';
import { useIntl } from '@edx/frontend-platform/i18n';

import ExpandCollapseIconButton from '@src/generic/ExpandCollapseIconButton';
import type { TreeRowData } from '@src/taxonomy/tree-table/types';
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
  const isExpanded = !!row?.getIsExpanded();

  return (
    <ExpandCollapseIconButton
      canExpand={canExpand}
      isExpanded={isExpanded}
      onToggle={row?.getToggleExpandedHandler()}
      expandedLabel={intl.formatMessage(messages.showSubtagsButtonLabel)}
      collapsedLabel={intl.formatMessage(messages.hideSubtagsButtonLabel)}
      className="mr-1"
    />
  );
};

export default OptionalExpandLink;
