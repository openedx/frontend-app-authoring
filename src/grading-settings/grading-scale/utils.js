import messages from './messages';

export const MAXIMUM_SCALE_LENGTH = 100;

/**
 * Converting fractional numbers to integers.
 *
 * @param {object} cutoffs - The object containing the settings to grading cutoffs.
 * @returns {array} - Converted grading cutoffs.
 */
export const getGradingValues = (cutoffs) => Object.values(cutoffs)
  .map(number => Math.round(number * MAXIMUM_SCALE_LENGTH));

/**
 * Initially, the data comes in the format { a: 0.8 },
 * this function converts the data structure to the required { current: 100, previous: 80 } format.
 *
 * @param {object} gradeValues - The object containing the settings to grading cutoffs.
 * @returns {object} - New grading cutoffs.
 */
export const getSortedGrades = (gradeValues) => gradeValues.reduce((sortedArray, current, idx) => {
  if (idx === (gradeValues.length - 1)) {
    sortedArray.push({ current: gradeValues[idx - 1] || MAXIMUM_SCALE_LENGTH, previous: gradeValues[idx] });
    sortedArray.push({ current: gradeValues[idx], previous: 0 });
  } else if (idx === 0) {
    sortedArray.push({ current: MAXIMUM_SCALE_LENGTH, previous: current });
  } else {
    const previous = gradeValues[idx - 1];
    sortedArray.push({ current: previous, previous: current });
  }

  return sortedArray;
}, []);

/**
 * Changes the start and end values of the segments when there are two segments.
 *
 * @param {number} idx - Segment index.
 * @param {array} letters - Names of grading segments.
 * @param {array} gradingSegments - Grading cutoffs.
 * @returns {string} - Segment display name.
 */
export const getLettersOnLongScale = (idx, letters, gradingSegments) => {
  const END_OF_SCALE_NAME = 'F';

  if (idx === 0) {
    return letters[0];
  }

  if ((idx - 1) === (gradingSegments.length - 1)) {
    return END_OF_SCALE_NAME;
  }

  return letters[idx - 1];
};

/**
 * Changes the positions of segment names if there are more than two segments.
 *
 * @param {number} idx - Segment index.
 * @param {array} letters - Names of grading segments.
 * @returns {string} - Segment display name.
 */
export const getLettersOnShortScale = (idx, letters, intl) => {
  const END_OF_SCALE_NAME = intl.formatMessage(messages.segmentFailGradingText);

  return (idx === 1 ? letters[idx - 1] : END_OF_SCALE_NAME);
};

/**
 * Converts the data to the original format with fractional numbers { a: 0.8 }.
 *
 * @param {array} letters - Names of grading segments.
 * @param {array} gradingSegments - Grading cutoffs.
 * @param {func} setConvertedResult - Changing the state of the converted result.
 * @returns {void}
 */
export const convertGradeData = (letters, gradingSegments, setConvertedResult) => {
  const convertedData = {};

  if (!gradingSegments.length) {
    return;
  }

  letters.forEach((letter, idx) => {
    convertedData[letter] = gradingSegments[idx].previous / MAXIMUM_SCALE_LENGTH;
  });

  setConvertedResult(convertedData);
};
