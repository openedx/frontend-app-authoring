import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  OverlayTrigger,
  Popover,
} from '@openedx/paragon';
import messages from './messages';

interface SystemDefinedBadgeProps {
  taxonomyId: number;
}

const SystemDefinedBadge: React.FC<SystemDefinedBadgeProps> = ({ taxonomyId }) => {
  const intl = useIntl();
  const getToolTip = () => (
    <Popover id={`system-defined-tooltip-${taxonomyId}`} className="mw-300px">
      <Popover.Title as="h5">
        {intl.formatMessage(messages.systemTaxonomyPopoverTitle)}
      </Popover.Title>
      <Popover.Content>
        {intl.formatMessage(messages.systemTaxonomyPopoverBody)}
      </Popover.Content>
    </Popover>
  );

  return (
    <OverlayTrigger
      key={`system-defined-overlay-${taxonomyId}`}
      placement="top"
      overlay={getToolTip()}
    >
      <Badge variant="light" className="p-1.5 font-weight-normal system-defined-badge">
        {intl.formatMessage(messages.systemDefinedBadge)}
      </Badge>
    </OverlayTrigger>
  );
};

export default SystemDefinedBadge;