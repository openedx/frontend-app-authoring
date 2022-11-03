import { camelizeKeys } from '../../../utils';
import * as urls from './urls';
import { get, post, deleteObject } from './utils';
import * as module from './api';
import * as mockApi from './mockApi';
import { durationFromValue } from '../../../containers/VideoEditor/components/VideoSettingsModal/components/duration';

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
  fetchAssets: ({ learningContextId, studioEndpointUrl }) => get(
    urls.courseAssets({ studioEndpointUrl, learningContextId }),
  ),
  fetchCourseDetails: ({ studioEndpointUrl, learningContextId }) => get(
    urls.courseDetailsUrl({ studioEndpointUrl, learningContextId }),
  ),
  uploadAsset: ({
    learningContextId,
    studioEndpointUrl,
    asset,
  }) => {
    const data = new FormData();
    data.append('file', asset);
    return post(
      urls.courseAssets({ studioEndpointUrl, learningContextId }),
      data,
    );
  },
  allowThumbnailUpload: ({
    studioEndpointUrl,
  }) => get(
    urls.allowThumbnailUpload({ studioEndpointUrl }),
  ),
  uploadThumbnail: ({
    studioEndpointUrl,
    learningContextId,
    videoId,
    thumbnail,
  }) => {
    const data = new FormData();
    data.append('file', thumbnail);
    return post(
      urls.thumbnailUpload({ studioEndpointUrl, learningContextId, videoId }),
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
        courseKey: learningContextId,
        data: content,
        has_changes: true,
        id: blockId,
        metadata: { display_name: title },
      };
    }
    if (blockType === 'video') {
      const {
        html5Sources,
        edxVideoId,
        youtubeId,
      } = module.processVideoIds({
        videoSource: content.videoSource,
        fallbackVideos: content.fallbackVideos,
      });
      return {
        category: blockType,
        courseKey: learningContextId,
        display_name: title,
        id: blockId,
        metadata: {
          display_name: title,
          download_video: content.allowVideoDownloads,
          edx_video_id: edxVideoId,
          html5_sources: html5Sources,
          youtube_id_1_0: youtubeId,
          thumbnail: content.thumbnail,
          download_track: content.allowTranscriptDownloads,
          track: '', // TODO Downloadable Transcript URL. Backend expects a file name, for example: "something.srt"
          show_captions: content.showTranscriptByDefault,
          handout: content.handout,
          start_time: durationFromValue(content.duration.startTime),
          end_time: durationFromValue(content.duration.stopTime),
          license: module.processLicense(content.licenseType, content.licenseDetails),
        },
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

export const processVideoIds = ({ videoSource, fallbackVideos }) => {
  let edxVideoId = '';
  let youtubeId = '';
  const html5Sources = [];

  if (module.isEdxVideo(videoSource)) {
    edxVideoId = videoSource;
  } else if (module.parseYoutubeId(videoSource)) {
    youtubeId = module.parseYoutubeId(videoSource);
  } else if (videoSource) {
    html5Sources.push(videoSource);
  }

  if (fallbackVideos) {
    fallbackVideos.forEach((src) => (src ? html5Sources.push(src) : null));
  }

  return {
    edxVideoId,
    html5Sources,
    youtubeId,
  };
};

export const isEdxVideo = (src) => {
  const uuid4Regex = new RegExp(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/);
  if (src.match(uuid4Regex)) {
    return true;
  }
  return false;
};

export const parseYoutubeId = (src) => {
  const youtubeRegex = new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/);
  if (!src.match(youtubeRegex)) {
    return null;
  }
  return src.match(youtubeRegex)[5];
};

export const processLicense = (licenseType, licenseDetails) => {
  if (licenseType === 'creative-commons') {
    return 'creative-commons: ver=4.0'.concat(
      (licenseDetails.attribution ? ' BY' : ''),
      (licenseDetails.noncommercial ? ' NC' : ''),
      (licenseDetails.noDerivatives ? ' ND' : ''),
      (licenseDetails.shareAlike ? ' SA' : ''),
    );
  }
  if (licenseType === 'all-rights-reserved') {
    return 'all-rights-reserved';
  }
  return '';
};

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
