import { arrayMove } from '@dnd-kit/sortable';

export const dragHelpers = {
  copyBlockChildren: (block) => {
    // eslint-disable-next-line no-param-reassign
    block.childInfo = { ...block.childInfo };
    // eslint-disable-next-line no-param-reassign
    block.childInfo.children = [...block.childInfo.children];
    return block;
  },
  setBlockChildren: (block, children) => {
    // eslint-disable-next-line no-param-reassign
    block.childInfo.children = children;
    return block;
  },
  setBlockChild: (block, child, id) => {
    // eslint-disable-next-line no-param-reassign
    block.childInfo.children[id] = child;
    return block;
  },
  insertChild: (block, child, index) => {
    // eslint-disable-next-line no-param-reassign
    block.childInfo.children = [
      ...block.childInfo.children.slice(0, index),
      child,
      ...block.childInfo.children.slice(index, block.childInfo.children.length),
    ];
    return block;
  },
  isBelowOverItem: (active, over) => over
      && active.rect.current.translated
      && active.rect.current.translated.top
        > over.rect.top + over.rect.height,
};

export const moveSubsectionOver = (
  prevCopy,
  activeSectionIdx,
  activeSubsectionIdx,
  overSectionIdx,
  newIndex,
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
  prevCopy,
  activeSectionIdx,
  activeSubsectionIdx,
  activeUnitIdx,
  overSectionIdx,
  overSubsectionIdx,
  newIndex,
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

export const moveSubsection = (
  prevCopy,
  sectionIdx,
  currentIdx,
  newIdx,
) => {
  let section = dragHelpers.copyBlockChildren({ ...prevCopy[sectionIdx] });

  const result = arrayMove(section.childInfo.children, currentIdx, newIdx);
  section = dragHelpers.setBlockChildren(section, result);

  // eslint-disable-next-line no-param-reassign
  prevCopy[sectionIdx] = section;
  return [prevCopy, result];
};

export const moveUnit = (
  prevCopy,
  sectionIdx,
  subsectionIdx,
  currentIdx,
  newIdx,
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
 * @param {Array} items
 * @returns {(id, step) => bool}
 */
export const canMoveSection = (sections) => (id, step) => {
  const newId = id + step;
  const indexCheck = newId >= 0 && newId < sections.length;
  if (!indexCheck) {
    return false;
  }
  const newItem = sections[newId];
  return newItem.actions.draggable;
};

export const possibleSubsectionMoves = (sections, sectionIndex, section, subsections) => (index, step) => {
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
    // move subsection to last position of previous section
    if (!sections[sectionIndex + step]?.actions?.childAddable) {
      // return if previous section doesn't allow adding subsections
      return {};
    }
    return {
      fn: moveSubsectionOver,
      args: [
        sections,
        sectionIndex,
        index,
        sectionIndex + step,
        sections[sectionIndex + step].childInfo.children.length + 1,
      ],
      sectionId: sections[sectionIndex + step].id,
    };
  } if (step === 1 && index === subsections.length - 1 && sectionIndex < sections.length - 1) {
    // move subsection to first position of next section
    if (!sections[sectionIndex + step]?.actions?.childAddable) {
      // return if next section doesn't allow adding subsections
      return {};
    }
    return {
      fn: moveSubsectionOver,
      args: [
        sections,
        sectionIndex,
        index,
        sectionIndex + step,
        0,
      ],
      sectionId: sections[sectionIndex + step].id,
    };
  }
  return {};
};

export const possibleUnitMoves = (
  sections,
  sectionIndex,
  subsectionIndex,
  section,
  subsection,
  units,
) => (index, step) => {
  if (!units[index].actions.draggable) {
    return {};
  }
  if ((step === -1 && index >= 1) || (step === 1 && units.length - index >= 2)) {
    return {
      fn: moveUnit,
      args: [
        sections,
        sectionIndex,
        subsectionIndex,
        index,
        index + step,
      ],
      sectionId: section.id,
      subsectionId: subsection.id,
    };
  } if (step === -1 && index === 0) {
    if (subsectionIndex > 0) {
      // move unit to last position of previous subsection inside same section.
      if (!sections[sectionIndex].childInfo.children[subsectionIndex + step]?.actions?.childAddable) {
        // return if previous subsection doesn't allow adding subsections
        return {};
      }
      return {
        fn: moveUnitOver,
        args: [
          sections,
          sectionIndex,
          subsectionIndex,
          index,
          sectionIndex,
          subsectionIndex + step,
          sections[sectionIndex].childInfo.children[subsectionIndex + step].childInfo.children.length + 1,
        ],
        sectionId: section.id,
        subsectionId: sections[sectionIndex].childInfo.children[subsectionIndex + step].id,
      };
    } if (sectionIndex > 0) {
      // move unit to last position of previous subsection inside previous section.
      const newSectionIndex = sectionIndex + step;
      if (sections[newSectionIndex].childInfo.children.length === 0) {
        // return if previous section has no subsections.
        return {};
      }
      const newSubsectionIndex = sections[newSectionIndex].childInfo.children.length - 1;
      if (!sections[newSectionIndex].childInfo.children[newSubsectionIndex]?.actions?.childAddable) {
        // return if previous subsection doesn't allow adding subsections
        return {};
      }
      return {
        fn: moveUnitOver,
        args: [
          sections,
          sectionIndex,
          subsectionIndex,
          index,
          newSectionIndex,
          newSubsectionIndex,
          sections[newSectionIndex].childInfo.children[newSubsectionIndex].childInfo.children.length + 1,
        ],
        sectionId: sections[newSectionIndex].id,
        subsectionId: sections[newSectionIndex].childInfo.children[newSubsectionIndex].id,
      };
    }
  } else if (step === 1 && index === units.length - 1) {
    if (subsectionIndex < sections[sectionIndex].childInfo.children.length - 1) {
      // move unit to first position of next subsection inside same section.
      if (!sections[sectionIndex].childInfo.children[subsectionIndex + step]?.actions?.childAddable) {
        // return if next subsection doesn't allow adding subsections
        return {};
      }
      return {
        fn: moveUnitOver,
        args: [
          sections,
          sectionIndex,
          subsectionIndex,
          index,
          sectionIndex,
          subsectionIndex + step,
          0,
        ],
        sectionId: section.id,
        subsectionId: sections[sectionIndex].childInfo.children[subsectionIndex + step].id,
      };
    } if (sectionIndex < sections.length - 1) {
      // move unit to first position of next subsection inside next section.
      const newSectionIndex = sectionIndex + step;
      if (sections[newSectionIndex].childInfo.children.length === 0) {
        // return if next section has no subsections.
        return {};
      }
      const newSubsectionIndex = 0;
      if (!sections[newSectionIndex].childInfo.children[newSubsectionIndex]?.actions?.childAddable) {
        // return if next subsection doesn't allow adding subsections
        return {};
      }
      return {
        fn: moveUnitOver,
        args: [
          sections,
          sectionIndex,
          subsectionIndex,
          index,
          newSectionIndex,
          newSubsectionIndex,
          0,
        ],
        sectionId: sections[newSectionIndex].id,
        subsectionId: sections[newSectionIndex].childInfo.children[newSubsectionIndex].id,
      };
    }
  }
  return {};
};
