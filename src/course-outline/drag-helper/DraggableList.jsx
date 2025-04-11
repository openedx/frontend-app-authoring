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
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import DragContextProvider from './DragContextProvider';
import { COURSE_BLOCK_NAMES } from '../../constants';
import {
  moveSubsectionOver,
  moveUnitOver,
  moveSubsection,
  moveUnit,
  dragHelpers,
} from './utils';

const DraggableList = ({
  items,
  setSections,
  restoreSectionList,
  handleSectionDragAndDrop,
  handleSubsectionDragAndDrop,
  handleUnitDragAndDrop,
  children,
}) => {
  const prevContainerInfo = React.useRef();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [activeId, setActiveId] = React.useState();
  const [currentOverId, setCurrentOverId] = React.useState();

  const findItemInfo = (id) => {
    // search id in sections
    const sectionIndex = items.findIndex((section) => section.id === id);
    if (sectionIndex !== -1) {
      return {
        index: sectionIndex,
        item: items[sectionIndex],
        category: COURSE_BLOCK_NAMES.chapter.id,
        parent: 'root',
      };
    }

    // search id in subsections
    for (let index = 0; index < items.length; index++) {
      const section = items[index];
      const subsectionIndex = section.childInfo.children.findIndex((subsection) => subsection.id === id);
      if (subsectionIndex !== -1) {
        return {
          index: subsectionIndex,
          item: section.childInfo.children[subsectionIndex],
          category: COURSE_BLOCK_NAMES.sequential.id,
          parentIndex: index,
          parent: section,
        };
      }
    }

    // search id in units
    for (let index = 0; index < items.length; index++) {
      const section = items[index];
      for (let subIndex = 0; subIndex < section.childInfo.children.length; subIndex++) {
        const subsection = section.childInfo.children[subIndex];
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
          };
        }
      }
    }
    return null;
  };

  // For reasons unknown, onDragEnd is not being triggered by dnd-kit while
  // testing drag over functions. The main functions responsible to move units
  // & subsections across parents are already tested as part of move blocks by
  // index in CourseOutline.test.jsx, just these functions which determine the
  // new index and parent are ignored.
  // See https://github.com/openedx/frontend-app-course-authoring/pull/859#discussion_r1519199622
  // for more details.
  /* istanbul ignore next */
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
      setCurrentOverId(overInfo.item.id);
    } else {
      const modifier = dragHelpers.isBelowOverItem(active, over) ? 1 : 0;
      newIndex = overInfo.index >= 0 ? overInfo.index + modifier : overInfo.item.childInfo.children.length + 1;
      overSectionIndex = overInfo.parentIndex;
      setCurrentOverId(overInfo.parent.id);
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
    if (prevContainerInfo.current === null || prevContainerInfo.current === undefined) {
      prevContainerInfo.current = activeInfo.parent.id;
    }
  };

  /* istanbul ignore next */
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
      setCurrentOverId(overInfo.item.id);
    } else {
      const modifier = dragHelpers.isBelowOverItem(active, over) ? 1 : 0;
      newIndex = overInfo.index >= 0 ? overInfo.index + modifier : overInfo.item.childInfo.children.length + 1;
      overSubsectionIndex = overInfo.parentIndex;
      overSectionIndex = overInfo.grandParentIndex;
      setCurrentOverId(overInfo.parent.id);
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
    if (prevContainerInfo.current === null || prevContainerInfo.current === undefined) {
      prevContainerInfo.current = activeInfo.grandParent.id;
    }
  };

  /* istanbul ignore next */
  const handleDragOver = (event) => {
    const { active, over } = event;
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
        subsectionDragOver(active, over, activeInfo, overInfo);
        break;
      case COURSE_BLOCK_NAMES.vertical.id:
        unitDragOver(active, over, activeInfo, overInfo);
        break;
      default:
        break;
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) {
      return;
    }
    setActiveId(null);
    setCurrentOverId(null);
    const { id } = active;
    const { id: overId } = over;

    const activeInfo = findItemInfo(id);
    const overInfo = findItemInfo(overId);
    if (!activeInfo || !overInfo) {
      return;
    }

    if (
      activeInfo.category !== overInfo.category
      || (activeInfo.parent !== 'root' && activeInfo.parentIndex !== overInfo.parentIndex)
    ) {
      return;
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
              prevContainerInfo.current,
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
              prevContainerInfo.current,
              activeInfo.parent.id,
              result.map(unit => unit.id),
              restoreSectionList,
            );
            return prevCopy;
          });
          break;
        default:
          break;
      }
      prevContainerInfo.current = null;
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  };

  const customClosestCorners = ({
    active, droppableContainers, droppableRects, ...args
  }) => {
    const activeCategory = active.data?.current?.category;
    const filteredContainers = droppableContainers.filter(
      (container) => {
        switch (activeCategory) {
          case COURSE_BLOCK_NAMES.chapter.id:
            return container.data?.current?.category === activeCategory;
          case COURSE_BLOCK_NAMES.sequential.id:
            return [activeCategory, COURSE_BLOCK_NAMES.chapter.id].includes(container.data?.current?.category);
          case COURSE_BLOCK_NAMES.vertical.id:
            return [activeCategory, COURSE_BLOCK_NAMES.sequential.id].includes(container.data?.current?.category);
          default:
            return true;
        }
      },
    );
    return closestCorners({
      active, droppableContainers: filteredContainers, droppableRects, ...args,
    });
  };

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
      collisionDetection={customClosestCorners}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <DragContextProvider activeId={activeId} overId={currentOverId}>
        {children}
      </DragContextProvider>
    </DndContext>
  );
};

DraggableList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    childInfo: PropTypes.shape({
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          childInfo: PropTypes.shape({
            children: PropTypes.arrayOf(
              PropTypes.shape({
                id: PropTypes.string.isRequired,
              }),
            ).isRequired,
          }).isRequired,
        }),
      ).isRequired,
    }).isRequired,
  })).isRequired,
  setSections: PropTypes.func.isRequired,
  restoreSectionList: PropTypes.func.isRequired,
  handleSectionDragAndDrop: PropTypes.func.isRequired,
  handleSubsectionDragAndDrop: PropTypes.func.isRequired,
  handleUnitDragAndDrop: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default DraggableList;
