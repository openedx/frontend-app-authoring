import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { AccessTime as ClockIcon } from '@openedx/paragon/icons';
import { convertToLocalTime } from '../../utils';
import moment from 'moment-timezone';


import messages from './messages';

const ReleaseStatus = ({
  isInstructorPaced,
  explanatoryMessage,
  releaseDate,
  releasedToStudents,
}) => {
  const intl = useIntl();

  // Convert the release date if it's valid
  const localReleaseDate = releaseDate ? convertToLocalTime(releaseDate) : '';
  const displayReleaseDate = localReleaseDate === 'Invalid date' ? null : localReleaseDate;

  let releaseLabel = messages.unscheduledLabel;
  if (releasedToStudents) {
    releaseLabel = messages.releasedLabel;
  } else if (releaseDate) {
    releaseLabel = messages.scheduledLabel;
  }

  // If explanatory message exists, display it
  if (explanatoryMessage) {
    return (
      <span data-testid="explanatory-message-span">
        {explanatoryMessage}
      </span>
    );
  }

  // If it's instructor-paced, display the release status with the formatted date
  if (isInstructorPaced) {
    return (
      <div className="d-flex align-items-center" data-testid="release-status-div">
        <span className="sr-only status-release-label">
          {intl.formatMessage(messages.releaseStatusScreenReaderTitle)}
        </span>
        <Icon className="mr-1" size="sm" src={ClockIcon} aria-hidden="true" />
        {intl.formatMessage(releaseLabel)}
        {displayReleaseDate}
      </div>
    );
  }

  return null; // Return null if neither explanatory message nor instructor-paced condition is met
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