import React, { KeyboardEventHandler, MouseEventHandler } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionRow,
  Card,
  Icon,
  IconButtonWithTooltip,
} from '@openedx/paragon';
import { DragIndicator } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

// Data attribute rather than a selector built from the id: the drag layer
// resolves the handle by scanning for this, never by interpolating an id.
const dragHandleAttribute = { 'data-drag-handle': 'true' };

interface SortableItemProps {
  id: string;
  children?: React.ReactNode;
  actions: React.ReactNode;
  actionStyle?: {};
  componentStyle?: {};
  isClickable?: boolean;
  onClick?: MouseEventHandler;
  onKeyDown?: KeyboardEventHandler;
  disabled?: boolean;
  cardClassName?: string;
  /** Accessible name and tooltip of the handle; defaults to the generic text. */
  dragHandleLabel?: string;
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
  dragHandleLabel,
}: SortableItemProps) => {
  const intl = useIntl();
  const handleLabel = dragHandleLabel ?? intl.formatMessage(messages.tooltipContent);
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
              tooltipContent={handleLabel}
              src={DragIndicator}
              iconAs={Icon}
              variant="light"
              alt={handleLabel}
              // Only the handle refuses touch scrolling, so a pointer drag on a
              // touch screen is not cancelled by the browser's scroll gesture;
              // the rest of the card still scrolls the page.
              style={{ touchAction: 'none' }}
              {...dragHandleAttribute}
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
