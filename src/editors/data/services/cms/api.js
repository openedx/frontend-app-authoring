import { camelizeKeys } from '../../../utils';
import * as urls from './urls';
import { get, post, deleteObject } from './utils';
import * as module from './api';
import * as mockApi from './mockApi';

export const apiMethods = {
  fetchBlockById: ({ blockId, studioEndpointUrl }) => get(
    urls.block({ blockId, studioEndpointUrl }),
  ),
  fetchByUnitId: ({ blockId, studioEndpointUrl }) => get(
    urls.blockAncestor({ studioEndpointUrl, blockId }),
  ),
  fetchStudioView: ({ blockId, studioEndpointUrl }) => get(
    urls.blockStudioView({ studioEndpointUrl, blockId }),
  ),
  fetchImages: ({ learningContextId, studioEndpointUrl }) => get(
    urls.courseImages({ studioEndpointUrl, learningContextId }),
  ),
  uploadImage: ({
    learningContextId,
    studioEndpointUrl,
    image,
  }) => {
    const data = new FormData();
    data.append('file', image);
    return post(
      urls.courseAssets({ studioEndpointUrl, learningContextId }),
      data,
    );
  },
  deleteTranscript: ({
    studioEndpointUrl,
    language,
    blockId,
    videoId,
  }) => {
    const deleteJSON = { data: { lang: language, edx_video_id: videoId } };
    return deleteObject(
      urls.videoTranscripts({ studioEndpointUrl, blockId }),
      deleteJSON,
    );
  },
  uploadTranscript: ({
    blockId,
    studioEndpointUrl,
    transcript,
    videoId,
    language,
  }) => {
    const data = new FormData();
    data.append('file', transcript);
    data.append('edx_video_id', videoId);
    data.append('language_code', language);
    data.append('new_language_code', language);
    return post(
      urls.videoTranscripts({ studioEndpointUrl, blockId }),
      data,
    );
  },
  normalizeContent: ({
    blockId,
    blockType,
    content,
    learningContextId,
    title,
  }) => {
    if (blockType === 'html') {
      return {
        category: blockType,
        couseKey: learningContextId,
        data: content,
        has_changes: true,
        id: blockId,
        metadata: { display_name: title },
      };
    }
    throw new TypeError(`No Block in V2 Editors named /"${blockType}/", Cannot Save Content.`);
  },
  saveBlock: ({
    blockId,
    blockType,
    content,
    learningContextId,
    studioEndpointUrl,
    title,
  }) => post(
    urls.block({ studioEndpointUrl, blockId }),
    module.apiMethods.normalizeContent({
      blockType,
      content,
      blockId,
      learningContextId,
      title,
    }),
  ),
};

export const loadImage = (imageData) => ({
  ...imageData,
  dateAdded: new Date(imageData.dateAdded.replace(' at', '')).getTime(),
});

export const loadImages = (rawImages) => camelizeKeys(rawImages).reduce(
  (obj, image) => ({ ...obj, [image.id]: module.loadImage(image) }),
  {},
);

export const checkMockApi = (key) => {
  if (process.env.REACT_APP_DEVGALLERY) {
    return mockApi[key];
  }
  return module.apiMethods[key];
};

export default Object.keys(apiMethods).reduce(
  (obj, key) => ({ ...obj, [key]: checkMockApi(key) }),
  {},
);
