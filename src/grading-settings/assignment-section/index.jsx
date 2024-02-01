import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { CheckCircle, Warning } from '@openedx/paragon/icons';

import AlertMessage from '../../generic/alert-message';
import { validationAssignmentFields } from './utils/validation';
import AssignmentItem from './assignments/AssignmentItem';
import AssignmentTypeName from './assignments/AssignmentTypeName';
import { defaultAssignmentsPropTypes, ASSIGNMENT_TYPES } from './utils/enum';
import messages from './messages';

const MIN_NUMBER_VALUE = 0;
const MAX_NUMBER_VALUE = 100;

const AssignmentSection = ({
  intl,
  handleRemoveAssignment,
  setShowSavePrompt,
  graders,
  setGradingData,
  courseAssignmentLists,
  setShowSuccessAlert,
}) => {
  const [errorList, setErrorList] = useState({});
  const {
    type, weight, minCount, dropCount,
  } = ASSIGNMENT_TYPES;
  const isFieldsWithoutErrors = Object.values(errorList).every(field => field !== true);

  if (!isFieldsWithoutErrors) {
    setShowSavePrompt(false);
  }

  const handleAssignmentChange = (e, assignmentId) => {
    const { name, value, type: inputType } = e.target;

    let inputValue = value;
    if (inputType === 'number') {
      inputValue = parseInt(value, 10);
    }

    setShowSavePrompt(true);

    setGradingData(prevState => ({
      ...prevState,
      graders: graders.map(grader => {
        if (grader.id === assignmentId) {
          return { ...grader, [name]: inputValue };
        }
        return grader;
      }),
    }));

    validationAssignmentFields(
      assignmentId,
      name,
      type,
      value,
      setErrorList,
      setShowSavePrompt,
      graders,
      weight,
      minCount,
      dropCount,
    );
    setShowSuccessAlert(false);
  };

  return (
    <div className="assignment-items">
      {graders?.map((gradeField) => {
        const courseAssignmentUsage = courseAssignmentLists[gradeField.type];
        const showDefinedCaseAlert = gradeField.minCount !== courseAssignmentUsage?.length
            && Boolean(courseAssignmentUsage?.length);
        const showNotDefinedCaseAlert = !courseAssignmentUsage?.length && Boolean(gradeField.type);

        return (
          <div key={gradeField.id} className="course-grading-assignment-wrapper mb-4">
            <ol className="course-grading-assignment-items p-0 mb-4">
              <AssignmentTypeName
                value={gradeField.type}
                errorEffort={errorList[`${type}-${gradeField.id}`]}
                onChange={(e) => handleAssignmentChange(e, gradeField.id)}
              />
              <AssignmentItem
                className="course-grading-assignment-abbreviation"
                title={intl.formatMessage(messages.abbreviationTitle)}
                descriptions={intl.formatMessage(messages.abbreviationDescription)}
                type="text"
                name="shortLabel"
                value={gradeField.shortLabel}
                onChange={(e) => handleAssignmentChange(e, gradeField.id)}
              />
              <AssignmentItem
                className="course-grading-assignment-total-grade"
                title={intl.formatMessage(messages.weightOfTotalGradeTitle)}
                descriptions={intl.formatMessage(messages.weightOfTotalGradeDescription)}
                type="number"
                min={MIN_NUMBER_VALUE}
                max={MAX_NUMBER_VALUE}
                errorMsg={intl.formatMessage(messages.weightOfTotalGradeErrorMessage)}
                name={weight}
                value={gradeField.weight}
                onChange={(e) => handleAssignmentChange(e, gradeField.id)}
                errorEffort={errorList[`${weight}-${gradeField.id}`]}
                trailingElement="%"
              />
              <AssignmentItem
                className="course-grading-assignment-total-number"
                title={intl.formatMessage(messages.totalNumberTitle)}
                descriptions={intl.formatMessage(messages.totalNumberDescription)}
                type="number"
                min={1}
                errorMsg={intl.formatMessage(messages.totalNumberErrorMessage)}
                name={minCount}
                value={gradeField.minCount}
                onChange={(e) => handleAssignmentChange(e, gradeField.id)}
                errorEffort={errorList[`${minCount}-${gradeField.id}`]}
              />
              <AssignmentItem
                className="course-grading-assignment-number-droppable"
                title={intl.formatMessage(messages.numberOfDroppableTitle)}
                descriptions={intl.formatMessage(messages.numberOfDroppableDescription)}
                type="number"
                min={MIN_NUMBER_VALUE}
                errorMsg={intl.formatMessage(messages.numberOfDroppableErrorMessage)}
                name={dropCount}
                gradeField={gradeField}
                value={gradeField.dropCount}
                onChange={(e) => handleAssignmentChange(e, gradeField.id)}
                secondErrorMsg={intl.formatMessage(messages.numberOfDroppableSecondErrorMessage, {
                  type: gradeField.type,
                })}
                errorEffort={errorList[`${dropCount}-${gradeField.id}`]}
              />
            </ol>
            {showDefinedCaseAlert && (
              <AlertMessage
                className="course-grading-assignment-item-alert-warning"
                variant="warning"
                icon={Warning}
                title={intl.formatMessage(messages.assignmentAlertWarningUsageTitle, { type: gradeField.type })}
                description={(
                  <>
                    <span className="course-grading-assignment-item-alert-warning-list-label">
                      {courseAssignmentUsage.length} Final assignment(s) found:
                    </span>
                    <ol className="course-grading-assignment-item-alert-warning-list">
                      {courseAssignmentUsage.map(assignmentItem => (
                        <li key={assignmentItem}>{assignmentItem}</li>
                      ))}
                    </ol>
                  </>
                )}
                aria-hidden="true"
              />
            )}
            {showNotDefinedCaseAlert && (
              <AlertMessage
                className="course-grading-assignment-item-alert-warning"
                variant="warning"
                icon={Warning}
                title={intl.formatMessage(messages.assignmentAlertWarningTitle, { type: gradeField.type })}
                description={(
                  <span className="course-grading-assignment-item-alert-warning-list-label">
                    {intl.formatMessage(messages.assignmentAlertWarningDescription)}
                  </span>
                )}
                aria-hidden="true"
              />
            )}
            {gradeField.minCount === courseAssignmentUsage?.length && (
              <AlertMessage
                className="course-grading-assignment-item-alert-success"
                variant="success"
                icon={CheckCircle}
                title={intl.formatMessage(messages.assignmentAlertWarningSuccess, { type: gradeField.type })}
                aria-hidden="true"
              />
            )}
            <Button
              className="course-grading-assignment-delete-btn"
              variant="outline-primary"
              size="sm"
              onClick={() => handleRemoveAssignment(gradeField.id)}
            >
              {intl.formatMessage(messages.assignmentDeleteButton)}
            </Button>
          </div>
        );
      })}
    </div>
  );
};

AssignmentSection.defaultProps = {
  courseAssignmentLists: undefined,
  graders: undefined,
};

AssignmentSection.propTypes = {
  intl: intlShape.isRequired,
  handleRemoveAssignment: PropTypes.func.isRequired,
  setGradingData: PropTypes.func.isRequired,
  setShowSavePrompt: PropTypes.func.isRequired,
  setShowSuccessAlert: PropTypes.func.isRequired,
  courseAssignmentLists: PropTypes.shape(defaultAssignmentsPropTypes),
  graders: PropTypes.arrayOf(
    PropTypes.shape(defaultAssignmentsPropTypes),
  ),
};

export default injectIntl(AssignmentSection);
