import React from 'react';
import { PropTypes } from 'prop-types';
import { Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { Locked, LockOpen } from '@openedx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from '../../messages';

const AccessColumn = ({
  row,
  // injected
  intl,
}) => {
  const { locked } = row.original;
  return (
    <OverlayTrigger
      placement="top"
      overlay={(
        <Tooltip id="access-tooltip-description">
          {intl.formatMessage(messages.lockFileTooltipContent)}
        </Tooltip>
      )}
    >
      {locked ? (
        <Icon src={Locked} size="sm" />
      ) : (
        <Icon src={LockOpen} size="sm" />
      )}
    </OverlayTrigger>
  );
};

AccessColumn.propTypes = {
  row: {
    original: {
      locked: PropTypes.bool.isRequired,
    }.isRequired,
  }.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(AccessColumn);
