import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import React, { ChangeEvent } from 'react';
import messages from '../messages';

import { getLettersOnLongScale, getLettersOnShortScale } from '../utils';

interface RangeSegment {
  previous: number,
  current: number,
}

interface GradingScaleSegmentProps {
  idx: number,
  value: number,
  getSegmentProps: () => { [key: string]: string },
  handleLetterChange: (event: ChangeEvent, idx: number) => void,
  letters: [string],
  gradingSegments: RangeSegment[],
  removeGradingSegment: (idx: number) => void,
}

const GradingScaleSegment = ({
  idx,
  value,
  getSegmentProps,
  handleLetterChange,
  letters,
  gradingSegments,
  removeGradingSegment,
}: GradingScaleSegmentProps) => {
  const intl = useIntl();
  const prevValue = gradingSegments[idx === 0 ? 0 : idx - 1]?.previous ?? 0;
  const segmentRightMargin = (value - prevValue) < 6 ? '0.125rem' : '1.25rem';
  return (
    <div
      key={value}
      className={`grading-scale-segment segment-${idx - 1}`}
      data-testid="grading-scale-segment"
      {...getSegmentProps()}
    >
      <div
        className="grading-scale-segment-content"
        style={{
          marginRight: segmentRightMargin,
        }}
      >
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
        <span data-testid="grading-scale-segment-number" className="grading-scale-segment-content-number m-0">
          {gradingSegments[idx === 0 ? 0 : idx - 1]?.previous} - {value === 100 ? value : value - 1}
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
};

export default GradingScaleSegment;
