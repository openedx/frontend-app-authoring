import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { verticalSortableListCollisionDetection } from './verticalSortableList';

const DraggableList = ({
  itemList,
  setState,
  updateOrder,
  children,
  renderOverlay,
  activeId,
  setActiveId,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      let updatedArray;
      setState(() => {
        const [activeElement] = itemList.filter(item => item.id === active.id);
        const [overElement] = itemList.filter(item => item.id === over.id);
        const oldIndex = itemList.indexOf(activeElement);
        const newIndex = itemList.indexOf(overElement);
        updatedArray = arrayMove(itemList, oldIndex, newIndex);
        return updatedArray;
      });
      updateOrder()(updatedArray);
    }
    setActiveId?.(null);
  }, [updateOrder, setActiveId]);

  const handleDragStart = useCallback((event) => {
    setActiveId?.(event.active.id);
  }, [setActiveId]);

  const handleDragCancel = useCallback(() => {
    setActiveId?.(null);
  }, [setActiveId]);

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      collisionDetection={verticalSortableListCollisionDetection}
      onDragStart={handleDragStart}
      // autoScroll does not play well with verticalSortableListCollisionDetection strategy
      autoScroll={false}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={itemList}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
      {renderOverlay && createPortal(
        <DragOverlay>
          {renderOverlay(activeId)}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};

DraggableList.defaultProps = {
  renderOverlay: undefined,
  activeId: null,
  setActiveId: () => {},
};

DraggableList.propTypes = {
  itemList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  })).isRequired,
  setState: PropTypes.func.isRequired,
  updateOrder: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  renderOverlay: PropTypes.func,
  activeId: PropTypes.string,
  setActiveId: PropTypes.func,
};

export default DraggableList;
