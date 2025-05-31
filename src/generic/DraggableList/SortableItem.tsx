import React, { MouseEventHandler } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionRow, Card, Icon, IconButtonWithTooltip,
} from '@openedx/paragon';
import { DragIndicator } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

interface SortableItemProps {
  id: string,
  children?: React.ReactNode | null,
  actions: React.ReactNode | null,
  actionStyle?: {},
  componentStyle?: {},
  isClickable?: boolean,
  onClick?: MouseEventHandler,
  disabled?: boolean,
  cardClassName?: string,
}

const SortableItem = ({
  id,
  componentStyle,
  actions,
  actionStyle,
  children,
  isClickable,
  onClick,
  disabled,
  cardClassName = '',
}: SortableItemProps) => {
  const intl = useIntl();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: () => false,
    disabled: {
      draggable: disabled,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 200 : undefined,
    transition,
    ...componentStyle,
  };

  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    <div
      ref={setNodeRef}
      onClick={onClick}
    >
      <Card
        style={style}
        className={`mx-0 ${cardClassName}`}
        isClickable={isClickable}
      >
        <ActionRow style={actionStyle}>
          {actions}
          {!disabled && (
          <IconButtonWithTooltip
            key="drag-to-reorder-icon"
            ref={setActivatorNodeRef}
            tooltipPlacement="top"
            tooltipContent={intl.formatMessage(messages.tooltipContent)}
            src={DragIndicator}
            iconAs={Icon}
            variant="light"
            alt={intl.formatMessage(messages.tooltipContent)}
            {...attributes}
            {...listeners}
          />
          )}
        </ActionRow>
        {children}
      </Card>
    </div>
  );
};

export default SortableItem;
