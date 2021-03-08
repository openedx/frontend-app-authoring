import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function Stepper({ children, className }) {
  return (
    <div
      className={classNames(
        'd-flex',
        'flex-column',
        className,
      )}
    >
      {children}
    </div>
  );
}

Stepper.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Stepper.defaultProps = {
  className: null,
};
