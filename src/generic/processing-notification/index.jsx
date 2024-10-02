import PropTypes from 'prop-types';
import {
  Icon, Toast,
} from '@openedx/paragon';
import { Settings as IconSettings } from '@openedx/paragon/icons';
import { capitalize } from 'lodash';

const ProcessingNotification = ({ isShow, title, action, close }) => (
  <Toast
    show={isShow}
    aria-hidden={isShow}
    action={action && {...action}}
    onClose={close}
  >
    <span className="d-flex align-items-center">
      <Icon className="processing-notification-icon mb-0 mr-2" src={IconSettings} />
      <span className="font-weight-bold h4 mb-0 text-white">{capitalize(title)}</span>
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
