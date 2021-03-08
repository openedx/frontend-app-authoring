import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function StepperFooter({ children, className }) {
  return (
    <div
      className={classNames(
        'bg-white',
        'p-2',
        // position-relative raises this div to a higher 'layer' so that its drop shadow falls
        // above the content in the div with our content.
        'position-relative',
        'w-100',
        className,
      )}
      style={{
        boxShadow: '0 -0.25rem 0.5rem rgba(0, 0, 0, 0.3)',
      }}
    >
      {children}
    </div>
  );
}

StepperFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

StepperFooter.defaultProps = {
  className: null,
};
