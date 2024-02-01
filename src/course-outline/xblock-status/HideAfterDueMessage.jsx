import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import {
  VisibilityOff as HideIcon,
} from '@openedx/paragon/icons';

import messages from './messages';

const HideAfterDueMessage = ({ isSelfPaced }) => {
  const intl = useIntl();
  return (
    <div className="d-flex align-items-center" data-testid="hide-after-due-message">
      <Icon className="mr-1" size="sm" src={HideIcon} />
      <span className="status-hide-after-due-value">
        {isSelfPaced
          ? intl.formatMessage(messages.hiddenAfterEndDate)
          : intl.formatMessage(messages.hiddenAfterDueDate)}
      </span>
    </div>
  );
};

HideAfterDueMessage.propTypes = {
  isSelfPaced: PropTypes.bool.isRequired,
};

export default HideAfterDueMessage;
