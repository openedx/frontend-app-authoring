import PropTypes from 'prop-types';
import {
  Icon, Toast,
} from '@openedx/paragon';
import { Settings as IconSettings } from '@openedx/paragon/icons';
import { capitalize } from 'lodash';

const ProcessingNotification = ({ isShow, title, action, close }) => (
  <Toast
    className='processing-notification'
    show={isShow}
    aria-hidden={isShow}
    action={action && {...action}}
    onClose={close}
  >
    <span className="d-flex">
      <Icon className="processing-notification-icon" src={IconSettings} />
      <span className="processing-notification-title">{capitalize(title)}</span>
    </span>
  </Toast>
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
