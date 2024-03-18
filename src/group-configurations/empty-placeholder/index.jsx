import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Add as IconAdd } from '@openedx/paragon/icons';
import { Button } from '@openedx/paragon';

import messages from './messages';

const EmptyPlaceholder = ({ onCreateNewGroup, isExperiment }) => {
  const { formatMessage } = useIntl();
  const titleMessage = isExperiment
    ? messages.experimentalTitle
    : messages.title;
  const buttonMessage = isExperiment
    ? messages.experimentalButton
    : messages.button;

  return (
    <div
      className="group-configurations-empty-placeholder bg-white"
      data-testid="group-configurations-empty-placeholder"
    >
      <p className="mb-0 small text-gray-700">{formatMessage(titleMessage)}</p>
      <Button
        iconBefore={IconAdd}
        onClick={onCreateNewGroup}
      >
        {formatMessage(buttonMessage)}
      </Button>
    </div>
  );
};

EmptyPlaceholder.defaultProps = {
  isExperiment: false,
};

EmptyPlaceholder.propTypes = {
  onCreateNewGroup: PropTypes.func.isRequired,
  isExperiment: PropTypes.bool,
};

export default EmptyPlaceholder;
