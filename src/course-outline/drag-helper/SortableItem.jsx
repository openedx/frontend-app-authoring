import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from '@edx/frontend-platform/i18n';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon, IconButtonWithTooltip, Row } from '@openedx/paragon';
import { DragIndicator } from '@openedx/paragon/icons';

import messages from './messages';

const SortableItem = ({
  id,
  category,
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
    setActivatorNodeRef,
  } = useSortable({
    id,
    data: {
      category,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...componentStyle,
  };

  return (
    <Row
      ref={setNodeRef}
      style={style}
      className="mx-0"
    >
      {children}
      <IconButtonWithTooltip
        ref={setActivatorNodeRef}
        key="drag-to-reorder-icon"
        tooltipPlacement="top"
        tooltipContent={intl.formatMessage(messages.tooltipContent)}
        src={DragIndicator}
        iconAs={Icon}
        variant="secondary"
        alt={intl.formatMessage(messages.tooltipContent)}
        {...attributes}
        {...listeners}
      />
    </Row>
  );
};
SortableItem.defaultProps = {
  componentStyle: null,
};
SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  componentStyle: PropTypes.shape({}),
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(SortableItem);
