import React from 'react';
import PropTypes from 'prop-types';

const AnimatedBorderCard = ({ children, className = '', ...props }) => {
  return (
    <div className={`animated-border ${className}`} {...props}>
      {children}
    </div>
  );
};

AnimatedBorderCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default AnimatedBorderCard;
