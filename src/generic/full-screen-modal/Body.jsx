import React from 'react';
import PropTypes from 'prop-types';

export default function Body({ children }) {
  return (
    <div className="flex-grow-1 overflow-auto">
      {children}
    </div>
  );
}

Body.propTypes = {
  children: PropTypes.node.isRequired,
};
