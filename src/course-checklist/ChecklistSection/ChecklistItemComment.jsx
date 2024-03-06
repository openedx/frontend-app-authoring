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
    <div className="row m-0 mt-4 border-top no-gutters align-items-center" data-identifier="comment">
      <div className="col-1">
        <Icon src={ModeComment} size="lg" />
      </div>
      <div className="col my-4 small">
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

  if (checkId === 'assignmentDeadline') {
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
        <ul>
          {gradedAssignmentsOutsideDateRange.map(assignment => (
            <li className="pr-2" key={assignment.id}>
              <Hyperlink
                content={assignment.displayName}
                destination={outlineUrl}
              />
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
