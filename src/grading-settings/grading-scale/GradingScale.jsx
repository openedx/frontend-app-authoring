import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButtonWithTooltip } from '@openedx/paragon';
import { Add as IconAdd } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { GradingScaleHandle, GradingScaleSegment, GradingScaleTicks } from './components';
import messages from './messages';

import { useRanger } from './react-ranger';
import { convertGradeData, MAXIMUM_SCALE_LENGTH } from './utils';

const DEFAULT_GRADE_LETTERS = ['A', 'B', 'C', 'D'];
const getDefaultPassText = intl => intl.formatMessage(messages.defaultPassText);

const GradingScale = ({
  showSavePrompt,
  gradeCutoffs,
  setShowSuccessAlert,
  setGradingData,
  resetDataRef,
  gradeLetters,
  sortedGrades,
  setOverrideInternetConnectionAlert,
  setEligibleGrade,
  defaultGradeDesignations,
}) => {
  const intl = useIntl();
  const [gradingSegments, setGradingSegments] = useState(sortedGrades);
  const [letters, setLetters] = useState(gradeLetters);
  const [convertedResult, setConvertedResult] = useState({});
  const gradingSegmentsValues = Object.values(gradingSegments);
  const eligibleValue = gradingSegmentsValues[gradingSegmentsValues.length - 1];

  useEffect(() => {
    if (resetDataRef.current) {
      setGradingSegments(sortedGrades);
      setLetters(gradeLetters);
      // eslint-disable-next-line no-param-reassign
      resetDataRef.current = false;
    }
  }, [gradeCutoffs]);

  useEffect(() => {
    setGradingSegments(sortedGrades);
    setLetters(gradeLetters);
  }, [sortedGrades.length]);

  useEffect(() => {
    setGradingData(prevData => ({ ...prevData, gradeCutoffs: convertedResult }));
    setEligibleGrade(eligibleValue?.current);
  }, [JSON.stringify(convertedResult)]);

  useEffect(() => {
    convertGradeData(letters, gradingSegments, setConvertedResult);
  }, [gradingSegments, letters]);

  const addNewGradingSegment = () => {
    setGradingSegments((prevSegments) => {
      let updatedGradingSegment = [];
      if (prevSegments.length >= 5) {
        const segSize = MAXIMUM_SCALE_LENGTH / (prevSegments.length + 1);
        updatedGradingSegment = Array.from({
          length: prevSegments.length + 1,
        }).map((_, i) => ({
          current: 100 - i * segSize,
          previous: 100 - (i + 1) * segSize,
        }));
      } else {
        const firstSegment = prevSegments[prevSegments.length - 1];
        const secondSegment = prevSegments[prevSegments.length - 2];
        const newCurrentValue = Math.ceil(
          (secondSegment.current - secondSegment.previous) / 2,
        );

        const newSegment = {
          current: firstSegment.current + newCurrentValue,
          previous: firstSegment.current,
        };

        const updatedSecondSegment = {
          ...secondSegment,
          previous: firstSegment.current + newCurrentValue,
        };
        updatedGradingSegment = [
          ...prevSegments.slice(0, prevSegments.length - 2),
          updatedSecondSegment,
          newSegment,
          firstSegment,
        ];
      }

      showSavePrompt(true);
      setShowSuccessAlert(false);
      setOverrideInternetConnectionAlert(false);
      return updatedGradingSegment;
    });

    const nextIndex = (letters.length % defaultGradeDesignations.length);

    if (gradingSegments.length === 2) {
      setLetters([defaultGradeDesignations[0], defaultGradeDesignations[nextIndex]]);
    } else {
      setLetters(prevLetters => [...prevLetters, defaultGradeDesignations[nextIndex]]);
    }
  };

  const updateGradingSegments = (newGradingSegmentData, activeHandleIndex) => {
    const gapToSegment = 1;
    const sortedSegments = newGradingSegmentData.sort((currentValue, previousValue) => currentValue - previousValue);
    const newSegmentValue = sortedSegments[sortedSegments.length - 1 - activeHandleIndex];
    const prevSegmentBoundary = (gradingSegments[activeHandleIndex + 1]
        && gradingSegments[activeHandleIndex + 1].current) || 0;
    const nextSegmentBoundary = gradingSegments[activeHandleIndex - 1].current;

    showSavePrompt(true);

    setGradingSegments(gradingSegments.map((gradingSegment, idx) => {
      const upperBoundaryValue = (newSegmentValue < nextSegmentBoundary - gapToSegment)
        ? newSegmentValue : (nextSegmentBoundary - gapToSegment);
      const lowerBoundaryValue = (upperBoundaryValue > prevSegmentBoundary + gapToSegment)
        ? upperBoundaryValue : (prevSegmentBoundary + gapToSegment);

      if (idx === activeHandleIndex - 1) {
        return {
          previous: lowerBoundaryValue,
          current: gradingSegment.current,
        };
      }

      if (idx === activeHandleIndex) {
        return {
          current: lowerBoundaryValue,
          previous: gradingSegment.previous,
        };
      }

      return gradingSegment;
    }));
  };

  const removeGradingSegment = (gradingSegmentIndex) => {
    setGradingSegments(prevSegments => {
      const updatedSegments = [...prevSegments];
      const removedSegment = updatedSegments.splice(gradingSegmentIndex - 1, 1)[0];
      const previousSegment = updatedSegments[gradingSegmentIndex - 2];

      if (previousSegment) {
        previousSegment.previous = removedSegment.previous;
      }

      return updatedSegments;
    });

    showSavePrompt(true);
    setShowSuccessAlert(false);
    setOverrideInternetConnectionAlert(false);

    setLetters(prevLetters => {
      const updatedLetters = [...prevLetters];
      updatedLetters.splice(updatedLetters.length - 1, 1);

      return updatedLetters.length === 1 ? [getDefaultPassText(intl)] : updatedLetters;
    });
  };

  const handleLetterChange = (e, idx) => {
    const { value } = e.target;

    showSavePrompt(true);
    setShowSuccessAlert(false);
    setOverrideInternetConnectionAlert(false);

    setLetters(prevLetters => {
      const updatedLetters = [...prevLetters];
      const emptyString = '\u200B';
      updatedLetters[idx - 1] = value || emptyString;

      return updatedLetters;
    });
  };

  const handleSegmentChange = () => {
    setShowSuccessAlert(false);
    setOverrideInternetConnectionAlert(false);
    setGradingData(prevData => ({ ...prevData, gradeCutoffs: convertedResult }));
  };

  const {
    getTrackProps,
    ticks,
    segments,
    handles,
    activeHandleIndex,
  } = useRanger({
    min: 0,
    max: MAXIMUM_SCALE_LENGTH,
    stepSize: 1,
    values: gradingSegments?.map(segment => segment.current),
    onDrag: (segmentDataArray) => updateGradingSegments(segmentDataArray, activeHandleIndex),
    onChange: handleSegmentChange,
  });

  return (
    <div className="grading-scale">
      <IconButtonWithTooltip
        tooltipPlacement="top"
        tooltipContent={intl.formatMessage(messages.addNewSegmentButtonAltText)}
        disabled={gradingSegments.length >= (defaultGradeDesignations.length + 1)}
        data-testid="grading-scale-btn-add-segment"
        className="mr-3"
        src={IconAdd}
        iconAs={Icon}
        alt={intl.formatMessage(messages.addNewSegmentButtonAltText)}
        onClick={addNewGradingSegment}
      />
      <div className="grading-scale-segments-and-ticks" {...getTrackProps()}>
        {ticks.map(({ value, getTickProps }) => (
          <GradingScaleTicks key={value} value={value} getTickProps={getTickProps} />
        ))}
        {segments.reverse().map(({ value, getSegmentProps }, idx = 1) => (
          <GradingScaleSegment
            key={idx}
            getSegmentProps={getSegmentProps}
            removeGradingSegment={removeGradingSegment}
            gradingSegments={gradingSegments}
            value={value}
            idx={idx}
            handleLetterChange={handleLetterChange}
            letters={letters}
          />
        ))}
        {handles.map(({ value, getHandleProps }, idx) => (
          <GradingScaleHandle
            key={value}
            getHandleProps={getHandleProps}
            gradingSegments={gradingSegments}
            value={value}
            idx={idx}
          />
        ))}
      </div>
    </div>
  );
};

GradingScale.propTypes = {
  showSavePrompt: PropTypes.func.isRequired,
  gradeCutoffs: PropTypes.objectOf(PropTypes.number).isRequired,
  gradeLetters: PropTypes.arrayOf(PropTypes.string).isRequired,
  setShowSuccessAlert: PropTypes.func.isRequired,
  setGradingData: PropTypes.func.isRequired,
  setOverrideInternetConnectionAlert: PropTypes.func.isRequired,
  resetDataRef: PropTypes.objectOf(PropTypes.bool).isRequired,
  sortedGrades: PropTypes.arrayOf(
    PropTypes.shape({
      current: PropTypes.number.isRequired,
      previous: PropTypes.number.isRequired,
    }),
  ).isRequired,
  setEligibleGrade: PropTypes.func.isRequired,
  defaultGradeDesignations: PropTypes.arrayOf(PropTypes.string),
};

GradingScale.defaultProps = {
  defaultGradeDesignations: DEFAULT_GRADE_LETTERS,
};

export default GradingScale;
