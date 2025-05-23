import React from 'react';
import PropTypes from 'prop-types';
import { Card, Icon } from '@openedx/paragon';
import './MetricCard.scss';

const MetricCard = ({ icon, value, label, type }) => (
  <Card className={`metric-card-visual metric-card-${type}`}>
    <div className="metric-card-visual-content">
      <div className="metric-card-visual-icon">
        <Icon src={icon} />
      </div>
      <div className="metric-card-visual-text">
        <div className="metric-card-visual-value">{value}</div>
        <div className="metric-card-visual-label">{label}</div>
      </div>
    </div>
  </Card>
);

MetricCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['courses', 'students', 'enrollments', 'submissions']).isRequired,
};

export default MetricCard;
