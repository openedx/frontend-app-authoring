import _, { isEmpty } from 'lodash';
import { removeItemOnce } from '../../../utils';
import * as requests from './requests';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './video';
import { valueFromDuration } from '../../../containers/VideoEditor/components/VideoSettingsModal/components/DurationWidget/hooks';
import { parseYoutubeId } from '../../services/cms/api';
import { selectors as appSelectors } from '../app';
import { actions as videoActions, selectors as videoSelectors } from '../video';

// Similar to `import { actions, selectors } from '..';` but avoid circular imports:
const actions = { video: videoActions };
const selectors = { app: appSelectors, video: videoSelectors };

export const loadVideoData = (selectedVideoId, selectedVideoUrl) => (dispatch, getState) => {
  const state = getState();
  const blockValueData = state.app.blockValue.data;
  let rawVideoData = blockValueData.metadata ? blockValueData.metadata : {};
  const rawVideos = Object.values(selectors.app.videos(state));
  if (selectedVideoId !== undefined && selectedVideoId !== null) {
    const selectedVideo = _.find(rawVideos, video => {
      if (_.has(video, 'edx_video_id')) {
        return video.edx_video_id === selectedVideoId;
      }
      return false;
    });

    if (selectedVideo !== undefined && selectedVideo !== null) {
      rawVideoData = {
        edx_video_id: selectedVideo.edx_video_id,
        thumbnail: selectedVideo.course_video_image_url,
        duration: selectedVideo.duration,
        transcriptsFromSelected: selectedVideo.transcripts,
        selectedVideoTranscriptUrls: selectedVideo.transcript_urls,
      };
    }
  }

  const courseData = state.app.courseDetails.data ? state.app.courseDetails.data : {};
  let studioView = state.app.studioView?.data?.html;
  if (state.app.blockId.startsWith('lb:')) {
    studioView = state.app.studioView?.data?.content;
  }

  const {
    videoId,
    videoUrl,
    fallbackVideos,
  } = module.determineVideoSources({
    edxVideoId: rawVideoData.edx_video_id,
    youtubeId: rawVideoData.youtube_id_1_0,
    html5Sources: rawVideoData.html5_sources,
  });

  // Use the selected video url first
  const videoSourceUrl = selectedVideoUrl != null ? selectedVideoUrl : videoUrl;
  const [licenseType, licenseOptions] = module.parseLicense({ licenseData: studioView, level: 'block' });
  // eslint-disable-next-line no-console
  console.log(licenseType);
  const transcripts = rawVideoData.transcriptsFromSelected ? rawVideoData.transcriptsFromSelected
    : module.parseTranscripts({ transcriptsData: studioView });

  const [courseLicenseType, courseLicenseDetails] = module.parseLicense({
    licenseData: courseData.license,
    level: 'course',
  });
  const allowVideoSharing = module.parseVideoSharingSetting({
    courseSetting: blockValueData?.video_sharing_options,
    blockSetting: rawVideoData.public_access,
  });
  dispatch(actions.video.load({
    videoSource: videoSourceUrl || '',
    videoId,
    fallbackVideos,
    allowVideoDownloads: rawVideoData.download_video,
    allowVideoSharing,
    videoSharingLearnMoreLink: blockValueData?.video_sharing_doc_url,
    videoSharingEnabledForCourse: blockValueData?.video_sharing_enabled,
    transcripts,
    selectedVideoTranscriptUrls: rawVideoData.selectedVideoTranscriptUrls,
    allowTranscriptDownloads: rawVideoData.download_track,
    showTranscriptByDefault: rawVideoData.show_captions,
    duration: { // TODO duration is not always sent so they should be calculated.
      startTime: valueFromDuration(rawVideoData.start_time || '00:00:00'),
      stopTime: valueFromDuration(rawVideoData.end_time || '00:00:00'),
      total: rawVideoData.duration || 0, // TODO can we get total duration? if not, probably dropping from widget
    },
    handout: rawVideoData.handout,
    licenseType,
    licenseDetails: {
      attribution: licenseOptions.by,
      noncommercial: licenseOptions.nc,
      noDerivatives: licenseOptions.nd,
      shareAlike: licenseOptions.sa,
    },
    courseLicenseType,
    courseLicenseDetails: {
      attribution: courseLicenseDetails.by,
      noncommercial: courseLicenseDetails.nc,
      noDerivatives: courseLicenseDetails.nd,
      shareAlike: courseLicenseDetails.sa,
    },
    thumbnail: rawVideoData.thumbnail,
  }));
  dispatch(requests.fetchVideoFeatures({
    onSuccess: (response) => dispatch(actions.video.updateField({
      allowThumbnailUpload: response.data.allowThumbnailUpload,
      videoSharingEnabledForAll: response.data.videoSharingEnabled,
    })),
  }));
  const youTubeId = parseYoutubeId(videoSourceUrl);
  if (youTubeId) {
    dispatch(requests.checkTranscriptsForImport({
      videoId,
      youTubeId,
      onSuccess: (response) => {
        if (response.data.command === 'import') {
          dispatch(actions.video.updateField({
            allowTranscriptImport: true,
          }));
        }
      },
    }));
  }
};

export const determineVideoSources = ({
  edxVideoId,
  youtubeId,
  html5Sources,
}) => {
  const youtubeUrl = `https://youtu.be/${youtubeId}`;
  let videoUrl;
  let fallbackVideos;
  if (youtubeId) {
    [videoUrl, fallbackVideos] = [youtubeUrl, html5Sources];
  } else if (Array.isArray(html5Sources) && html5Sources[0]) {
    [videoUrl, fallbackVideos] = [html5Sources[0], html5Sources.slice(1)];
  }
  return {
    videoId: edxVideoId || '',
    videoUrl: videoUrl || '',
    fallbackVideos: fallbackVideos || [],
  };
};

export const parseVideoSharingSetting = ({ courseSetting, blockSetting }) => {
  switch (courseSetting) {
    case 'all-on':
      return { level: 'course', value: true };
    case 'all-off':
      return { level: 'course', value: false };
    case 'per-video':
      return { level: 'block', value: blockSetting };
    default:
      return { level: 'block', value: blockSetting };
  }
};

export const parseTranscripts = ({ transcriptsData }) => {
  if (!transcriptsData) {
    return [];
  }
  const cleanedStr = transcriptsData.replace(/&#34;/g, '"');
  const startString = '"transcripts": ';
  const endString = ', "youtube_id_0_75": ';
  const transcriptsJson = cleanedStr.substring(
    cleanedStr.indexOf(startString) + startString.length,
    cleanedStr.indexOf(endString),
  );
  // const transcriptsObj = JSON.parse(transcriptsJson);
  try {
    const transcriptsObj = JSON.parse(transcriptsJson);
    return Object.keys(transcriptsObj.value);
  } catch (error) {
    if (error instanceof SyntaxError) {
      // eslint-disable-next-line no-console
      console.error('Invalid JSON:', error.message);
    } else {
      throw error;
    }
    return [];
  }
};

// partially copied from frontend-app-learning/src/courseware/course/course-license/CourseLicense.jsx
export const parseLicense = ({ licenseData, level }) => {
  if (!licenseData) {
    return [null, {}];
  }
  let license = licenseData;
  if (level === 'block') {
    const metadataArr = licenseData.split('data-metadata');
    metadataArr.forEach(arr => {
      const parsedStr = arr.replace(/&#34;/g, '"');
      if (parsedStr.includes('license')) {
        license = parsedStr.substring(parsedStr.indexOf('"value"'), parsedStr.indexOf(', "type"')).replace(/"value": |"/g, '');
      }
    });
  }
  if (!license || license.includes('null')) {
    return [null, {}];
  }
  if (license === 'all-rights-reserved') {
    // no options, so the entire thing is the license type
    return [license, {}];
  }
  // Search for a colon character denoting the end
  // of the license type and start of the options
  const colonIndex = license.lastIndexOf(':');
  // Split the license on the colon
  const licenseType = license.slice(0, colonIndex).trim();
  const optionStr = license.slice(colonIndex + 1).trim();
  const options = {};
  let version = '';

  // Set the defaultVersion to 4.0
  const defaultVersion = '4.0';
  optionStr.split(' ').forEach(option => {
    // Split the option into key and value
    // Default the value to `true` if no value
    let key = '';
    let value = '';
    if (option.indexOf('=') !== -1) {
      [key, value] = option.split('=');
    } else {
      key = option;
      value = true;
    }

    // Check for version
    if (key === 'ver') {
      version = value;
    } else {
      // Set the option key to lowercase to make
      // it easier to query
      options[key.toLowerCase()] = value;
    }
  });

  // Set the version to whatever was included,
  // using `defaultVersion` as a fallback if unset
  version = version || defaultVersion;

  return [licenseType, options, version];
};

export const saveVideoData = () => (dispatch, getState) => {
  const state = getState();
  return selectors.video.videoSettings(state);
};

export const uploadThumbnail = ({ thumbnail, emptyCanvas }) => (dispatch, getState) => {
  const state = getState();
  const { videoId } = state.video;
  const { studioEndpointUrl } = state.app;
  dispatch(requests.uploadThumbnail({
    thumbnail,
    videoId,
    onSuccess: (response) => {
      let thumbnailUrl;
      if (response.data.image_url.startsWith('/')) {
        // in local environments, image_url is a relative path
        thumbnailUrl = studioEndpointUrl + response.data.image_url;
      } else {
        // in stage and production, image_url is an absolute path to the image
        thumbnailUrl = response.data.image_url;
      }
      if (!emptyCanvas) {
        dispatch(actions.video.updateField({
          thumbnail: thumbnailUrl,
        }));
      }
    },
    // eslint-disable-next-line no-console
    onFailure: (e) => console.log({ UploadFailure: e }, 'Resampling thumbnail upload'),
  }));
};

// Handout Thunks:

export const uploadHandout = ({ file }) => (dispatch) => {
  dispatch(requests.uploadAsset({
    asset: file,
    onSuccess: (response) => {
      const handout = response.data.asset.url;
      dispatch(actions.video.updateField({ handout }));
    },
  }));
};

// Transcript Thunks:

export const importTranscript = () => (dispatch, getState) => {
  const state = getState();
  const { transcripts, videoSource } = state.video;
  // Remove the placeholder '' from the unset language from the list of transcripts.
  const transcriptsPlaceholderRemoved = isEmpty(transcripts) ? transcripts : removeItemOnce(transcripts, '');

  dispatch(requests.importTranscript({
    youTubeId: parseYoutubeId(videoSource),
    onSuccess: (response) => {
      dispatch(actions.video.updateField({
        transcripts: [
          ...transcriptsPlaceholderRemoved,
          'en'],
      }));

      if (selectors.video.videoId(state) === '') {
        dispatch(actions.video.updateField({
          videoId: response.data.edx_video_id,
        }));
      }
    },
  }));
};

export const uploadTranscript = ({ language, file }) => (dispatch, getState) => {
  const state = getState();
  const { transcripts, videoId } = state.video;
  // Remove the placeholder '' from the unset language from the list of transcripts.
  const transcriptsPlaceholderRemoved = isEmpty(transcripts) ? transcripts : removeItemOnce(transcripts, '');
  dispatch(requests.uploadTranscript({
    language,
    videoId,
    transcript: file,
    onSuccess: (response) => {
      // if we aren't replacing, add the language to the redux store.
      if (!transcriptsPlaceholderRemoved.includes(language)) {
        dispatch(actions.video.updateField({
          transcripts: [
            ...transcriptsPlaceholderRemoved,
            language],
        }));
      }

      if (selectors.video.videoId(state) === '') {
        dispatch(actions.video.updateField({
          videoId: response.data.edx_video_id,
        }));
      }
    },
  }));
};

export const deleteTranscript = ({ language }) => (dispatch, getState) => {
  const state = getState();
  const { transcripts, videoId } = state.video;
  dispatch(requests.deleteTranscript({
    language,
    videoId,
    onSuccess: () => {
      const updatedTranscripts = transcripts.filter((langCode) => langCode !== language);
      dispatch(actions.video.updateField({ transcripts: updatedTranscripts }));
    },
  }));
};

export const updateTranscriptLanguage = ({ newLanguageCode, languageBeforeChange }) => (dispatch, getState) => {
  const state = getState();
  const { video: { transcripts, videoId } } = state;
  selectors.video.getTranscriptDownloadUrl(state);
  dispatch(requests.getTranscriptFile({
    videoId,
    language: languageBeforeChange,
    onSuccess: (response) => {
      dispatch(requests.updateTranscriptLanguage({
        languageBeforeChange,
        file: new File([new Blob([response.data], { type: 'text/plain' })], `${videoId}_${newLanguageCode}.srt`, { type: 'text/plain' }),
        newLanguageCode,
        videoId,
        onSuccess: () => {
          const newTranscripts = transcripts
            .filter(transcript => transcript !== languageBeforeChange);
          newTranscripts.push(newLanguageCode);
          dispatch(actions.video.updateField({ transcripts: newTranscripts }));
        },
      }));
    },
  }));
};

export const replaceTranscript = ({ newFile, newFilename, language }) => (dispatch, getState) => {
  const state = getState();
  const { videoId } = state.video;
  dispatch(requests.deleteTranscript({
    language,
    videoId,
    onSuccess: () => {
      dispatch(uploadTranscript({ language, file: newFile, filename: newFilename }));
    },
  }));
};

export const uploadVideo = ({ supportedFiles, setLoadSpinner, postUploadRedirect }) => (dispatch) => {
  const data = { files: [] };
  setLoadSpinner(true);
  supportedFiles.forEach((file) => {
    const fileData = file.get('file');
    data.files.push({
      file_name: fileData.name,
      content_type: fileData.type,
    });
  });
  dispatch(requests.uploadVideo({
    data,
    onSuccess: async (response) => {
      const { files } = response.data;
      await Promise.all(Object.values(files).map(async (fileObj) => {
        const fileName = fileObj.file_name;
        const edxVideoId = fileObj.edx_video_id;
        const uploadUrl = fileObj.upload_url;
        const uploadFile = supportedFiles.find((file) => file.get('file').name === fileName);
        if (!uploadFile) {
          // eslint-disable-next-line no-console
          console.error(`Could not find file object with name "${fileName}" in supportedFiles array.`);
          return;
        }
        const file = uploadFile.get('file');
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Disposition': `attachment; filename="${file.name}"`,
            'Content-Type': file.type,
          },
          multipart: false,
          body: file,
        })
          .then((resp) => {
            if (!resp.ok) {
              throw new Error('Failed to connect with server');
            }
            postUploadRedirect(edxVideoId);
          })
          // eslint-disable-next-line no-console
          .catch((error) => console.error('Error uploading file:', error));
      }));
      setLoadSpinner(false);
    },
  }));
};

export default {
  loadVideoData,
  determineVideoSources,
  parseLicense,
  saveVideoData,
  uploadThumbnail,
  importTranscript,
  uploadTranscript,
  deleteTranscript,
  updateTranscriptLanguage,
  replaceTranscript,
  uploadHandout,
  uploadVideo,
};
