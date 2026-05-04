import { findLast, findLastIndex } from 'lodash';

import { type XBlock } from '@src/data/types';

export type EditableSubsection = {
  data: XBlock;
  sectionId: string;
};

export const getLastEditableItem = (blockList: XBlock[]) => findLast(
  blockList,
  (item) => item.actions.childAddable,
);

export const getLastEditableSubsection = (
  blockList: XBlock[],
  startIndex?: number,
): EditableSubsection | undefined => {
  const lastSectionIndex = findLastIndex(
    blockList,
    (item) => item.actions.childAddable,
    startIndex,
  );

  if (lastSectionIndex === -1) {
    return undefined;
  }

  const lastSubsectionIndex = findLastIndex(
    blockList[lastSectionIndex].childInfo.children,
    (item) => item.actions.childAddable,
  );

  if (lastSubsectionIndex !== -1) {
    return {
      data: blockList[lastSectionIndex].childInfo.children[lastSubsectionIndex],
      sectionId: blockList[lastSectionIndex].id,
    };
  }

  if (lastSectionIndex > 0) {
    return getLastEditableSubsection(blockList, lastSectionIndex - 1);
  }

  return undefined;
};
