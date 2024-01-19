import React from 'react'
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, PageBanner } from '@edx/paragon';
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
  const statusMessages = [];

  let releaseLabel = messages.unscheduledLabel;
  if (releasedToStudents) {
    releaseLabel = messages.releasedLabel
  } else if (releaseDate) {
    releaseLabel = messages.scheduledLabel
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
        return;
      }
    });
    statusMessages.push({
      icon: LockIcon,
      text: intl.formatMessage(messages.prerequisiteLabel, { prereqDisplayName })
    })
  }

  if (!staffOnlyMessage) {
    const { selectedPartitionIndex, selectedGroupsLabel } = userPartitionInfo;
    if (selectedPartitionIndex !== -1 && !isNaN(selectedPartitionIndex) && category === COURSE_BLOCK_NAMES.vertical.id) {
      statusMessages.push({
        icon: GroupsIcon,
        text: intl.formatMessage(messages.restrictedUnitAccess, { selectedGroupsLabel }),
      });
    } else if (hasPartitionGroupComponents && category === COURSE_BLOCK_NAMES.vertical.id) {
      statusMessages.push({
        icon: GroupsIcon,
        text: intl.formatMessage(messages.restrictedUnitAccessToSomeContent),
      });
    }
  }

  const releaseStatusDiv = () => (
    <>
      <span className="sr-only status-release-label">
        {intl.formatMessage(messages.releaseStatusScreenReaderTitle)}
      </span>
      <div className="d-flex align-items-center">
        <Icon className="mr-1" size="sm" src={ClockIcon} />
        {intl.formatMessage(releaseLabel)}
        {releaseDate && releaseDate}
      </div>
    </>
  )

  const gradingTypeDiv = () => (
    <div className="d-flex align-items-center mr-1">
      <span className="sr-only status-grading-label">
        {intl.formatMessage(messages.gradedAsScreenReaderLabel)}
      </span>
      <Icon className="mr-1" size="sm" src={CheckIcon} />
      <span className="status-grading-value">
        {gradingType || intl.formatMessage(messages.ungradedText)}
      </span>
    </div>
  )

  const dueDateDiv = () => (
    <>
      {dueDate && isInstructorPaced && (
        <div className="status-grading-date">
          {intl.formatMessage(messages.dueLabel)} {dueDate}
        </div>
      )}
    </>
  )

  const selfPacedRelativeDueWeeksDiv = () => (
    <div className="d-flex align-items-center">
      <Icon className="mr-1" size="sm" src={CalendarIcon} />
      <span className="status-custom-grading-date">
        {intl.formatMessage(messages.customDueDateLabel, { relativeWeeksDue })}
      </span>
    </div>
  )

  const explanatoryMessageDiv = () => (
      <span>{explanatoryMessage}</span>
  )

  const renderGradingTypeAndDueDate = () => {
    const showRelativeWeeks = isSelfPaced && isCustomRelativeDatesActive && relativeWeeksDue;
    if (isTimeLimited) {
      return (
        <>
          <div className="d-flex align-items-center">
            {gradingTypeDiv()} -
            <span className="sr-only status-proctored-exam-label">{intl.formatMessage(examValue)}</span>
            <span className="mx-2">{intl.formatMessage(examValue)}</span>
            {dueDateDiv()}
          </div>
          {showRelativeWeeks && (selfPacedRelativeDueWeeksDiv())}
        </>
      )
    } else if ((dueDate && !isSelfPaced) || graded) {
      return (
        <>
          <div className="d-flex align-items-center">
            {gradingTypeDiv()}
            {dueDateDiv()}
          </div>
          {showRelativeWeeks && (selfPacedRelativeDueWeeksDiv())}
        </>
      )
    } else if (showRelativeWeeks) {
      return (
        <>
          {gradingTypeDiv()}
          {selfPacedRelativeDueWeeksDiv()}
        </>
      )
    }
  }

  const hideAfterDueMessage = () => (
    <div className="d-flex align-items-center">
      <Icon className="mr-1" size="sm" src={HideIcon} />
      <span className="status-hide-after-due-value">
        {isSelfPaced
          ? intl.formatMessage(messages.hiddenAfterEndDate)
          : intl.formatMessage(messages.hiddenAfterDueDate)}
      </span>
    </div>
  )

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
          className="grading-mismatch-alert d-flex align-items-center p-4 shadow text-wrap"
        >
          <Icon className="mr-1 text-warning" size="lg" src={WarningIcon} />
          {intl.formatMessage(messages.gradingPolicyMismatchText, { gradingType })}
        </div>
      )
    } else {
      return null;
    }
  }
  const renderStatusMessages = () => {
    return (
      <>
        {statusMessages.map(({ icon, text }) => (
          <div className="d-flex align-items-center border-top border-light pt-1 mt-2 text-dark">
            <Icon className="mr-1" size="sm" src={icon} />
            {text}
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="text-secondary-400 x-small mb-1">
      {explanatoryMessage ? explanatoryMessageDiv(): isInstructorPaced && releaseStatusDiv()}
      {renderGradingTypeAndDueDate()}
      {hideAfterDue && hideAfterDueMessage()}
      {renderStatusMessages()}
      {renderGradingPolicyAlert()}
    </div>
  )
}

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
    gradingType: PropTypes.string,
    dueDate: PropTypes.string,
    relativeWeeksDue: PropTypes.number,
    isTimeLimited: PropTypes.bool,
    graded: PropTypes.bool,
    courseGraders: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    hideAfterDue: PropTypes.bool,
  })
};

export default XBlockStatus;
