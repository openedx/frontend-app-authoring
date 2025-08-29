import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import './MetricCard.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SUPPORTED_ICON_CLASSES } from '../../data/constants';
// import { fas } from '@fortawesome/free-solid-svg-icons';

// library.add(fas);

const MetricCard = ({
  icon, value, label, index,
}) => {
  // Define colors based on card position/index
  const getCardStyle = (cardIndex) => {
    const colors = [
      { background: '#ffe4ef', iconBg: '#ff4d92' }, // Pink
      { background: '#fffbe7', iconBg: '#ffb200' }, // Yellow
      { background: '#eaffef', iconBg: '#22c55e' }, // Green
      { background: '#e6f8ff', iconBg: '#1cb0f6' }, // Blue
    ];

    return colors[cardIndex % colors.length];
  };

  const cardStyle = getCardStyle(index || 0);

  return (
    <Card
      className="metric-card-visual"
      style={{ background: cardStyle.background }}
    >
      <div className="metric-card-visual-content">
        <div
          className="metric-card-visual-icon"
          style={{ background: cardStyle.iconBg }}
        >
          {SUPPORTED_ICON_CLASSES.includes(icon) ? (
            <FontAwesomeIcon icon={`${icon}`} />
          ) : (
            <FontAwesomeIcon icon="fas fa-chart-bar" />
          )}
        </div>
        <div className="metric-card-visual-text">
          <div className="metric-card-visual-value">{value}</div>
          <div className="metric-card-visual-label">{label}</div>
        </div>
      </div>
    </Card>
  );
};

MetricCard.propTypes = {
  icon: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  index: PropTypes.number,
};

export default MetricCard;
