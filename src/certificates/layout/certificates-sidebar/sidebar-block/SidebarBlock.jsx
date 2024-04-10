import React from 'react';
import PropTypes from 'prop-types';

const SidebarBlock = ({ title, paragraphs, isLast }) => (
  <React.Fragment key={title}>
    <h4 className="help-sidebar-about-title">
      {title}
    </h4>
    {paragraphs.map((text) => (
      <p key={text} className="help-sidebar-about-descriptions">
        {text}
      </p>
    ))}
    {!isLast && <hr />}
  </React.Fragment>
);

SidebarBlock.defaultProps = {
  isLast: false,
};

SidebarBlock.propTypes = {
  title: PropTypes.string.isRequired,
  paragraphs: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ])).isRequired,
  isLast: PropTypes.bool,
};

export default SidebarBlock;
