import React from 'react';
import PropTypes from 'prop-types';

const EmptyPage = ({
  heading,
  body,
  children,
}) => (
  <div className="empty-sheet-wrapper">
    <div className="empty-content">
      <h3 className="h3">{heading}</h3>
      <h4 className="h4">{body}</h4>
      {children}
    </div>
  </div>
);

EmptyPage.propTypes = {
  heading: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default EmptyPage;
