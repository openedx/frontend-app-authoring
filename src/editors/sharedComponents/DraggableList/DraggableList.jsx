import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {createPortal} from 'react-dom';

import {
  DndContext,
  closestCenter,
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

const DraggableList = ({
  itemList,
  setState,
  updateOrder,
  children,
  renderOverlay,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [activeId, setActiveId] = useState(null);

  const handleDragEnd = (event) => {
    setActiveId(null);
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
  };

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
        document.body
      )}
    </DndContext>
  );
};

DraggableList.defaultProps = {
  overlayComponent: undefined,
}

DraggableList.propTypes = {
  itemList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  })).isRequired,
  setState: PropTypes.func.isRequired,
  updateOrder: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  renderOverlay: PropTypes.func,
};

export default DraggableList;
