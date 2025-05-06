import PropTypes from 'prop-types';
import {
  Icon,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

const CustomIcon = ({
  icon,
  message1,
  message2,
  placement = 'top',
}) => {
  const intl = useIntl();

  return (
    <OverlayTrigger
      key="top"
      placement={placement}
      overlay={(
        <Tooltip variant="dark" id="tooltip-top" className={placement !== 'top' ? 'ml-3' : ''}>
          {intl.formatMessage(message1)}
          {message1 && <br />}
          {intl.formatMessage(message2)}
        </Tooltip>
      )}
    >
      <Icon src={icon} />
    </OverlayTrigger>
  );
};

const messagePropsType = {
  id: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string.isRequired,
};

CustomIcon.propTypes = {
  icon: PropTypes.elementType.isRequired,
  message1: PropTypes.shape(messagePropsType).isRequired,
  message2: PropTypes.shape(messagePropsType).isRequired,
  placement: PropTypes.string,
};

export default CustomIcon;
