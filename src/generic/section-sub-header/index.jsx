import React from 'react';
import PropTypes from 'prop-types';

const SectionSubHeader = ({ title, description }) => (
  <header className="section-sub-header">
    <h2 className="lead">{title}</h2>
    <span className="small text-gray-700">{description}</span>
  </header>
);

SectionSubHeader.defaultProps = {
  description: '',
};

SectionSubHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default SectionSubHeader;
