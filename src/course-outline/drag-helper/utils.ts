import { Active, Over } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { XBlock } from '@src/data/types';
import { findIndex, findLastIndex } from 'lodash';

/**
 * Move function signature — accepts sections array followed by numeric indices.
 * Returns [modifiedSections, movedChildren].
 */
export type MoveFn = (prevCopy: XBlock[], ...args: number[]) => [XBlock[], XBlock[]];

/**
 * Move details discriminated by presence of subsectionId.
 * - SubsectionMoveDetails: no subsectionId (moving subsections within/across sections)
 * - UnitMoveDetails: has subsectionId (moving units within/across subsections)
 */
export type SubsectionMoveDetails = {
  fn: MoveFn;
  args: [XBlock[], ...number[]];
  sectionId: string;
  subsectionId?: undefined;
};

export type UnitMoveDetails = {
  fn: MoveFn;
  args: [XBlock[], ...number[]];
  sectionId: string;
  subsectionId: string;
};

export type MoveDetails = SubsectionMoveDetails | UnitMoveDetails;

export const dragHelpers = {
  copyBlockChildren: (block: XBlock) => {
    // eslint-disable-next-line no-param-reassign
    block.childInfo = { ...block.childInfo };
    // eslint-disable-next-line no-param-reassign
    block.childInfo.children = [...(block.childInfo.children || [])];
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
  isBelowOverItem: (active: Active, over: Over) =>
    over
    && active.rect.current.translated
    && active.rect.current.translated.top
      > over.rect.top + over.rect.height,
};

/**
 * Move an item (subsection or unit) across sections/subsections.
 * 5 arguments = subsection cross‑section move.
 * 7 arguments = unit cross‑subsection move.
 */
export const moveItemOver = (
  prevCopy: XBlock[],
  // Shared:
  parentAIdx: number, // section index of the source
  childAIdx: number, // subsection index (source) — or active unit index for unit variant
  // Subsection variant (5 args): targetSectionIdx
  // Unit variant (7 args): activeUnitIdx
  midArg: number,
  // Subsection variant (5 args): newIndex
  // Unit variant (7 args): overSectionIdx
  lastArg: number,
  // Unit only:
  overSubsectionIdx?: number,
  newIndex?: number,
): [XBlock[], XBlock[]] => {
  // Subsection across sections — 5 positional args
  if (overSubsectionIdx === undefined) {
    let activeSection = dragHelpers.copyBlockChildren({ ...prevCopy[parentAIdx] });
    let overSection = dragHelpers.copyBlockChildren({ ...prevCopy[midArg] }); // midArg = targetSectionIdx
    const item = activeSection.childInfo.children[childAIdx];
    overSection = dragHelpers.insertChild(overSection, item, lastArg); // lastArg = newIndex
    activeSection = dragHelpers.setBlockChildren(
      activeSection,
      activeSection.childInfo.children.filter((i) => i.id !== item.id),
    );
    // eslint-disable-next-line no-param-reassign
    prevCopy[parentAIdx] = activeSection;
    // eslint-disable-next-line no-param-reassign
    prevCopy[midArg] = overSection;
    return [prevCopy, overSection.childInfo.children];
  }
  // Unit across subsections — 7 positional args
  const activeSection = dragHelpers.copyBlockChildren({ ...prevCopy[parentAIdx] });
  let activeSubsection = dragHelpers.copyBlockChildren(
    { ...activeSection.childInfo.children[childAIdx] },
  );
  let overSection = { ...prevCopy[lastArg] }; // lastArg = overSectionIdx
  if (overSection.id === activeSection.id) { overSection = activeSection; }
  overSection = dragHelpers.copyBlockChildren(overSection);
  let overSubsection = dragHelpers.copyBlockChildren(
    { ...overSection.childInfo.children[overSubsectionIdx] },
  );
  const unit = activeSubsection.childInfo.children[midArg]; // midArg = activeUnitIdx
  overSubsection = dragHelpers.insertChild(overSubsection, unit, newIndex!);
  overSection = dragHelpers.setBlockChild(overSection, overSubsection, overSubsectionIdx);
  activeSubsection = dragHelpers.setBlockChildren(
    activeSubsection,
    activeSubsection.childInfo.children.filter((i) => i.id !== unit.id),
  );
  // eslint-disable-next-line no-param-reassign
  prevCopy[parentAIdx] = dragHelpers.setBlockChild(activeSection, activeSubsection, childAIdx);
  // eslint-disable-next-line no-param-reassign
  prevCopy[lastArg] = overSection;
  return [prevCopy, overSubsection.childInfo.children];
};

/**
 * Move an item within its parent container.
 * 4 arguments = subsection within‑section move.
 * 5 arguments = unit within‑subsection move.
 */
export const moveItem = (
  prevCopy: XBlock[],
  sectionIdx: number,
  // Subsection: currentIdx
  // Unit: subsectionIdx
  midArg: number,
  // Subsection: newIdx
  // Unit: currentIdx
  otherArg: number,
  // Unit only:
  newIdx?: number,
): [XBlock[], XBlock[]] => {
  if (newIdx === undefined) {
    // Subsection within section
    let section = dragHelpers.copyBlockChildren({ ...prevCopy[sectionIdx] });
    const result = arrayMove(section.childInfo.children, midArg, otherArg);
    section = dragHelpers.setBlockChildren(section, result);
    // eslint-disable-next-line no-param-reassign
    prevCopy[sectionIdx] = section;
    return [prevCopy, result];
  }
  // Unit within subsection
  let section = dragHelpers.copyBlockChildren({ ...prevCopy[sectionIdx] });
  let subsection = dragHelpers.copyBlockChildren({ ...section.childInfo.children[midArg] }); // midArg = subsectionIdx
  const result = arrayMove(subsection.childInfo.children, otherArg, newIdx); // otherArg = currentIdx
  subsection = dragHelpers.setBlockChildren(subsection, result);
  section = dragHelpers.setBlockChild(section, subsection, midArg);
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
  if (id === -1) {
    // id is -1 when the section's position in the list is unknown (e.g. index prop is undefined),
    // which is passed as a sentinel value via `index ?? -1` at the call site.
    return false;
  }
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
  subsections: XBlock[],
): ((index: number, step: number) => SubsectionMoveDetails | null) =>
(index: number, step: number) => {
  if (!subsections[index]?.actions?.draggable) {
    return null;
  }
  if ((step === -1 && index >= 1) || (step === 1 && subsections.length - index >= 2)) {
    // move subsection inside its own parent section
    return {
      fn: moveItem,
      args: [
        sections,
        sectionIndex,
        index,
        index + step,
      ],
      sectionId: section.id,
    };
  }
  if (step === -1 && index === 0 && sectionIndex > 0) {
    // find a section that accepts children above/before the current section
    const newSectionIndex = findLastIndex(sections, { actions: { childAddable: true } }, sectionIndex + step);
    if (newSectionIndex === -1) {
      // return if previous section doesn't allow adding subsections
      return null;
    }
    return {
      fn: moveItemOver,
      args: [
        sections,
        sectionIndex,
        index,
        newSectionIndex,
        sections[newSectionIndex].childInfo.children.length + 1,
      ],
      sectionId: sections[newSectionIndex].id,
    };
  }
  if (step === 1 && index === subsections.length - 1 && sectionIndex < sections.length + step) {
    // find a section that accepts children below/after the current section
    const newSectionIndex = findIndex(sections, { actions: { childAddable: true } }, sectionIndex + 1);
    // move subsection to first position of next section
    if (newSectionIndex === -1) {
      // return if below sections don't allow adding subsections
      return null;
    }
    return {
      fn: moveItemOver,
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
  return null;
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
  newSubsectionIndex: number;
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
): UnitMoveDetails | null => {
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
        fn: moveItemOver,
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
    return null;
  }

  return {
    fn: moveItemOver,
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
): UnitMoveDetails | null => {
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
        fn: moveItemOver,
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
    return null;
  }

  return {
    fn: moveItemOver,
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
): ((index: number, step: number) => UnitMoveDetails | null) =>
(index: number, step: number) => {
  // Early return if unit is not draggable
  if (!units[index]?.actions?.draggable) {
    return null;
  }

  // Move within current subsection
  if ((step === -1 && index >= 1) || (step === 1 && units.length - index >= 2)) {
    return {
      fn: moveItem,
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

  return null;
};
