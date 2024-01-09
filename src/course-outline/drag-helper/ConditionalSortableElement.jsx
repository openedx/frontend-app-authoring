import React from 'react';
import PropTypes from 'prop-types';
import { Row } from '@edx/paragon';
import { SortableItem } from '@edx/frontend-lib-content-components';

const ConditionalSortableElement = ({
  id,
  draggable,
  children,
  componentStyle,
}) => {
  if (draggable) {
    return (
      <SortableItem
        id={id}
        componentStyle={componentStyle}
      >
        <div className="extend-margin">
          {children}
        </div>
      </SortableItem>
    );
  }
  return (
    <Row
      data-testid="conditional-sortable-element--no-drag-handle"
      style={componentStyle}
      className="mx-0"
    >
      {children}
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
