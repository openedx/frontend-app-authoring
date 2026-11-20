import React from 'react';

import { MAXIMUM_SCALE_LENGTH } from '../utils';

interface RangeSegment {
  previous: number;
  current: number;
}

interface GradingScaleHandleProps {
  idx: number;
  value: number;
  gradingSegments: RangeSegment[];
  getHandleProps: (props: { style: React.CSSProperties; }) => React.ButtonHTMLAttributes<HTMLButtonElement>;
  ariaLabel: string;
  isEditable?: boolean;
}

const GradingScaleHandle = ({
  idx,
  value,
  gradingSegments,
  getHandleProps,
  ariaLabel,
  isEditable = true,
}: GradingScaleHandleProps) => (
  <button
    key={value}
    className="grading-scale-segment-btn-resize"
    type="button"
    aria-label={ariaLabel}
    disabled={!isEditable || gradingSegments[idx].current === MAXIMUM_SCALE_LENGTH}
    {...getHandleProps({
      style: (!isEditable || gradingSegments[idx].current === MAXIMUM_SCALE_LENGTH) ?
        {
          cursor: 'default',
          display: 'none',
        } :
        { cursor: 'e-resize' },
    })}
  />
);

export default GradingScaleHandle;
