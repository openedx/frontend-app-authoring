import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';

const EmptyPage = ({
  heading,
  body,
  children,
}) => (
  <Card orientation="horizontal">
    <Card.Section>
      <h2>{heading}</h2>
      <p>{body}</p>
    </Card.Section>
    <Card.Footer className="justify-content-end">
      {children}
    </Card.Footer>
  </Card>
);

EmptyPage.propTypes = {
  heading: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default EmptyPage;
