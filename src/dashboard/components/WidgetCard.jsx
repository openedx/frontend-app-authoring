import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import DOMPurify from 'dompurify';
import './WidgetCard.scss';

const WidgetCard = ({ title, content, styles }) => (
  <Card className="overview-card">
    <h4 className="card-header">{title}</h4>
    <Card.Section className="card-section">
      {styles && <style dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(styles) }} />}
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
    </Card.Section>
  </Card>
);

WidgetCard.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  styles: PropTypes.string,
};

export default WidgetCard;
