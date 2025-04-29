import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import './WidgetCard.scss';
import '../Dashboard.scss';

const WidgetCard = ({ title, content }) => (
  <Card className="overview-card">
    <h4 className="card-header">{title}</h4>
    <Card.Section className="card-section">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Card.Section>
  </Card>
);

WidgetCard.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default WidgetCard;
