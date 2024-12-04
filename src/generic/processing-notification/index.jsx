import PropTypes from 'prop-types';
import {
  Icon, Toast,
} from '@openedx/paragon';
import { Settings as IconSettings } from '@openedx/paragon/icons';
import { capitalize } from 'lodash';
import classNames from 'classnames';

const ProcessingNotification = ({
  isShow, title, action, close, disableCapitalize,
}) => (
  <Toast
    className={classNames({ 'processing-notification-hide-close-button': !close })}
    show={isShow}
    aria-hidden={isShow}
    action={action && { ...action }}
    onClose={close || (() => {})}
  >
    <span className="d-flex align-items-center">
      <Icon className="processing-notification-icon mb-0 mr-2" src={IconSettings} />
      <span className="font-weight-bold h4 mb-0 text-white">
        {!disableCapitalize ? capitalize(title) : title}
      </span>
    </span>
  </Toast>
);

ProcessingNotification.defaultProps = {
  close: null,
  disableCapitalize: false,
};

ProcessingNotification.propTypes = {
  isShow: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }),
  close: PropTypes.func,
  disableCapitalize: PropTypes.bool,
};

export default ProcessingNotification;
