import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Check as CheckIcon, CalendarMonth as CalendarIcon } from '@openedx/paragon/icons';
import { convertToLocalTime } from '../../utils';


import messages from './messages';

const GradingTypeAndDueDate = ({
  isSelfPaced,
  isInstructorPaced,
  isCustomRelativeDatesActive,
  isTimeLimited,
  isProctoredExam,
  isOnboardingExam,
  isPracticeExam,
  graded,
  gradingType,
  dueDate,
  relativeWeeksDue,
}) => {
  const intl = useIntl();

  // Convert dueDate to local time, if valid
  const localDueDate = dueDate ? convertToLocalTime(dueDate) : 'No scheduled due date';

  const showRelativeWeeks = isSelfPaced && isCustomRelativeDatesActive && relativeWeeksDue;

  let examValue = '';
  if (isProctoredExam) {
    if (isOnboardingExam) {
      examValue = messages.onboardingExam;
    } else if (isPracticeExam) {
      examValue = messages.practiceProctoredExam;
    } else {
      examValue = messages.proctoredExam;
    }
  } else {
    examValue = messages.timedExam;
  }

  const gradingTypeDiv = () => (
    <div className="d-flex align-items-center mr-1" data-testid="grading-type-div">
      <span className="sr-only status-grading-label">
        {intl.formatMessage(messages.gradedAsScreenReaderLabel)}
      </span>
      <Icon className="mr-1" size="sm" src={CheckIcon} />
      <span className="status-grading-value">
        {gradingType || intl.formatMessage(messages.ungradedText)}
      </span>
    </div>
  );

  const dueDateDiv = () => {
    // If it's instructor-paced and dueDate is valid, display the formatted date
    if (localDueDate && isInstructorPaced && localDueDate !== 'No scheduled due date') {
      return (
        <div className="status-grading-date" data-testid="due-date-div">
          {intl.formatMessage(messages.dueLabel)} {localDueDate}
        </div>
      );
    }
    return null;
  };

  const selfPacedRelativeDueWeeksDiv = () => (
    <div className="d-flex align-items-center" data-testid="self-paced-relative-due-weeks-div">
      <Icon className="mr-1" size="sm" src={CalendarIcon} />
      <span className="status-custom-grading-date">
        {intl.formatMessage(messages.customDueDateLabel, { relativeWeeksDue })}
      </span>
    </div>
  );

  if (isTimeLimited) {
    return (
      <>
        <div className="d-flex align-items-center">
          {gradingTypeDiv()} -
          <span className="sr-only">{intl.formatMessage(examValue)}</span>
          <span className="mx-2" data-testid="exam-value-span">
            {intl.formatMessage(examValue)}
          </span>
          {dueDateDiv()}
        </div>
        {showRelativeWeeks && (selfPacedRelativeDueWeeksDiv())}
      </>
    );
  } if ((localDueDate !== 'No scheduled due date' && !isSelfPaced) || graded) {  // Check if there's a valid due date
    return (
      <>
        <div className="d-flex align-items-center">
          {gradingTypeDiv()}
          {dueDateDiv()}  {/* Display the local due date */}
        </div>
        {showRelativeWeeks && (selfPacedRelativeDueWeeksDiv())}
      </>
    );
  } if (showRelativeWeeks) {
    return (
      <>
        {gradingTypeDiv()}
        {selfPacedRelativeDueWeeksDiv()}
      </>
    );
  }

  return null;
};

GradingTypeAndDueDate.defaultProps = {
  isCustomRelativeDatesActive: false,
  isTimeLimited: false,
  isProctoredExam: false,
  isOnboardingExam: false,
  isPracticeExam: false,
  graded: false,
  gradingType: '',
  dueDate: '',
  relativeWeeksDue: null,
};

GradingTypeAndDueDate.propTypes = {
  isInstructorPaced: PropTypes.bool.isRequired,
  isSelfPaced: PropTypes.bool.isRequired,
  isCustomRelativeDatesActive: PropTypes.bool,
  isTimeLimited: PropTypes.bool,
  isProctoredExam: PropTypes.bool,
  isOnboardingExam: PropTypes.bool,
  isPracticeExam: PropTypes.bool,
  graded: PropTypes.bool,
  gradingType: PropTypes.string,
  dueDate: PropTypes.string,
  relativeWeeksDue: PropTypes.number,
};

export default GradingTypeAndDueDate;