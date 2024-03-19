import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import {
  AccessTime as ClockIcon,
} from '@openedx/paragon/icons';

import messages from './messages';

const ReleaseStatus = ({
  isInstructorPaced,
  explanatoryMessage,
  releaseDate,
  releasedToStudents,
}) => {
  const intl = useIntl();

  const explanatoryMessageDiv = () => (
    <span data-testid="explanatory-message-span">
      {explanatoryMessage}
    </span>
  );

  let releaseLabel = messages.unscheduledLabel;
  if (releasedToStudents) {
    releaseLabel = messages.releasedLabel;
  } else if (releaseDate) {
    releaseLabel = messages.scheduledLabel;
  }

  const releaseStatusDiv = () => (
    <div className="d-flex align-items-center" data-testid="release-status-div">
      <span className="sr-only status-release-label">
        {intl.formatMessage(messages.releaseStatusScreenReaderTitle)}
      </span>
      <Icon className="mr-1" size="sm" src={ClockIcon} />
      {intl.formatMessage(releaseLabel)}
      {releaseDate && releaseDate}
    </div>
  );

  if (explanatoryMessage) {
    return explanatoryMessageDiv();
  }

  if (isInstructorPaced) {
    return releaseStatusDiv();
  }

  return null;
};

ReleaseStatus.defaultProps = {
  explanatoryMessage: '',
  releaseDate: '',
  releasedToStudents: false,
};

ReleaseStatus.propTypes = {
  isInstructorPaced: PropTypes.bool.isRequired,
  explanatoryMessage: PropTypes.string,
  releaseDate: PropTypes.string,
  releasedToStudents: PropTypes.bool,
};

export default ReleaseStatus;
