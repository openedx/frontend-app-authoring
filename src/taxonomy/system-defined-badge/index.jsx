import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  OverlayTrigger,
  Popover,
} from '@edx/paragon';
import messages from './messages';

const SystemDefinedBadge = ({ taxonomyId }) => {
  const intl = useIntl();
  const getSystemToolTip = () => (
    <Popover id={`system-defined-tooltip-${taxonomyId}`} className="system-defined-tooltip">
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
      overlay={getSystemToolTip()}
    >
      <Badge variant="light" className="system-defined-badge">
        {intl.formatMessage(messages.systemDefinedBadge)}
      </Badge>
    </OverlayTrigger>
  );
};

SystemDefinedBadge.propTypes = {
  taxonomyId: PropTypes.number.isRequired,
};

export default SystemDefinedBadge;
