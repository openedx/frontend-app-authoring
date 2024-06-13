import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, FormattedNumber } from '@edx/frontend-platform/i18n';
import { Hyperlink, Icon } from '@openedx/paragon';
import { ModeComment } from '@openedx/paragon/icons';
import messages from './messages';

const ChecklistItemComment = ({
  checkId,
  outlineUrl,
  data,
}) => {
  const commentWrapper = (comment) => (
    <div className="row m-0 mt-3 pt-3 border-top align-items-center" data-identifier="comment">
      <div className="mr-4">
        <Icon src={ModeComment} size="lg" style={{ height: '32px', width: '32px' }} />
      </div>
      <div className="small">
        {comment}
      </div>
    </div>
  );

  if (checkId === 'gradingPolicy') {
    const sumOfWeights = data?.grades.sumOfWeights || 0;
    const showGradingCommentSection = Object.keys(data).length > 0 && sumOfWeights !== 1;

    const weightSumPercentage = (sumOfWeights * 100).toFixed(2);
    const comment = (
      <FormattedMessage
        {...messages.gradingPolicyComment}
        values={{
          percent: (
            <FormattedNumber
              maximumFractionDigits={2}
              minimumFractionDigits={2}
              value={weightSumPercentage}
            />
          ),
        }}
      />
    );
    return (showGradingCommentSection ? (
      commentWrapper(comment)
    ) : null);
  }

  if (checkId === 'assignmentDeadlines') {
    const showDeadlinesCommentSection = Object.keys(data).length > 0
    && (
      data.assignments.assignmentsWithDatesBeforeStart.length > 0
      || data?.assignments.assignmentsWithDatesAfterEnd.length > 0
      || data?.assignments.assignmentsWithOraDatesBeforeStart.length > 0
      || data?.assignments.assignmentsWithOraDatesAfterEnd.length > 0
    );

    const allGradedAssignmentsOutsideDateRange = [].concat(
      data?.assignments.assignmentsWithDatesBeforeStart,
      data?.assignments.assignmentsWithDatesAfterEnd,
      data?.assignments.assignmentsWithOraDatesBeforeStart,
      data?.assignments.assignmentsWithOraDatesAfterEnd,
    );

    // de-dupe in case one assignment has multiple violations
    const assignmentsMap = new Map();
    allGradedAssignmentsOutsideDateRange.forEach(
      (assignment) => { assignmentsMap.set(assignment.id, assignment); },
    );
    const gradedAssignmentsOutsideDateRange = [];
    assignmentsMap.forEach(
      (value) => {
        gradedAssignmentsOutsideDateRange.push(value);
      },
    );

    const comment = (
      <>
        <FormattedMessage {...messages.assignmentDeadlinesComment} />
        <ul className="assignment-list">
          {gradedAssignmentsOutsideDateRange.map(assignment => (
            <li className="assignment-list-item" key={assignment.id}>
              <Hyperlink destination={`${outlineUrl}#${assignment.id}`}>
                {assignment.displayName}
              </Hyperlink>
            </li>
          ))}
        </ul>
      </>
    );
    return (showDeadlinesCommentSection ? (
      commentWrapper(comment)
    ) : null);
  }

  return null;
};

ChecklistItemComment.propTypes = {
  checkId: PropTypes.string.isRequired,
  outlineUrl: PropTypes.string.isRequired,
  data: PropTypes.oneOfType([
    PropTypes.shape({
      grades: PropTypes.shape({
        sumOfWeights: PropTypes.number,
      }),
    }).isRequired,
    PropTypes.shape({
      assignments: PropTypes.shape({
        totalNumber: PropTypes.number,
        totalVisible: PropTypes.number,
        /* eslint-disable react/forbid-prop-types */
        assignmentsWithDatesBeforeStart: PropTypes.array,
        assignmentsWithDatesAfterEnd: PropTypes.array,
        assignmentsWithOraDatesBeforeStart: PropTypes.array,
        assignmentsWithOraDatesAfterEnd: PropTypes.array,
        /* eslint-enable react/forbid-prop-types */
      }),
    }).isRequired,
  ]).isRequired,
};

export default injectIntl(ChecklistItemComment);
