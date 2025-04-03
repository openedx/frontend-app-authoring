import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from '@edx/frontend-platform/i18n';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionRow, Icon, IconButtonWithTooltip, Stack } from '@openedx/paragon';
import { DragIndicator } from '@openedx/paragon/icons';
import messages from './messages';

const SortableItem = ({
  id,
  componentStyle,
  actions,
  actionStyle,
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
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...componentStyle,
  };

  return (
    <Stack
      ref={setNodeRef}
      style={style}
      className="mx-0"
    >
      <ActionRow style={actionStyle}>
        {actions}
        <IconButtonWithTooltip
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
      </ActionRow>
      {children}
    </Stack>
  );
};
SortableItem.defaultProps = {
  componentStyle: null,
  actions: null,
  actionStyle: null,
};
SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  actionStyle: PropTypes.shape({}),
  componentStyle: PropTypes.shape({}),
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(SortableItem);
