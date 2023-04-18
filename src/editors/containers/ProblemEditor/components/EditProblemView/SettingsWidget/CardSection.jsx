import React from 'react';
import { Collapsible, Card } from '@edx/paragon';
import {
  bool, string, node,
} from 'prop-types';

const CardSection = ({
  children, none, isCardCollapsibleOpen, summary,
}) => {
  const show = isCardCollapsibleOpen || summary;
  if (!show) { return null; }

  return (
    <Card.Section>
      <Collapsible.Advanced
        open={!isCardCollapsibleOpen}
      >
        <Collapsible.Body className="collapsible-body">
          <span className={`small ${none ? 'text-gray-500' : 'text-primary-500'}`}>{summary}</span>
        </Collapsible.Body>
      </Collapsible.Advanced>
      <Collapsible.Advanced
        open={isCardCollapsibleOpen}
      >
        <Collapsible.Body className="collapsible-body text-primary-500 x-small">
          {children}
        </Collapsible.Body>
      </Collapsible.Advanced>
    </Card.Section>
  );
};
CardSection.propTypes = {
  none: bool,
  children: node.isRequired,
  summary: string,
  isCardCollapsibleOpen: bool.isRequired,
};
CardSection.defaultProps = {
  none: false,
  summary: null,
};

export default CardSection;
