import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from '@edx/frontend-platform/i18n';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Col, Icon, Row,
} from '@openedx/paragon';
import { DragIndicator } from '@openedx/paragon/icons';

import messages from './messages';

const SortableItem = ({
  id,
  category,
  isDraggable,
  isDroppable,
  componentStyle,
  children,
  // injected
  intl,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({
    id,
    data: {
      category,
    },
    disabled: {
      draggable: !isDraggable,
      droppable: !isDroppable,
    },
    animateLayoutChanges: () => false,
  });

  const style = {
    position: 'relative',
    zIndex: isDragging ? 200 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
    background: 'white',
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    borderRadius: '0.35rem',
    boxShadow: '0 0 .125rem rgba(0, 0, 0, .15), 0 0 .25rem rgba(0, 0, 0, .15)',
    ...componentStyle,
  };

  return (
    <Row
      ref={setNodeRef}
      style={style}
      className="mx-0"
    >
      <Col className="extend-margin px-0">
        {children}
      </Col>
      {isDraggable && (
        <button
          ref={setActivatorNodeRef}
          key="drag-to-reorder-icon"
          aria-label={intl.formatMessage(messages.tooltipContent)}
          className="btn-icon btn-icon-secondary btn-icon-md"
          type="button"
          {...attributes}
          {...listeners}
        >
          <span className="btn-icon__icon-container">
            <Icon src={DragIndicator} />
          </span>
        </button>
      )}
    </Row>
  );
};

SortableItem.defaultProps = {
  componentStyle: null,
  isDroppable: true,
  isDraggable: true,
};

SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  isDroppable: PropTypes.bool,
  isDraggable: PropTypes.bool,
  children: PropTypes.node.isRequired,
  componentStyle: PropTypes.shape({}),
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(SortableItem);
