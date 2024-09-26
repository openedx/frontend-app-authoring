import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Badge, Button, Icon, Stack,
} from '@openedx/paragon';
import { Settings as IconSettings } from '@openedx/paragon/icons';
import { capitalize } from 'lodash';

const ProcessingNotification = ({ isShow, title, action }) => (
  <Badge
    className={classNames('processing-notification', {
      'is-show': isShow,
    })}
    variant="secondary"
    aria-hidden={isShow}
  >
    <Stack gap={2} direction="vertical">
      <Stack direction="horizontal">
        <Icon className="processing-notification-icon" src={IconSettings} />
        <h2 className="processing-notification-title">
          {capitalize(title)}
        </h2>
      </Stack>
      { action && (
        <Button
          variant="primary"
          onClick={action.onClick}
        >{action.label}
        </Button>
      )}
    </Stack>
  </Badge>
);

ProcessingNotification.propTypes = {
  isShow: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }),
};

export default ProcessingNotification;
