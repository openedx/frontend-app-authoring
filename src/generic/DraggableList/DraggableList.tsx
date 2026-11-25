import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';

import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { verticalSortableListCollisionDetection } from './verticalSortableList';

export interface DraggableListProps<T extends { id: string; }> {
  itemList: T[];
  /** Local mirror of the list; receives the reordered array as an updater. */
  setState: React.Dispatch<React.SetStateAction<T[]>>;
  /** Persists the new order. Called with the same array `setState` produced. */
  updateOrder: () => (list: T[]) => void;
  children: React.ReactNode;
  renderOverlay?: (activeId: string | null) => React.ReactNode;
  activeId?: string | null;
  setActiveId?: (id: string | null) => void;
}

const DraggableList = <T extends { id: string; }>({
  itemList,
  setState,
  updateOrder,
  children,
  renderOverlay,
  activeId = null,
  setActiveId,
}: DraggableListProps<T>) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Computed here, not inside a setState updater: React may run an
      // updater later, during render, and the order must be known now.
      const oldIndex = itemList.findIndex((item) => item.id === active.id);
      const newIndex = itemList.findIndex((item) => item.id === over.id);
      const updatedArray = arrayMove(itemList, oldIndex, newIndex);
      setState(updatedArray);
      updateOrder()(updatedArray);
    }
    setActiveId?.(null);
  }, [itemList, setState, updateOrder, setActiveId]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId?.(String(event.active.id));
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

export default DraggableList;
