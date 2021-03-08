import React from 'react';
import PropTypes from 'prop-types';

export default function StepIcon({ children, size }) {
  return (
    <div
      className="rounded-circle small mr-2 bg-primary text-white d-flex justify-content-center align-items-center"
      style={{
        // TODO: Is there a better way to lock the shape of this thing?
        width: size,
        minWidth: size,
        height: size,
        minHeight: size,
        maxWidth: size,
        maxHeight: size,
      }}
    >
      {children}
    </div>
  );
}

StepIcon.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.string,
};

StepIcon.defaultProps = {
  size: '1.3rem',
};
