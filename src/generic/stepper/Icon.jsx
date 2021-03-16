import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function Icon({ children, size, className }) {
  return (
    <div
      className={classNames(
        'rounded-circle',
        'small',
        'mr-2',
        'text-white',
        'd-flex',
        'justify-content-center',
        'align-items-center',
        className,
      )}
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

Icon.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.string,
};

Icon.defaultProps = {
  className: null,
  size: '1.3rem',
};
