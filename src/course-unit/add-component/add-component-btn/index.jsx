import PropTypes from 'prop-types';
import {
  Badge,
  Button,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import AddComponentIcon from './AddComponentIcon';

const AddComponentButton = ({
  type,
  displayName,
  onClick,
  beta,
  disabled,
  disabledReason,
}) => {
  const intl = useIntl();

  const button = (
    <Button
      variant="outline-primary"
      className="add-component-button flex-column rounded-sm"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <AddComponentIcon type={type} />
      <span className="sr-only">{intl.formatMessage(messages.buttonText)}</span>
      <span className="small mt-2">{displayName}</span>
      {beta && <Badge className="pb-1 mt-1" variant="primary">Beta</Badge>}
    </Button>
  );

  if (disabled && disabledReason) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`disabled-${type}`}>{disabledReason}</Tooltip>}
      >
        <span>{button}</span>
      </OverlayTrigger>
    );
  }
  return button;
};

AddComponentButton.defaultProps = {
  beta: false,
  disabled: false,
  disabledReason: null,
};
AddComponentButton.propTypes = {
  type: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  beta: PropTypes.bool,
  disabled: PropTypes.bool,
  disabledReason: PropTypes.string,
};

export default AddComponentButton;
