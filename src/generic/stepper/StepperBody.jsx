import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function StepperBody({ children, className }) {
  return (
    <div className={classNames(
      'overflow-auto',
      'flex-grow-1',
      className,
    )}
    >
      {children}
    </div>
  );
}

StepperBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

StepperBody.defaultProps = {
  className: null,
};
