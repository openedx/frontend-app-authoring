import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { StepperContext } from './StepperContext';

export default function Footer({ children, className }) {
  const { isAtBottom } = useContext(StepperContext);
  return (
    <div
      className={classNames(
        'bg-white',
        'p-2',
        // position-relative raises this div to a higher 'layer' so that its drop shadow falls
        // above the content in the div with our content.
        'position-relative',
        'w-100',
        'border-top',
        'border-light',
        className,
      )}
      style={{
        boxShadow: isAtBottom ? null : '0 -0.25rem 0.5rem rgba(0, 0, 0, 0.3)',
      }}
    >
      {children}
    </div>
  );
}

Footer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Footer.defaultProps = {
  className: null,
};
