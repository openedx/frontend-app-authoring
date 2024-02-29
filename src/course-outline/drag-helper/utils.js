import { arrayMove } from '@dnd-kit/sortable';

export const dragHelpers = {
  copyBlockChildren: (block) => {
    block.childInfo = { ...block.childInfo };
    block.childInfo.children = [...block.childInfo.children];
    return block;
  },
  setBlockChildren: (block, children) => {
    block.childInfo.children = children;
    return block;
  },
  setBlockChild: (block, child, id) => {
    block.childInfo.children[id] = child;
    return block;
  },
  insertChild: (block, child, index) => {
    block.childInfo.children = [
      ...block.childInfo.children.slice(0, index),
      child,
      ...block.childInfo.children.slice(index, block.childInfo.children.length)
    ]
    return block;
  },
  isBelowOverItem: (active, over) => {
    return over &&
      active.rect.current.translated &&
      active.rect.current.translated.top >
        over.rect.top + over.rect.height;
  }
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
    activeSection.childInfo.children.filter((item) => item.id !== subsection.id)
  )

  prevCopy[activeSectionIdx] = activeSection;
  prevCopy[overSectionIdx] = overSection;
  return [prevCopy, overSection.childInfo.children];
}

export const moveUnitOver = (
  prevCopy,
  activeSectionIdx,
  activeSubsectionIdx,
  activeUnitIdx,
  overSectionIdx,
  overSubsectionIdx,
  newIndex,
) => {
  let activeSection = dragHelpers.copyBlockChildren({ ...prevCopy[activeSectionIdx] });
  let activeSubsection = dragHelpers.copyBlockChildren(
    { ...activeSection.childInfo.children[activeSubsectionIdx] }
  );

  let overSection = { ...prevCopy[overSectionIdx] };
  if (overSection.id === activeSection.id) {
    overSection = activeSection;
  }

  overSection = dragHelpers.copyBlockChildren(overSection);
  let overSubsection = dragHelpers.copyBlockChildren(
    { ...overSection.childInfo.children[overSubsectionIdx] }
  );

  const unit = activeSubsection.childInfo.children[activeUnitIdx];
  overSubsection = dragHelpers.insertChild( overSubsection, unit , newIndex);
  overSection = dragHelpers.setBlockChild(overSection, overSubsection, overSubsectionIdx);

  activeSubsection = dragHelpers.setBlockChildren(
    activeSubsection,
    activeSubsection.childInfo.children.filter((item) => item.id !== unit.id)
  )

  prevCopy[activeSectionIdx] = dragHelpers.setBlockChild(activeSection, activeSubsection, activeSubsectionIdx);;
  prevCopy[overSectionIdx] = overSection;
  return [prevCopy, overSubsection.childInfo.children];
}

export const moveSubsection = (
  prevCopy,
  sectionIdx,
  currentIdx,
  newIdx,
) => {
  let section = dragHelpers.copyBlockChildren({ ...prevCopy[sectionIdx] });

  const result = arrayMove(section.childInfo.children, currentIdx, newIdx);
  section = dragHelpers.setBlockChildren(section, result);

  prevCopy[sectionIdx] = section;
  return [prevCopy, result];
}

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

  prevCopy[sectionIdx] = section;
  return [prevCopy, result];
}
