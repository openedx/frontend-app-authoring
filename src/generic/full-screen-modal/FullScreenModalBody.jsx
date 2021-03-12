import React from 'react';
import PropTypes from 'prop-types';

export default function FullScreenModalBody({ children }) {
  return (
    <div className="flex-grow-1 overflow-auto">
      {children}
    </div>
  );
}

FullScreenModalBody.propTypes = {
  children: PropTypes.node.isRequired,
};
