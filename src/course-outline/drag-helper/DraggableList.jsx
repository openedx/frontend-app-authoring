import React from 'react';
import PropTypes from 'prop-types';

import {
  DndContext,
  DragOverlay,
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
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import DragContextProvider from './DragContextProvider';
import { COURSE_BLOCK_NAMES } from '../constants';

const DraggableList = ({
  courseId,
  items,
  setSections,
  restoreSectionList,
  prevContainerInfo,
  handleSectionDragAndDrop,
  handleSubsectionDragAndDrop,
  handleUnitDragAndDrop,
  moveSubsectionOver,
  moveUnitOver,
  moveSubsection,
  moveUnit,
  helpers,
  children,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [activeId, setActiveId] = React.useState();
  const [overId, setOverId] = React.useState();

  const findItemInfo = (id) => {
    // search id in sections
    const sectionIndex = items.findIndex((section) => section.id === id);
    if (sectionIndex !== -1) {
      return {
        index: sectionIndex,
        item: items[sectionIndex],
        category: COURSE_BLOCK_NAMES.chapter.id,
        parent: "root"
      };
    }

    // search id in subsections
    for (let [index, section] of items.entries()) {
      const subsectionIndex = section.childInfo.children.findIndex((subsection) => subsection.id === id);
      if (subsectionIndex !== -1) {
        return {
          index: subsectionIndex,
          item: section.childInfo.children[subsectionIndex],
          category: COURSE_BLOCK_NAMES.sequential.id,
          parentIndex: index,
          parent: section
        };
      }
    };

    // search id in units
    for (let [index, section] of items.entries()) {
      for (let [subIndex, subsection] of section.childInfo.children.entries()) {
        const unitIndex = subsection.childInfo.children.findIndex((unit) => unit.id === id);
        if (unitIndex !== -1) {
          return {
            index: unitIndex,
            item: subsection.childInfo.children[unitIndex],
            category: COURSE_BLOCK_NAMES.vertical.id,
            parentIndex: subIndex,
            parent: subsection,
            grandParentIndex: index,
            grandParent: section,
          }
        }
      };
    };
    return null;
  }

  const subsectionDragOver = (active, over, activeInfo, overInfo) => {
    if (
      activeInfo.parent.id === overInfo.parent.id
      || activeInfo.parent.id === overInfo.item.id
      || (activeInfo.category === overInfo.category && !overInfo.parent.actions.childAddable)
      || (activeInfo.parent.category === overInfo.category && !overInfo.item.actions.childAddable)
    ) {
      return;
    }
    // Find the new index for the item
    let overSectionIndex;
    let newIndex;
    if (overInfo.category === COURSE_BLOCK_NAMES.chapter.id) {
      // We're at the root droppable of a container
      newIndex = overInfo.item.childInfo.children.length + 1;
      overSectionIndex = overInfo.index;
      setOverId(overInfo.item.id);
    } else {
      const modifier = helpers.isBelowOverItem(active, over) ? 1 : 0;
      newIndex = overInfo.index >= 0 ? overInfo.index + modifier : overInfo.item.childInfo.children.length + 1;
      overSectionIndex = overInfo.parentIndex;
      setOverId(overInfo.parent.id);
    }

    setSections((prev) => {
      const [prevCopy] = moveSubsectionOver(
        [...prev],
        activeInfo.parentIndex,
        activeInfo.index,
        overSectionIndex,
        newIndex,
      );
      return prevCopy;
    });
  }

  const unitDragOver = (active, over, activeInfo, overInfo) => {
    if (
      activeInfo.parent.id === overInfo.parent.id
      || activeInfo.parent.id === overInfo.item.id
      || (activeInfo.category === overInfo.category && !overInfo.parent.actions.childAddable)
      || (activeInfo.parent.category === overInfo.category && !overInfo.item.actions.childAddable)
    ) {
      return;
    }
    let overSubsectionIndex;
    let overSectionIndex;
    // Find the indexes for the items
    let newIndex;
    if (overInfo.category === COURSE_BLOCK_NAMES.sequential.id) {
      // We're at the root droppable of a container
      newIndex = overInfo.item.childInfo.children.length + 1;
      overSubsectionIndex = overInfo.index;
      overSectionIndex = overInfo.parentIndex;
      setOverId(overInfo.item.id);
    } else {
      const modifier = helpers.isBelowOverItem(active, over) ? 1 : 0;
      newIndex = overInfo.index >= 0 ? overInfo.index + modifier : overInfo.item.childInfo.children.length + 1;
      overSubsectionIndex = overInfo.parentIndex;
      overSectionIndex = overInfo.grandParentIndex;
      setOverId(overInfo.parent.id);
    }

    setSections((prev) => {
      const [prevCopy] = moveUnitOver(
        [...prev],
        activeInfo.grandParentIndex,
        activeInfo.parentIndex,
        activeInfo.index,
        overSectionIndex,
        overSubsectionIndex,
        newIndex,
      );
      return prevCopy;
    });
  }

  const handleDragOver = (event) => {
    const { active, over  } = event;
    if (!active || !over) {
      return;
    }
    const { id } = active;
    const { id: overId } = over;

    // Find the containers
    const activeInfo = findItemInfo(id);
    const overInfo = findItemInfo(overId);
    if (!activeInfo || !overInfo) {
      return;
    }
    switch (activeInfo.category) {
      case COURSE_BLOCK_NAMES.sequential.id:
        return subsectionDragOver(active, over, activeInfo, overInfo);
      case COURSE_BLOCK_NAMES.vertical.id:
        return unitDragOver(active, over, activeInfo, overInfo);
      default:
        break;
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) {
      return;
    }
    setActiveId(null);
    setOverId(null);
    const { id } = active;
    const { id: overId } = over;

    const activeInfo = findItemInfo(id);
    const overInfo = findItemInfo(overId);
    if (!activeInfo || !overInfo) {
      return;
    }

    if (
      activeInfo.category !== overInfo.category
      || (activeInfo.parent !== "root" && activeInfo.parentIndex !== overInfo.parentIndex)
    ) {
      return;
    }

    let currentItems = items;
    if (activeInfo.parent !== 'root') {
      currentItems = activeInfo.parent.childInfo.children;
    }
    if (activeInfo.index !== overInfo.index || prevContainerInfo.current) {
      switch (activeInfo.category) {
        case COURSE_BLOCK_NAMES.chapter.id:
          setSections((prev) => {
            const result = arrayMove(prev, activeInfo.index, overInfo.index);
            handleSectionDragAndDrop(result.map(section => section.id), restoreSectionList);
            return result;
          });
          break;
        case COURSE_BLOCK_NAMES.sequential.id:
          setSections((prev) => {
            const [prevCopy, result] = moveSubsection(
              [...prev],
              activeInfo.parentIndex,
              activeInfo.index,
              overInfo.index,
            );
            handleSubsectionDragAndDrop(
              activeInfo.parent.id,
              result.map(subsection => subsection.id),
              restoreSectionList,
            );
            return prevCopy;
          });
          break;
        case COURSE_BLOCK_NAMES.vertical.id:
          setSections((prev) => {
            const [prevCopy, result] = moveUnit(
              [...prev],
              activeInfo.grandParentIndex,
              activeInfo.parentIndex,
              activeInfo.index,
              overInfo.index,
            );
            handleUnitDragAndDrop(
              activeInfo.grandParent.id,
              activeInfo.parent.id,
              result.map(unit => unit.id),
              restoreSectionList,
            );
            return prevCopy;
          });
          break;
      }
    }
  }

  const handleDragStart = (event) => {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  const customClosestCorners = ({active, droppableContainers, droppableRects, ...args}) => {
    const activeCategory = active.data?.current?.category;
    droppableContainers = droppableContainers.filter(
      (container) => {
        switch (activeCategory) {
          case COURSE_BLOCK_NAMES.chapter.id:
            return container.data?.current?.category === activeCategory;
            break;
          case COURSE_BLOCK_NAMES.sequential.id:
            return [activeCategory, COURSE_BLOCK_NAMES.chapter.id].includes(container.data?.current?.category);
            break;
          case COURSE_BLOCK_NAMES.vertical.id:
            return [activeCategory, COURSE_BLOCK_NAMES.sequential.id].includes(container.data?.current?.category);
            break;
          default:
            return true;
            break;
        }
      }
    );
    return closestCorners({active, droppableContainers, droppableRects, ...args});
  }

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
      collisionDetection={customClosestCorners}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <DragContextProvider activeId={activeId} overId={overId}>
        {children}
      </DragContextProvider>
    </DndContext>
  );
};

DraggableList.propTypes = {
  itemList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  })).isRequired,
  setSections: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default DraggableList;
