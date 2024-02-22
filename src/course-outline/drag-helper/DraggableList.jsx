import React from 'react';
import PropTypes from 'prop-types';

import {
  DndContext,
  closestCorners,
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

import { COURSE_BLOCK_NAMES } from '../constants';

const DraggableList = ({
  items,
  setItems,
  updateOrder,
  children,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findContainer = (id, active) => {
    // if id is for a section return container as root
    let sectionIndex = items.findIndex((section) => section.id === id);
    if (sectionIndex !== -1) {
      return active ? ["root"]: [sectionIndex, items[sectionIndex]];
    }
    // if id is for a subsection, return the parent section
    sectionIndex = items.findIndex((section) => section.childInfo.children.find((subsection) => subsection.id === id));
    if (sectionIndex !== -1) {
      return [sectionIndex, items[sectionIndex]];
    }
    let subsectionIndex;
    // if id is for an unit, return the parent subsection
    items.forEach((section, index) => {
      subsectionIndex = section.childInfo.children.findIndex(
        (subsection) => subsection.childInfo.children.find((unit) => unit.id === id)
      );
      if (subsectionIndex !== -1) {
        return [subsectionIndex, sectionp[subsectionIndex], index];
      }
    });
    return [-1];
  }

  function handleDragOver(event) {
    const { active, over  } = event;
    const { id } = active;
    const { id: overId } = over;

    // Find the containers
    const [activeContainerIdx, activeContainer, activeContainerParentIdx] = findContainer(id, true);
    const [overContainerIdx, overContainer, overContainerParentIdx] = findContainer(overId, false);

    if (
      activeContainerIdx === -1 ||
      overContainerIdx === -1 ||
      activeContainerIdx === "root" ||
      activeContainer.id === overContainer.id ||
      activeContainer.category !== overContainer.category
    ) {
      // __AUTO_GENERATED_PRINTF_START__
      console.log("DraggableList#handleDragOver#if 1"); // __AUTO_GENERATED_PRINTF_END__
      return;
    }

    setItems((prev) => {
      if (activeContainer.category === COURSE_BLOCK_NAMES.chapter.id) {
        const activeItems = prev[activeContainerIdx].childInfo.children;
        const overItems = prev[overContainerIdx].childInfo.children;
        // Find the indexes for the items
        const activeIndex = activeItems.findIndex((subsection) => subsection.id === id);
        const overIndex = overItems.findIndex((subsection) => subsection.id === overId);
        let newIndex;
        if (overId === overContainer.id) {
          // We're at the root droppable of a container
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
              active.rect.current.translated &&
              active.rect.current.translated.top >
                over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }
        const prevCopy = [ ...prev ];
        const activeSection = { ...prevCopy[activeContainerIdx] };
        const overSection = { ...prev[overContainerIdx] };
        overSection.childInfo = { ...overSection.childInfo };
        overSection.childInfo.children = [
          ...overSection.childInfo.children.slice(0, newIndex),
          activeSection.childInfo.children[activeIndex],
          ...overSection.childInfo.children.slice(newIndex, overSection.childInfo.children.length)
        ]
        activeSection.childInfo = { ...activeSection.childInfo };
        activeSection.childInfo.children = activeSection.childInfo.children.filter((item) => item.id !== id);
        prevCopy[activeContainerIdx] = activeSection;
        prevCopy[overContainerIdx] = overSection;
        return prevCopy;
      }
    });
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const { id } = active;
    const { id: overId } = over;

    const [activeContainerIdx, activeContainer, activeContainerParentIdx] = findContainer(id, true);
    const [overContainerIdx, overContainer, overContainerParentIdx] = findContainer(overId, false);

    if (
      activeContainerIdx === -1 ||
      overContainerIdx === -1 ||
      (activeContainerIdx !== 'root' &&
          activeContainer?.id !== overContainer?.id)
    ) {
      // __AUTO_GENERATED_PRINTF_START__
      console.log("DraggableList#handleDragEnd#if 1"); // __AUTO_GENERATED_PRINTF_END__
      return;
    }

    let activeItems = items;
    let overItems = items;
    if (activeContainerIdx !== 'root') {
      activeItems = items[activeContainerIdx].childInfo.children;
      overItems = items[overContainerIdx].childInfo.children;
    }
    const activeIndex = activeItems.findIndex((item) => item.id === id);
    let overIndex = overItems.findIndex((item) => item.id === overId);
    if (overIndex === -1) {
      overIndex = overContainerIdx
    }

    if (activeIndex !== overIndex) {
      if (activeContainerIdx === 'root') {
        setItems((prev) => arrayMove(prev, activeIndex, overIndex));
      } else {
        setItems((prev) => {
          const prevCopy = [ ...prev ];
          const overSection = { ...prev[overContainerIdx] };
          overSection.childInfo = { ...overSection.childInfo };
          overSection.childInfo.children = arrayMove(overSection.childInfo.children, activeIndex, overIndex);
          prevCopy[overContainerIdx] = overSection;
          return prevCopy;
        });
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      {children}
    </DndContext>
  );
};

DraggableList.propTypes = {
  itemList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  })).isRequired,
  setItems: PropTypes.func.isRequired,
  updateOrder: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default DraggableList;
