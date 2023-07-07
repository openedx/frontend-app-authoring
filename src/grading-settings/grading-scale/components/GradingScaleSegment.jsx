import { Button } from '@edx/paragon';
import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { getLettersOnLongScale, getLettersOnShortScale } from '../utils';
import messages from '../messages';

const GradingScaleSegment = ({
  intl,
  idx,
  value,
  getSegmentProps,
  handleLetterChange,
  letters,
  gradingSegments,
  removeGradingSegment,
}) => (
  <div
    key={value}
    className={`grading-scale-segment segment-${idx - 1}`}
    data-testid="grading-scale-segment"
    {...getSegmentProps()}
  >
    <div className="grading-scale-segment-content">
      {gradingSegments.length === 2 && (
        <input
          className="grading-scale-segment-content-title m-0"
          data-testid="grading-scale-segment-input"
          value={getLettersOnShortScale(idx, letters, intl)}
          onChange={e => handleLetterChange(e, idx)}
          disabled={idx === gradingSegments.length}
        />
      )}
      {gradingSegments.length > 2 && (
        <input
          className="grading-scale-segment-content-title m-0"
          data-testid="grading-scale-segment-input"
          value={getLettersOnLongScale(idx, letters, gradingSegments)}
          onChange={e => handleLetterChange(e, idx)}
          disabled={idx === gradingSegments.length}
        />
      )}
      <span className="grading-scale-segment-content-number m-0">
        {gradingSegments[idx === 0 ? 0 : idx - 1]?.previous} - {value}
      </span>
    </div>
    {idx !== gradingSegments.length && idx - 1 !== 0 && (
      <Button
        variant="link"
        size="inline"
        className="grading-scale-segment-btn-remove"
        data-testid="grading-scale-btn-remove"
        type="button"
        onClick={() => removeGradingSegment(idx)}
      >
        {intl.formatMessage(messages.removeSegmentButtonText)}
      </Button>
    )}
  </div>
);

GradingScaleSegment.propTypes = {
  intl: intlShape.isRequired,
  idx: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  getSegmentProps: PropTypes.func.isRequired,
  handleLetterChange: PropTypes.func.isRequired,
  removeGradingSegment: PropTypes.func.isRequired,
  gradingSegments: PropTypes.arrayOf(
    PropTypes.shape({
      current: PropTypes.number.isRequired,
      previous: PropTypes.number.isRequired,
    }),
  ).isRequired,
  letters: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default injectIntl(GradingScaleSegment);
