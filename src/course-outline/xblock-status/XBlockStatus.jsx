import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import {
  Check as CheckIcon,
  AccessTime as ClockIcon,
  CalendarMonth as CalendarIcon,
  VisibilityOff as HideIcon,
  Lock as LockIcon,
  Groups as GroupsIcon,
  WarningFilled as WarningIcon,
} from '@edx/paragon/icons';

import messages from './messages';
import { COURSE_BLOCK_NAMES } from '../constants';

const XBlockStatus = ({
  isSelfPaced,
  isCustomRelativeDatesActive,
  item,
}) => {
  const intl = useIntl();

  const {
    category,
    explanatoryMessage,
    releasedToStudents,
    releaseDate,
    isProctoredExam,
    isOnboardingExam,
    isPracticeExam,
    prereq,
    prereqs,
    staffOnlyMessage,
    userPartitionInfo,
    hasPartitionGroupComponents,
    format: gradingType,
    dueDate,
    relativeWeeksDue,
    isTimeLimited,
    graded,
    courseGraders,
    hideAfterDue,
  } = item;

  const isInstructorPaced = !isSelfPaced;
  const isVertical = category === COURSE_BLOCK_NAMES.vertical.id;
  const statusMessages = [];

  let releaseLabel = messages.unscheduledLabel;
  if (releasedToStudents) {
    releaseLabel = messages.releasedLabel;
  } else if (releaseDate) {
    releaseLabel = messages.scheduledLabel;
  }

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

  if (prereq) {
    let prereqDisplayName = '';
    prereqs.forEach((block) => {
      if (block.blockUsageKey === prereq) {
        prereqDisplayName = block.blockDisplayName;
      }
    });
    statusMessages.push({
      icon: LockIcon,
      text: intl.formatMessage(messages.prerequisiteLabel, { prereqDisplayName }),
    });
  }

  if (!staffOnlyMessage && isVertical) {
    const { selectedPartitionIndex, selectedGroupsLabel } = userPartitionInfo;
    if (selectedPartitionIndex !== -1 && !Number.isNaN(selectedPartitionIndex)) {
      statusMessages.push({
        icon: GroupsIcon,
        text: intl.formatMessage(messages.restrictedUnitAccess, { selectedGroupsLabel }),
      });
    } else if (hasPartitionGroupComponents) {
      statusMessages.push({
        icon: GroupsIcon,
        text: intl.formatMessage(messages.restrictedUnitAccessToSomeContent),
      });
    }
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
    if (dueDate && isInstructorPaced) {
      return (
        <div className="status-grading-date" data-testid="due-date-div">
          {intl.formatMessage(messages.dueLabel)} {dueDate}
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

  const explanatoryMessageDiv = () => (
    <span data-testid="explanatory-message-span">
      {explanatoryMessage}
    </span>
  );

  const renderGradingTypeAndDueDate = () => {
    const showRelativeWeeks = isSelfPaced && isCustomRelativeDatesActive && relativeWeeksDue;
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
    } if ((dueDate && !isSelfPaced) || graded) {
      return (
        <>
          <div className="d-flex align-items-center">
            {gradingTypeDiv()}
            {dueDateDiv()}
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

  const hideAfterDueMessage = () => (
    <div className="d-flex align-items-center" data-testid="hide-after-due-message">
      <Icon className="mr-1" size="sm" src={HideIcon} />
      <span className="status-hide-after-due-value">
        {isSelfPaced
          ? intl.formatMessage(messages.hiddenAfterEndDate)
          : intl.formatMessage(messages.hiddenAfterDueDate)}
      </span>
    </div>
  );

  const renderGradingPolicyAlert = () => {
    let gradingPolicyMismatch = false;
    if (graded) {
      if (gradingType) {
        gradingPolicyMismatch = (
          courseGraders.filter((cg) => cg.toLowerCase() === gradingType.toLowerCase())
        ).length === 0;
      }
    }

    if (gradingPolicyMismatch) {
      return (
        <div
          className="grading-mismatch-alert d-flex align-items-center p-4 mt-2 rounded shadow"
          data-testid="grading-mismatch-alert"
        >
          <Icon className="mr-1 text-warning" size="lg" src={WarningIcon} />
          {intl.formatMessage(messages.gradingPolicyMismatchText, { gradingType })}
        </div>
      );
    }
    return null;
  };

  const renderStatusMessages = () => {
    if (statusMessages.length > 0) {
      return (
        <div className="border-top border-light mt-2 text-dark" data-testid="status-messages-div">
          {statusMessages.map(({ icon, text }) => (
            <div key={text} className="d-flex align-items-center pt-1">
              <Icon className="mr-1" size="sm" src={icon} />
              {text}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="text-secondary-400 x-small mb-1">
      {!isVertical && (
        explanatoryMessage ? explanatoryMessageDiv() : isInstructorPaced && releaseStatusDiv()
      )}
      {!isVertical && renderGradingTypeAndDueDate()}
      {hideAfterDue && hideAfterDueMessage()}
      {renderStatusMessages()}
      {renderGradingPolicyAlert()}
    </div>
  );
};

XBlockStatus.defaultProps = {
  isCustomRelativeDatesActive: false,
};

XBlockStatus.propTypes = {
  isSelfPaced: PropTypes.bool.isRequired,
  isCustomRelativeDatesActive: PropTypes.bool,
  item: PropTypes.shape({
    category: PropTypes.string.isRequired,
    explanatoryMessage: PropTypes.string,
    releasedToStudents: PropTypes.bool.isRequired,
    releaseDate: PropTypes.string.isRequired,
    isProctoredExam: PropTypes.bool,
    isOnboardingExam: PropTypes.bool,
    isPracticeExam: PropTypes.bool,
    prereq: PropTypes.string,
    prereqs: PropTypes.arrayOf(PropTypes.shape({
      blockUsageKey: PropTypes.string.isRequired,
      blockDisplayName: PropTypes.string.isRequired,
    })),
    staffOnlyMessage: PropTypes.bool,
    userPartitionInfo: PropTypes.shape({
      selectedPartitionIndex: PropTypes.number.isRequired,
      selectedGroupsLabel: PropTypes.string.isRequired,
    }),
    hasPartitionGroupComponents: PropTypes.bool.isRequired,
    format: PropTypes.string,
    dueDate: PropTypes.string,
    relativeWeeksDue: PropTypes.number,
    isTimeLimited: PropTypes.bool,
    graded: PropTypes.bool,
    courseGraders: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    hideAfterDue: PropTypes.bool,
  }).isRequired,
};

export default XBlockStatus;
