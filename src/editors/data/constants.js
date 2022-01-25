export function mapBlockTypeToName(blockType) {
  if (blockType === 'html') {
    return 'Text';
  }
  return blockType[0].toUpperCase() + blockType.substring(1);
}
// States for async processes
export const ActionStates = {
  NOT_BEGUN: 'not_begun',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
};

export function normalizeContent(blockType, content, blockId, courseId) {
  /*
  For Each V2 Block type, return a javascript object which updates the requisite data fields,
  to be POST-messaged to the CMS.
  */
  switch (blockType) {
    case 'html':
      return {
        id: blockId,
        category: blockType,
        has_changes: true,
        data: content,
        couseKey: courseId,
      };
    default:
      throw new TypeError(`No Block in V2 Editors named /"${blockType}/", Cannot Save Content.`);
  }
}
