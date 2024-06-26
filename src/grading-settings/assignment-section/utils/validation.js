import { DUPLICATE_ASSIGNMENT_NAME } from './enum';

/**
 * Updates the error list for the job and sets the save warning display flag.
 *
 * @param {string} assignmentName - The name of the field being validated.
 * @param {number} assignmentId - Assignment id.
 * @param {string, boolean} assignmentValue - The value of the field being validated.
 * @param {function} setErrorList - Function to update the error list state.
 * @param {function} setShowSavePrompt - Function to update the visibility of the save prompt.
 * @returns {void}
 */
export const updateAssignmentErrorList = (
  assignmentName,
  assignmentId,
  setErrorList,
  setShowSavePrompt,
  assignmentValue = true,
) => {
  setErrorList(prevState => ({ ...prevState, [`${assignmentName}-${assignmentId}`]: assignmentValue }));
  if (assignmentValue) {
    setShowSavePrompt(false);
  }
};

/**
 * Validates assignment fields.
 *
 * @param {number} assignmentId - Assignment id.
 * @param {string} assignmentName - The name of the field being validated.
 * @param {string} assignmentType - The type of the assignment.
 * @param {string} assignmentValue - The value of the field being validated.
 * @param {function} setErrorList - Function to update the error list state.
 * @param {function} setShowSavePrompt - Function to update the visibility of the save prompt.
 * @param {array} courseGraders - An array of existing grading data.
 * @param {number} weightOfTotalGrade - The weight of the assignment.
 * @param {number} assignmentMinCount - The minimum count of the assignment.
 * @param {number} assignmentDropCount - The drop count of the assignment.
 * @returns {void}
 */
export const validationAssignmentFields = (
  assignmentId,
  assignmentName,
  assignmentType,
  assignmentValue,
  setErrorList,
  setShowSavePrompt,
  courseGraders,
  weightOfTotalGrade,
  assignmentMinCount,
  assignmentDropCount,
) => {
  const courseGradingTypes = courseGraders?.map(grade => grade.type);

  switch (assignmentName) {
    case assignmentType:
      if (assignmentValue === '') {
        updateAssignmentErrorList(assignmentName, assignmentId, setErrorList, setShowSavePrompt);
        return;
      }
      if (courseGradingTypes.includes(assignmentValue)) {
        updateAssignmentErrorList(
          assignmentName,
          assignmentId,
          setErrorList,
          setShowSavePrompt,
          DUPLICATE_ASSIGNMENT_NAME,
        );
        return;
      }
      updateAssignmentErrorList(
        assignmentName,
        assignmentId,
        setErrorList,
        setShowSavePrompt,
        false,
      );
      break;
    case weightOfTotalGrade:
      if (assignmentValue < 0 || assignmentValue > 100 || assignmentValue === '-0') {
        updateAssignmentErrorList(
          assignmentName,
          assignmentId,
          setErrorList,
          setShowSavePrompt,
        );
        return;
      }
      updateAssignmentErrorList(
        assignmentName,
        assignmentId,
        setErrorList,
        setShowSavePrompt,
        false,
      );
      break;
    case assignmentMinCount:
      if (assignmentValue <= 0 || assignmentValue === '' || assignmentValue === '-0') {
        updateAssignmentErrorList(
          assignmentName,
          assignmentId,
          setErrorList,
          setShowSavePrompt,
        );
        return;
      }
      updateAssignmentErrorList(
        assignmentName,
        assignmentId,
        setErrorList,
        setShowSavePrompt,
        false,
      );
      break;
    case assignmentDropCount:
      if (assignmentValue < 0 || assignmentValue === '' || assignmentValue === '-0') {
        updateAssignmentErrorList(
          assignmentName,
          assignmentId,
          setErrorList,
          setShowSavePrompt,
        );
        return;
      }
      updateAssignmentErrorList(
        assignmentName,
        assignmentId,
        setErrorList,
        setShowSavePrompt,
        false,
      );
      break;
    default:
      updateAssignmentErrorList(
        assignmentName,
        assignmentId,
        setErrorList,
        setShowSavePrompt,
        false,
      );
  }
};
