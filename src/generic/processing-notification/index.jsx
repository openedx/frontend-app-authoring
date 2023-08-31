import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Badge, Icon } from '@edx/paragon';
import { Settings as IconSettings } from '@edx/paragon/icons';
import { capitalize } from 'lodash';

import { NOTIFICATION_MESSAGES } from '../../constants';

const ProcessingNotification = ({ isShow, title }) => (
  <Badge
    className={classNames('processing-notification', {
      'is-show': isShow,
    })}
    variant="secondary"
    aria-hidden={isShow}
  >
    <Icon className="processing-notification-icon" src={IconSettings} />
    <h2 className="processing-notification-title">
      {capitalize(title)}
    </h2>
  </Badge>
);

ProcessingNotification.propTypes = {
  isShow: PropTypes.bool.isRequired,
  title: PropTypes.oneOf(Object.values(NOTIFICATION_MESSAGES)).isRequired,
};

export default ProcessingNotification;
