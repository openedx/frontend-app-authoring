import type { AxiosRequestConfig } from 'axios';
import { camelizeKeys } from '../../../utils';
import { isLibraryKey } from '../../../../generic/key-utils';
import * as urls from './urls';
import {
  get, post, put, deleteObject,
} from './utils';
import { durationStringFromValue } from '../../../containers/VideoEditor/components/VideoSettingsModal/components/DurationWidget/hooks';

const fetchByUnitIdOptions: AxiosRequestConfig = {};

interface Pagination {
  start: number;
  end: number;
  page: number;
  pageSize: number;
  totalCount: number;
}

interface AssetResponse {
  assets: Record<string, string>[]; // In the raw response here, these are NOT camel-cased yet.
}

type FieldsResponse = {
  display_name: string; // In the raw response here, these are NOT camel-cased yet.
  data: any;
  metadata: Record<string, any>;
} & Record<string, any>; // In courses (but not in libraries), there are many other fields returned here.

interface AncestorsResponse {
  ancestors: {
    id: string;
    display_name: string; // In the raw response here, these are NOT camel-cased yet.
    category: string;
    has_children: boolean;
  }[];
}

export const loadImage = (imageData) => ({
  ...imageData,
  dateAdded: new Date(imageData.dateAdded.replace(' at', '')).getTime(),
});

export const loadImages = (rawImages) => camelizeKeys(rawImages).reduce(
  (obj, image) => ({ ...obj, [image.id]: loadImage(image) }),
  {},
);

export const parseYoutubeId = (src: string): string | null => {
  const youtubeRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/;
  const match = src.match(youtubeRegex);
  if (!match) {
    return null;
  }
  return match[5];
};

export const processVideoIds = ({
  videoId,
  videoUrl,
  fallbackVideos,
}: { videoId: string, videoUrl: string, fallbackVideos: string[] }) => {
  let youtubeId: string | null = '';
  const html5Sources: string[] = [];

  if (videoUrl) {
    if (parseYoutubeId(videoUrl)) {
      youtubeId = parseYoutubeId(videoUrl);
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

export const isEdxVideo = (src: string): boolean => {
  const uuid4Regex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
  if (src && src.match(uuid4Regex)) {
    return true;
  }
  return false;
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

export const apiMethods = {
  fetchBlockById: ({ blockId, studioEndpointUrl }): Promise<{ data: FieldsResponse }> => get(
    urls.block({ blockId, studioEndpointUrl }),
  ),
  /** A better name for this would be 'get ancestors of block' */
  fetchByUnitId: ({ blockId, studioEndpointUrl }): Promise<{ data: AncestorsResponse }> => get(
    urls.blockAncestor({ studioEndpointUrl, blockId }),
    fetchByUnitIdOptions,
  ),
  fetchStudioView: ({ blockId, studioEndpointUrl }) => get(
    urls.blockStudioView({ studioEndpointUrl, blockId }),
  ),
  fetchCourseImages: ({
    learningContextId,
    studioEndpointUrl,
    pageNumber,
  }): Promise<{ data: AssetResponse & Pagination }> => {
    const params = {
      asset_type: 'Images',
      page: pageNumber,
    };
    return get(
      `${urls.courseAssets({ studioEndpointUrl, learningContextId })}`,
      { params },
    );
  },
  fetchLibraryImages: ({ blockId }) => get(
    `${urls.libraryAssets({ blockId })}`,
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
    blockId,
    learningContextId,
    studioEndpointUrl,
    asset,
  }) => {
    const data = new FormData();
    data.append('file', asset);
    if (isLibraryKey(learningContextId)) {
      data.set('content', asset);
      return put(
        `${urls.libraryAssets({ blockId, assetName: asset.name })}`,
        data,
      );
    }
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
  }: {
    blockId: string,
    blockType: string,
    content: any, // string for 'html' blocks, otherwise Record<string, any>
    learningContextId: string,
    title: string,
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
      } = processVideoIds({
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
          license: processLicense(content.licenseType, content.licenseDetails),
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
    apiMethods.normalizeContent({
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

export default apiMethods;
