import React from 'react'
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import {
  Check as CheckIcon,
  AccessTime as ClockIcon,
  CalendarMonth as CalendarIcon,
  HideSource as HideIcon,
  Lock as LockIcon,
  Groups as GroupsIcon,
  Warning as WarningIcon,
} from '@edx/paragon/icons';

import messages from './messages';

const XBlockStatus = () => {
  const intl = useIntl();
  const isSelfPaced = pacing === 'self_paced';
  const isInstructorPaced = pacing === 'instructor';
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
        prereqDisplayName = p.blockDisplayName;
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
    } else if (hasPartitionGroupComments && category === COURSE_BLOCK_NAMES.vertical.id) {
      statusMessages.push({
        icon: GroupsIcon,
        text: intl.formatMessage(messages.restrictedUnitAccessToSomeContent),
      });
    }
  }

  const releaseStatusDiv = () => (
    <div className="release-status">
      <p>
        <span className="sr status-release-label">
          {intl.formatMessage(message.releaseStatusScreenReaderTitle)}
        </span>
        <span className="status-release-value">
          <Icon src={ClockIcon} />
          {intl.formatMessage(releaseLabel)}
          {releaseDate && releaseDate}
        </span>
      </p>
    </div>
  )

  const gradingTypeDiv = () => (
    <>
      <span className="sr status-grading-label">
        {intl.formatMessage(messages.gradedAsScreenReaderLabel)}
      </span>
      <Icon src={CheckIcon} />
      <span className="status-grading-value">
        {gradingType}
      </span>
    </>
  )

  const dueDateDiv = () => (
    {dueDate && isInstructorPaced && (
      <span className="status-grading-date">
        {intl.formatMessage(messages.dueLabel)} {dueDate}
      </span>
    )}
  )

  const selfPacedRelativeDueWeeksDiv = () => (
    <div className="status-grading">
      <p>
        <Icon src={CalendarIcon} />
        <span className="status-custom-grading-date">
          {intl.formatMessage(messages.customDueDateLabel, { relativeWeeks })}
        </span>
      </p>
    </div>
  )

  const explanatoryMessageDiv = () => (
    <div className="explanatory-message">
      <p className="text-secondary-400 x-small mb-1">{explanatoryMessage}</p>
    </div>
  )

  const renderGradingTypeAndDueDate = () => {
    const showRelativeWeeks = isSelfPaced && isCustomRelativeDatesActive && relativeWeeksDue;
    if (isTimeLimited) {
      return (
        <>
          <div className="status-timed-proctored-exam">
            <p>
              {gradingTypeDiv()}
              -
              <span className="sr status-proctored-exam-label">{intl.formatMessage(examValue)}</span>
              <span className="status-proctored-exam-value">{intl.formatMessage(examValue)}</span>
              {dueDateDiv()}
            </p>
          </div>
          {showRelativeWeeks && (selfPacedRelativeDueWeeksDiv())}
        </>
      )
    } else if ((dueDate && !isSelfPaced) || graded) {
      return (
        <>
          <div className="status-grading">
            {gradingTypeDiv()}
            {dueDateDiv()}
          </div>
          {showRelativeWeeks && (selfPacedRelativeDueWeeksDiv())}
        </>
      )
    } else if (showRelativeWeeks) {
      return (
        <>
          <div className="status-grading">
            {gradingTypeDiv()}
          </div>
          {selfPacedRelativeDueWeeksDiv()}
        </>
      )
    }
  }

  const hideAfterDueMessage = () => (
    <div class="status-hide-after-due">
      <p>
        <Icon src={HideIcon} />
        <span className="status-hide-after-due-value">
          {isSelfPaced
            ? intl.formatMessage(message.hiddenAfterEndDate)
            : intl.formatMessage(message.hiddenAfterDueDate)}
        </span>
      </p>
    </div>
  )

  const renderStatusMessages = () => {
    let gradingPolicyMismatch = false;
    if (graded) {
      if (gradingType) {
        gradingPolicyMismatch = (
          course_graders.filter((cg) => cg.toLowerCase() === gradingType.toLowerCase())
        ).length === 0;
      }
    }

    return (
      <div className="status-messages">
        {statusMessages.map(({ icon, text }) => (
          <div className="status-message">
            <Icon src={icon} />
            <p className="status-message-copy">{text}</p>
          </div>
        )}
        {gradingPolicyMismatch && (
          <div className="status-message has-warnings">
            <p className="text-warning">
              <Icon src={WarningIcon} />
              {intl.formatMessage(messages.gradingPolicyMismatchText, { gradingType })}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    {explanatoryMessage ? explanatoryMessageDiv(): releaseStatusDiv()}
    {isInstructorPaced && releaseStatusDiv()}
    {renderGradingTypeAndDueDate()}
    {hideAfterDue && hideAfterDueMessage()}
  )
}

XBlockStatus.defaultProps = {
  explanatoryMessage: '',
};

XBlockStatus.propTypes = {
  category: PropTypes.string.isRequired,
  explanatoryMessage: PropTypes.string,
  pacing: PropTypes.string.isRequired,
};

export default XBlockStatus;
