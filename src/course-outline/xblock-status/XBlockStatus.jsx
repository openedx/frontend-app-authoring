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
};

ReleaseStatus.propTypes = {
  isInstructorPaced: PropTypes.bool.isRequired,
  explanatoryMessage: PropTypes.string,
  releaseDate: PropTypes.string.isRequired,
  releasedToStudents: PropTypes.bool.isRequired,
};

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

const HideAfterDueMessage = ({ isSelfPaced }) => {
  const intl = useIntl();
  return (
    <div className="d-flex align-items-center" data-testid="hide-after-due-message">
      <Icon className="mr-1" size="sm" src={HideIcon} />
      <span className="status-hide-after-due-value">
        {isSelfPaced
          ? intl.formatMessage(messages.hiddenAfterEndDate)
          : intl.formatMessage(messages.hiddenAfterDueDate)}
      </span>
    </div>
  );
};

HideAfterDueMessage.propTypes = {
  isSelfPaced: PropTypes.bool.isRequired,
};

const StatusMessages = ({
  isVertical,
  staffOnlyMessage,
  prereq,
  prereqs,
  userPartitionInfo,
  hasPartitionGroupComponents,
}) => {
  const intl = useIntl();
  const statusMessages = [];

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

StatusMessages.defaultProps = {
  staffOnlyMessage: false,
  prereq: '',
  prereqs: {},
  userPartitionInfo: {},
};

StatusMessages.propTypes = {
  isVertical: PropTypes.bool.isRequired,
  staffOnlyMessage: PropTypes.bool,
  prereq: PropTypes.string,
  prereqs: PropTypes.arrayOf(PropTypes.shape({
    blockUsageKey: PropTypes.string.isRequired,
    blockDisplayName: PropTypes.string.isRequired,
  })),
  userPartitionInfo: PropTypes.shape({
    selectedPartitionIndex: PropTypes.number.isRequired,
    selectedGroupsLabel: PropTypes.string.isRequired,
  }),
  hasPartitionGroupComponents: PropTypes.bool.isRequired,
};

const GradingPolicyAlert = ({
  graded,
  gradingType,
  courseGraders,
}) => {
  const intl = useIntl();

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
        className="d-flex align-items-center p-4 mt-2 rounded shadow bg-warning-100 h4 font-weight-normal text-gray-700"
        data-testid="grading-mismatch-alert"
      >
        <Icon className="mr-1 text-warning" size="lg" src={WarningIcon} />
        {intl.formatMessage(messages.gradingPolicyMismatchText, { gradingType })}
      </div>
    );
  }
  return null;
};

GradingPolicyAlert.defaultProps = {
  graded: false,
  gradingType: '',
};

GradingPolicyAlert.propTypes = {
  graded: PropTypes.bool,
  gradingType: PropTypes.string,
  courseGraders: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

const XBlockStatus = ({
  isSelfPaced,
  isCustomRelativeDatesActive,
  blockData,
}) => {
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
  } = blockData;

  const isInstructorPaced = !isSelfPaced;
  const isVertical = category === COURSE_BLOCK_NAMES.vertical.id;

  return (
    <div className="text-secondary-400 x-small mb-1">
      {!isVertical && (
        <ReleaseStatus
          isInstructorPaced={isInstructorPaced}
          explanatoryMessage={explanatoryMessage}
          releaseDate={releaseDate}
          releasedToStudents={releasedToStudents}
        />
      )}
      {!isVertical && (
        <GradingTypeAndDueDate
          isSelfPaced={isSelfPaced}
          isInstructorPaced={isInstructorPaced}
          isCustomRelativeDatesActive={isCustomRelativeDatesActive}
          isTimeLimited={isTimeLimited}
          isProctoredExam={isProctoredExam}
          isOnboardingExam={isOnboardingExam}
          isPracticeExam={isPracticeExam}
          graded={graded}
          gradingType={gradingType}
          dueDate={dueDate}
          relativeWeeksDue={relativeWeeksDue}
        />
      )}
      {hideAfterDue && (
        <HideAfterDueMessage isSelfPaced={isSelfPaced} />
      )}
      <StatusMessages
        isVertical={isVertical}
        staffOnlyMessage={staffOnlyMessage}
        prereq={prereq}
        prereqs={prereqs}
        userPartitionInfo={userPartitionInfo}
        hasPartitionGroupComponents={hasPartitionGroupComponents}
      />
      <GradingPolicyAlert
        graded={graded}
        gradingType={gradingType}
        courseGraders={courseGraders}
      />
    </div>
  );
};

XBlockStatus.defaultProps = {
  isCustomRelativeDatesActive: false,
};

XBlockStatus.propTypes = {
  isSelfPaced: PropTypes.bool.isRequired,
  isCustomRelativeDatesActive: PropTypes.bool,
  blockData: PropTypes.shape({
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
