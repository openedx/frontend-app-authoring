import { Active, Over } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { XBlock } from '@src/data/types';
import { findIndex, findLastIndex } from 'lodash';

export const dragHelpers = {
  copyBlockChildren: (block: XBlock) => {
    // eslint-disable-next-line no-param-reassign
    block.childInfo = { ...block.childInfo };
    // eslint-disable-next-line no-param-reassign
    block.childInfo.children = [...block.childInfo.children];
    return block;
  },
  setBlockChildren: (block: XBlock, children: XBlock[]) => {
    // eslint-disable-next-line no-param-reassign
    block.childInfo.children = children;
    return block;
  },
  setBlockChild: (block: XBlock, child: XBlock, id: number) => {
    // eslint-disable-next-line no-param-reassign
    block.childInfo.children[id] = child;
    return block;
  },
  insertChild: (block: XBlock, child: XBlock, index: number) => {
    // eslint-disable-next-line no-param-reassign
    block.childInfo.children = [
      ...block.childInfo.children.slice(0, index),
      child,
      ...block.childInfo.children.slice(index, block.childInfo.children.length),
    ];
    return block;
  },
  isBelowOverItem: (active: Active, over: Over) => over
      && active.rect.current.translated
      && active.rect.current.translated.top
        > over.rect.top + over.rect.height,
};

/**
  * This function moves a subsection from one section to another in the copy of blocks.
  * It updates the copy with the new positions for the sections and their subsections,
  * while keeping other sections intact.
*/
export const moveSubsectionOver = (
  prevCopy: XBlock[],
  activeSectionIdx: number,
  activeSubsectionIdx: number,
  overSectionIdx: number,
  newIndex: number,
) => {
  let activeSection = dragHelpers.copyBlockChildren({ ...prevCopy[activeSectionIdx] });
  let overSection = dragHelpers.copyBlockChildren({ ...prevCopy[overSectionIdx] });
  const subsection = activeSection.childInfo.children[activeSubsectionIdx];

  overSection = dragHelpers.insertChild(overSection, subsection, newIndex);

  activeSection = dragHelpers.setBlockChildren(
    activeSection,
    activeSection.childInfo.children.filter((item) => item.id !== subsection.id),
  );

  // eslint-disable-next-line no-param-reassign
  prevCopy[activeSectionIdx] = activeSection;
  // eslint-disable-next-line no-param-reassign
  prevCopy[overSectionIdx] = overSection;
  return [prevCopy, overSection.childInfo.children];
};

export const moveUnitOver = (
  prevCopy: XBlock[],
  activeSectionIdx: number,
  activeSubsectionIdx: number,
  activeUnitIdx: number,
  overSectionIdx: number,
  overSubsectionIdx: number,
  newIndex: number,
) => {
  const activeSection = dragHelpers.copyBlockChildren({ ...prevCopy[activeSectionIdx] });
  let activeSubsection = dragHelpers.copyBlockChildren(
    { ...activeSection.childInfo.children[activeSubsectionIdx] },
  );

  let overSection = { ...prevCopy[overSectionIdx] };
  if (overSection.id === activeSection.id) {
    overSection = activeSection;
  }

  overSection = dragHelpers.copyBlockChildren(overSection);
  let overSubsection = dragHelpers.copyBlockChildren(
    { ...overSection.childInfo.children[overSubsectionIdx] },
  );

  const unit = activeSubsection.childInfo.children[activeUnitIdx];
  overSubsection = dragHelpers.insertChild(overSubsection, unit, newIndex);
  overSection = dragHelpers.setBlockChild(overSection, overSubsection, overSubsectionIdx);

  activeSubsection = dragHelpers.setBlockChildren(
    activeSubsection,
    activeSubsection.childInfo.children.filter((item) => item.id !== unit.id),
  );

  // eslint-disable-next-line no-param-reassign
  prevCopy[activeSectionIdx] = dragHelpers.setBlockChild(activeSection, activeSubsection, activeSubsectionIdx);
  // eslint-disable-next-line no-param-reassign
  prevCopy[overSectionIdx] = overSection;
  return [prevCopy, overSubsection.childInfo.children];
};

/**
  * Handles dragging and dropping a subsection within the same section.
*/
export const moveSubsection = (
  prevCopy: XBlock[],
  sectionIdx: number,
  currentIdx: number,
  newIdx: number,
) => {
  let section = dragHelpers.copyBlockChildren({ ...prevCopy[sectionIdx] });

  const result = arrayMove(section.childInfo.children, currentIdx, newIdx);
  section = dragHelpers.setBlockChildren(section, result);

  // eslint-disable-next-line no-param-reassign
  prevCopy[sectionIdx] = section;
  return [prevCopy, result];
};

export const moveUnit = (
  prevCopy: XBlock[],
  sectionIdx: number,
  subsectionIdx: number,
  currentIdx: number,
  newIdx: number,
) => {
  let section = dragHelpers.copyBlockChildren({ ...prevCopy[sectionIdx] });
  let subsection = dragHelpers.copyBlockChildren({ ...section.childInfo.children[subsectionIdx] });

  const result = arrayMove(subsection.childInfo.children, currentIdx, newIdx);
  subsection = dragHelpers.setBlockChildren(subsection, result);
  section = dragHelpers.setBlockChild(section, subsection, subsectionIdx);

  // eslint-disable-next-line no-param-reassign
  prevCopy[sectionIdx] = section;
  return [prevCopy, result];
};

/**
 * Check if section can be moved by given step.
 * Inner function returns false if the new index after moving by given step
 * is out of bounds of item length.
 * If it is within bounds, returns draggable flag of the item in the new index.
 * This helps us avoid moving the item to a position of unmovable item.
 */
export const canMoveSection = (sections: XBlock[]) => (id: number, step: number) => {
  const newId = id + step;
  const indexCheck = newId >= 0 && newId < sections.length;
  if (!indexCheck) {
    return false;
  }
  const newItem = sections[newId];
  return newItem.actions.draggable;
};

/**
  * Checks if a user can move a specific subsection within its parent section or other sections.
  * It ensures that the new position for the subsection is valid and that it's not
  * attempting to drag an unmovable item or beyond the bounds of existing sections.
*/
export const possibleSubsectionMoves = (
  sections: XBlock[],
  sectionIndex: number,
  section: XBlock,
  subsections: string | any[],
) => (index: number, step: number) => {
  if (!subsections[index]?.actions?.draggable) {
    return {};
  }
  if ((step === -1 && index >= 1) || (step === 1 && subsections.length - index >= 2)) {
    // move subsection inside its own parent section
    return {
      fn: moveSubsection,
      args: [
        sections,
        sectionIndex,
        index,
        index + step,
      ],
      sectionId: section.id,
    };
  } if (step === -1 && index === 0 && sectionIndex > 0) {
    // find a section that accepts children above/before the current section
    const newSectionIndex = findLastIndex(sections, { actions: { childAddable: true } }, sectionIndex + step);
    if (newSectionIndex === -1) {
      // return if previous section doesn't allow adding subsections
      return {};
    }
    return {
      fn: moveSubsectionOver,
      args: [
        sections,
        sectionIndex,
        index,
        newSectionIndex,
        sections[newSectionIndex].childInfo.children.length + 1,
      ],
      sectionId: sections[newSectionIndex].id,
    };
  } if (step === 1 && index === subsections.length - 1 && sectionIndex < sections.length + step) {
    // find a section that accepts children below/after the current section
    const newSectionIndex = findIndex(sections, { actions: { childAddable: true } }, sectionIndex + 1);
    // move subsection to first position of next section
    if (newSectionIndex === -1) {
      // return if below sections don't allow adding subsections
      return {};
    }
    return {
      fn: moveSubsectionOver,
      args: [
        sections,
        sectionIndex,
        index,
        newSectionIndex,
        0,
      ],
      sectionId: sections[newSectionIndex].id,
    };
  }
  return {};
};

/**
  * Function to find the valid subsection index based on the current position and the step.
  * It uses the provided find method.
*/
const findValidSubsectionIndex = (
  sections: XBlock[],
  sectionIndex: number,
  step: number,
  findMethod: typeof findLastIndex | typeof findIndex,
): {
  newSectionIndex: number;
  newSubsectionIndex: number
} | null => {
  if (sectionIndex + step < 0) {
    return null;
  }
  const newSectionIndex = findMethod(
    sections,
    { actions: { childAddable: true } },
    sectionIndex + step,
  );

  if (newSectionIndex === -1 || sections[newSectionIndex].childInfo.children.length === 0) {
    return null;
  }

  const newSubsectionIndex = findMethod(
    sections[newSectionIndex].childInfo.children,
    { actions: { childAddable: true } },
  );

  return newSubsectionIndex === -1
    ? null
    : { newSectionIndex, newSubsectionIndex };
};

/**
 * Moves a unit to a previous location within the XBlock structure.  This function attempts to move the unit
 * to the previous subsection within the same section, and if that fails, it will attempt to move it to the
 * previous section.
*/
const moveToPreviousLocation = (
  sections: XBlock[],
  sectionIndex: number,
  subsectionIndex: number,
  index: number,
) => {
  if (subsectionIndex > 0) {
    // Find the previous childAddable subsection within the same section
    const newSubsectionIndex = findLastIndex(
      sections[sectionIndex].childInfo.children,
      { actions: { childAddable: true } },
      subsectionIndex - 1,
    );

    // If found a valid subsection within the same section
    if (newSubsectionIndex !== -1) {
      return {
        fn: moveUnitOver,
        args: [
          sections,
          sectionIndex,
          subsectionIndex,
          index,
          sectionIndex,
          newSubsectionIndex,
          sections[sectionIndex].childInfo.children[newSubsectionIndex].childInfo.children.length,
        ],
        sectionId: sections[sectionIndex].id,
        subsectionId: sections[sectionIndex].childInfo.children[newSubsectionIndex].id,
      };
    }
  }

  // Try moving to previous section
  const previousLocationResult = findValidSubsectionIndex(sections, sectionIndex, -1, findLastIndex);

  if (!previousLocationResult) {
    return {};
  }

  return {
    fn: moveUnitOver,
    args: [
      sections,
      sectionIndex,
      subsectionIndex,
      index,
      previousLocationResult.newSectionIndex,
      previousLocationResult.newSubsectionIndex,
      sections[previousLocationResult.newSectionIndex]
        .childInfo.children[previousLocationResult.newSubsectionIndex]
        .childInfo.children.length,
    ],
    sectionId: sections[previousLocationResult.newSectionIndex].id,
    subsectionId: sections[previousLocationResult.newSectionIndex]
      .childInfo.children[previousLocationResult.newSubsectionIndex].id,
  };
};

/**
 * This function attempts to move a unit to the next childAddable subsection within the current section.
 * If no such subsection exists, it will attempt to move the unit to the next section.
*/
const moveToNextLocation = (
  sections: XBlock[],
  sectionIndex: number,
  subsectionIndex: number,
  index: number,
) => {
  // Find the next childAddable subsection within the same section
  const subsections = sections[sectionIndex].childInfo.children;
  if (subsectionIndex < (subsections.length - 1)) {
    const newSubsectionIndex = findIndex(
      subsections,
      { actions: { childAddable: true } },
      subsectionIndex + 1,
    );

    // If found a valid subsection within the same section
    if (newSubsectionIndex !== -1) {
      return {
        fn: moveUnitOver,
        args: [
          sections,
          sectionIndex,
          subsectionIndex,
          index,
          sectionIndex,
          newSubsectionIndex,
          0,
        ],
        sectionId: sections[sectionIndex].id,
        subsectionId: subsections[newSubsectionIndex].id,
      };
    }
  }

  // Try moving to next section
  const nextLocationResult = findValidSubsectionIndex(sections, sectionIndex, 1, findIndex);

  if (!nextLocationResult) {
    return {};
  }

  return {
    fn: moveUnitOver,
    args: [
      sections,
      sectionIndex,
      subsectionIndex,
      index,
      nextLocationResult.newSectionIndex,
      nextLocationResult.newSubsectionIndex,
      0,
    ],
    sectionId: sections[nextLocationResult.newSectionIndex].id,
    subsectionId: sections[nextLocationResult.newSectionIndex]
      .childInfo.children[nextLocationResult.newSubsectionIndex].id,
  };
};

/**
  * Checks if a user can move a specific unit within all subsections
  * It ensures that the new position for the unit is valid and that it's not
  * attempting to drag an unmovable item or beyond the bounds of existing subsections and sections.
*/
export const possibleUnitMoves = (
  sections: XBlock[],
  sectionIndex: number,
  subsectionIndex: number,
  section: XBlock,
  subsection: XBlock,
  units: XBlock[],
) => (index: number, step: number) => {
  // Early return if unit is not draggable
  if (!units[index]?.actions?.draggable) {
    return {};
  }

  // Move within current subsection
  if ((step === -1 && index >= 1) || (step === 1 && units.length - index >= 2)) {
    return {
      fn: moveUnit,
      args: [sections, sectionIndex, subsectionIndex, index, index + step],
      sectionId: section.id,
      subsectionId: subsection.id,
    };
  }

  // Move to previous subsection/section
  if (step === -1 && index === 0) {
    return moveToPreviousLocation(sections, sectionIndex, subsectionIndex, index);
  }

  // Move to next subsection/section
  if (step === 1 && index === units.length - 1) {
    return moveToNextLocation(sections, sectionIndex, subsectionIndex, index);
  }

  return {};
};
