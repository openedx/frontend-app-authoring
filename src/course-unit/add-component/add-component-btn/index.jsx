import PropTypes from 'prop-types';
import { Badge, Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import AddComponentIcon from './AddComponentIcon';

const AddComponentButton = ({
  type, displayName, onClick, beta,
}) => {
  const intl = useIntl();

  return (
    <Button
      variant="outline-primary"
      className="add-component-button flex-column rounded-sm"
      onClick={onClick}
    >
      <AddComponentIcon type={type} />
      <span className="sr-only">{intl.formatMessage(messages.buttonText)}</span>
      <span className="small mt-2">{displayName}</span>
      {beta && <Badge className="pb-1 mt-1" variant="primary">Beta</Badge>}
    </Button>
  );
};

AddComponentButton.defaultProps = {
  beta: false,
};

AddComponentButton.propTypes = {
  type: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  beta: PropTypes.bool,
};

export default AddComponentButton;
