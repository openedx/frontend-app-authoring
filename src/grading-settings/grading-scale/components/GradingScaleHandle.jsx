import React from 'react';
import PropTypes from 'prop-types';

import { MAXIMUM_SCALE_LENGTH } from '../utils';

const GradingScaleHandle = ({
  idx, value, gradingSegments, getHandleProps,
}) => (
  <button
    key={value}
    className="grading-scale-segment-btn-resize"
    type="button"
    disabled={gradingSegments[idx].current === MAXIMUM_SCALE_LENGTH}
    {...getHandleProps({
      style: gradingSegments[idx].current === MAXIMUM_SCALE_LENGTH ? {
        cursor: 'default', display: 'none',
      } : { cursor: 'e-resize' },
    })}
  />
);

GradingScaleHandle.propTypes = {
  idx: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  getHandleProps: PropTypes.func.isRequired,
  gradingSegments: PropTypes.arrayOf(
    PropTypes.shape({
      current: PropTypes.number.isRequired,
      previous: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

export default GradingScaleHandle;
