import React from 'react';
import PropTypes from 'prop-types';

import { MAXIMUM_SCALE_LENGTH } from '../utils';

const GradingScaleHandle = ({
  idx, value, gradingSegments, getHandleProps, isEditable = true,
}) => (
  <button
    key={value}
    className="grading-scale-segment-btn-resize"
    type="button"
    disabled={!isEditable || gradingSegments[idx].current === MAXIMUM_SCALE_LENGTH}
    {...getHandleProps({
      style: (!isEditable || gradingSegments[idx].current === MAXIMUM_SCALE_LENGTH) ? {
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
  isEditable: PropTypes.bool,
};

export default GradingScaleHandle;
