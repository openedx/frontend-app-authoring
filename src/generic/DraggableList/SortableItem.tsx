import React, { KeyboardEventHandler, MouseEventHandler } from 'react';
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
  children?: React.ReactNode,
  actions: React.ReactNode,
  actionStyle?: {},
  componentStyle?: {},
  isClickable?: boolean,
  onClick?: MouseEventHandler,
  onKeyDown?: KeyboardEventHandler,
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
  onKeyDown,
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
      onKeyDown={onKeyDown}
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
