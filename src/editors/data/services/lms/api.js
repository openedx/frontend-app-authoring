import * as urls from './urls';
import { get, post } from './utils';

export const fetchBlockById = ({ blockId, studioEndpointUrl }) => get(
  urls.block({ blockId, studioEndpointUrl }),
);

export const fetchByUnitId = ({ blockId, studioEndpointUrl }) => get(
  urls.blockAncestor({ studioEndpointUrl, blockId }),
);

export const normalizeContent = ({
  blockId,
  blockType,
  content,
  courseId,
  title,
}) => {
  if (blockType === 'html') {
    return {
      category: blockType,
      couseKey: courseId,
      data: content,
      has_changes: true,
      id: blockId,
      metadata: { display_name: title },
    };
  }
  throw new TypeError(`No Block in V2 Editors named /"${blockType}/", Cannot Save Content.`);
};

export const saveBlock = ({
  blockId,
  blockType,
  content,
  courseId,
  studioEndpointUrl,
  title,
}) => post(
  urls.block({ studioEndpointUrl, blockId }),
  normalizeContent({
    blockType,
    content,
    blockId,
    courseId,
    title,
  }),
);
