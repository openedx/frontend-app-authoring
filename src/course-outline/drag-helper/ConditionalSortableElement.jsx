import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from '@openedx/paragon';
import SortableItem from './SortableItem';

const ConditionalSortableElement = ({
  id,
  category,
  draggable,
  children,
  componentStyle,
}) => {
  const style = {
    background: 'white',
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    borderRadius: '0.35rem',
    boxShadow: '0 0 .125rem rgba(0, 0, 0, .15), 0 0 .25rem rgba(0, 0, 0, .15)',
    ...componentStyle,
  };

  if (draggable) {
    return (
      <SortableItem
        id={id}
        category={category}
        componentStyle={style}
      >
        <Col className="extend-margin px-0">
          {children}
        </Col>
      </SortableItem>
    );
  }
  return (
    <Row
      data-testid="conditional-sortable-element--no-drag-handle"
      style={style}
      className="mx-0"
    >
      <Col className="px-0">
        {children}
      </Col>
    </Row>
  );
};

ConditionalSortableElement.defaultProps = {
  componentStyle: null,
};

ConditionalSortableElement.propTypes = {
  id: PropTypes.string.isRequired,
  draggable: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  componentStyle: PropTypes.shape({}),
};

export default ConditionalSortableElement;
