import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Badge } from '@edx/paragon';
import PropTypes from 'prop-types';
import React from 'react';

import messages from './messages';

function StatusBadge({ intl, status, label }) {
  return (
    <>
      {label && `${label} `}
      {status
        ? <Badge variant="success">{intl.formatMessage(messages.enabled)}</Badge>
        : <Badge variant="secondary">{intl.formatMessage(messages.disabled)}</Badge>}
    </>
  );
}

StatusBadge.propTypes = {
  intl: intlShape.isRequired,
  status: PropTypes.bool.isRequired,
  label: PropTypes.string,
};

StatusBadge.defaultProps = {
  label: null,
};

export default injectIntl(StatusBadge);
