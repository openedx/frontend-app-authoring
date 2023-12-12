import { camelizeKeys } from '../../../utils';
import * as urls from './urls';
import { get, post, deleteObject } from './utils';
import * as module from './api';
import * as mockApi from './mockApi';
import { durationStringFromValue } from '../../../containers/VideoEditor/components/VideoSettingsModal/components/DurationWidget/hooks';

export const apiMethods = {
  fetchBlockById: ({ blockId, studioEndpointUrl }) => get(
    urls.block({ blockId, studioEndpointUrl }),
  ),
  fetchByUnitId: ({ blockId, studioEndpointUrl }) => get(
    urls.blockAncestor({ studioEndpointUrl, blockId }),
    {
      headers: {
        Accept: '*/*',
      },
    },
  ),
  fetchStudioView: ({ blockId, studioEndpointUrl }) => get(
    urls.blockStudioView({ studioEndpointUrl, blockId }),
  ),
  fetchAssets: ({ learningContextId, studioEndpointUrl }) => get(
    urls.courseAssets({ studioEndpointUrl, learningContextId }),
  ),
  fetchVideos: ({ studioEndpointUrl, learningContextId }) => get(
    urls.courseVideos({ studioEndpointUrl, learningContextId }),
  ),
  fetchCourseDetails: ({ studioEndpointUrl, learningContextId }) => get(
    urls.courseDetailsUrl({ studioEndpointUrl, learningContextId }),
  ),
  fetchAdvancedSettings: ({ studioEndpointUrl, learningContextId }) => get(
    urls.courseAdvanceSettings({ studioEndpointUrl, learningContextId }),
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
  checkTranscriptsForImport: ({
    studioEndpointUrl,
    blockId,
    youTubeId,
    videoId,
  }) => {
    const getJSON = `{"locator":"${blockId}","videos":[{"mode":"youtube","video":"${youTubeId}","type":"youtube"},{"mode":"edx_video_id","type":"edx_video_id","video":"${videoId}"}]}`;
    return get(
      urls.checkTranscriptsForImport({
        studioEndpointUrl,
        parameters: encodeURIComponent(getJSON),
      }),
    );
  },
  importTranscript: ({
    studioEndpointUrl,
    blockId,
    youTubeId,
  }) => {
    const getJSON = `{"locator":"${blockId}","videos":[{"mode":"youtube","video":"${youTubeId}","type":"youtube"}]}`;
    return get(
      urls.replaceTranscript({
        studioEndpointUrl,
        parameters: encodeURIComponent(getJSON),
      }),
    );
  },
  getTranscript: ({
    studioEndpointUrl,
    language,
    blockId,
    videoId,
  }) => {
    const getJSON = { data: { lang: language, edx_video_id: videoId } };
    return get(
      `${urls.videoTranscripts({ studioEndpointUrl, blockId })}?language_code=${language}`,
      getJSON,
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
    newLanguage = null,
  }) => {
    const data = new FormData();
    data.append('file', transcript);
    data.append('edx_video_id', videoId);
    data.append('language_code', language);
    data.append('new_language_code', newLanguage || language);
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
    let response = {};
    if (blockType === 'html') {
      response = {
        category: blockType,
        courseKey: learningContextId,
        data: content,
        has_changes: true,
        id: blockId,
        metadata: { display_name: title },
      };
    } else if (blockType === 'problem') {
      response = {
        data: content.olx,
        category: blockType,
        courseKey: learningContextId,
        has_changes: true,
        id: blockId,
        metadata: { display_name: title, ...content.settings },
      };
    } else if (blockType === 'video') {
      const {
        html5Sources,
        edxVideoId,
        youtubeId,
      } = module.processVideoIds({
        videoId: content.videoId,
        videoUrl: content.videoSource,
        fallbackVideos: content.fallbackVideos,
      });
      response = {
        category: blockType,
        courseKey: learningContextId,
        display_name: title,
        id: blockId,
        metadata: {
          display_name: title,
          download_video: content.allowVideoDownloads,
          public_access: content.allowVideoSharing.value,
          edx_video_id: edxVideoId,
          html5_sources: html5Sources,
          youtube_id_1_0: youtubeId,
          thumbnail: content.thumbnail,
          download_track: content.allowTranscriptDownloads,
          track: '', // TODO Downloadable Transcript URL. Backend expects a file name, for example: "something.srt"
          show_captions: content.showTranscriptByDefault,
          handout: content.handout,
          start_time: durationStringFromValue(content.duration.startTime),
          end_time: durationStringFromValue(content.duration.stopTime),
          license: module.processLicense(content.licenseType, content.licenseDetails),
        },
      };
    } else {
      throw new TypeError(`No Block in V2 Editors named /"${blockType}/", Cannot Save Content.`);
    }
    return { ...response };
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
  fetchVideoFeatures: ({
    studioEndpointUrl,
  }) => get(
    urls.videoFeatures({ studioEndpointUrl }),
  ),
  uploadVideo: ({
    data,
    studioEndpointUrl,
    learningContextId,
  }) => post(
    urls.courseVideos({ studioEndpointUrl, learningContextId }),
    data,
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

export const processVideoIds = ({
  videoId,
  videoUrl,
  fallbackVideos,
}) => {
  let youtubeId = '';
  const html5Sources = [];

  if (videoUrl) {
    if (module.parseYoutubeId(videoUrl)) {
      youtubeId = module.parseYoutubeId(videoUrl);
    } else {
      html5Sources.push(videoUrl);
    }
  }

  if (fallbackVideos) {
    fallbackVideos.forEach((src) => (src ? html5Sources.push(src) : null));
  }

  return {
    edxVideoId: videoId,
    html5Sources,
    youtubeId,
  };
};

export const isEdxVideo = (src) => {
  const uuid4Regex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
  if (src && src.match(uuid4Regex)) {
    return true;
  }
  return false;
};

export const parseYoutubeId = (src) => {
  const youtubeRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/;
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
    return mockApi[key] ? mockApi[key] : mockApi.emptyMock;
  }
  return module.apiMethods[key];
};

export default Object.keys(apiMethods).reduce(
  (obj, key) => ({ ...obj, [key]: checkMockApi(key) }),
  {},
);
