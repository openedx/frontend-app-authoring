import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Add as IconAdd } from '@openedx/paragon/icons';
import { Button } from '@openedx/paragon';

import messages from './messages';

const EmptyPlaceholder = ({ onCreateNewGroup, isExperiment, readOnly }) => {
  const { formatMessage } = useIntl();
  // Read-only users cannot create anything here, so the copy states the course has
  // no group configurations instead of inviting them to add the first one.
  const titleMessage = readOnly
    ? messages.readOnlyTitle
    : (isExperiment ? messages.experimentalTitle : messages.title);
  const buttonMessage = isExperiment
    ? messages.experimentalButton
    : messages.button;

  return (
    <div
      className="group-configurations-empty-placeholder bg-white"
      data-testid="group-configurations-empty-placeholder"
    >
      <p className="mb-0 small text-gray-700">{formatMessage(titleMessage)}</p>
      {!readOnly && (
        <Button
          iconBefore={IconAdd}
          onClick={onCreateNewGroup}
        >
          {formatMessage(buttonMessage)}
        </Button>
      )}
    </div>
  );
};

EmptyPlaceholder.defaultProps = {
  onCreateNewGroup: null,
  isExperiment: false,
  readOnly: false,
};

EmptyPlaceholder.propTypes = {
  onCreateNewGroup: PropTypes.func,
  isExperiment: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default EmptyPlaceholder;
