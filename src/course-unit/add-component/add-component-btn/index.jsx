import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import AddComponentIcon from './AddComponentIcon';

const AddComponentButton = ({ type, displayName, onClick }) => {
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
    </Button>
  );
};

AddComponentButton.propTypes = {
  type: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default AddComponentButton;
