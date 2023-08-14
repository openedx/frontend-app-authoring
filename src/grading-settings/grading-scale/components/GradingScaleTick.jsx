import React from 'react';
import PropTypes from 'prop-types';

const GradingScaleTick = ({ getTickProps, value }) => (
  <div className="mt-5 grading-scale-tick" data-testid="grading-scale-tick" {...getTickProps()}>
    <div className="grading-scale-tick-number">{value}</div>
  </div>
);

GradingScaleTick.propTypes = {
  value: PropTypes.number.isRequired,
  getTickProps: PropTypes.func.isRequired,
};

export default GradingScaleTick;
