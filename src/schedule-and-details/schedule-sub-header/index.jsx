import React from 'react';
import PropTypes from 'prop-types';

const ScheduleSubHeader = ({ title, description }) => (
  <header className="section-header">
    <h2 className="lead">{title}</h2>
    <span className="small text-gray-700">{description}</span>
  </header>
);

ScheduleSubHeader.defaultProps = {
  description: '',
};

ScheduleSubHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default ScheduleSubHeader;
