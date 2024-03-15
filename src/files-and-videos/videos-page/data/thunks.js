import { camelCase, isEmpty } from 'lodash';
import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { RequestStatus } from '../../../data/constants';
import {
  addModels,
  removeModel,
  updateModel,
  updateModels,
} from '../../../generic/model-store';
import {
  addThumbnail,
  addVideo,
  deleteVideo,
  fetchVideoList,
  getVideos,
  uploadVideo,
  getDownload,
  deleteTranscript,
  downloadTranscript,
  uploadTranscript,
  getVideoUsagePaths,
  deleteTranscriptPreferences,
  sendVideoUploadStatus,
  setTranscriptCredentials,
  setTranscriptPreferences,
  getAllUsagePaths,
} from './api';
import {
  setVideoIds,
  setPageSettings,
  updateLoadingStatus,
  deleteVideoSuccess,
  updateErrors,
  clearErrors,
  updateEditStatus,
  updateTranscriptCredentialsSuccess,
  updateTranscriptPreferenceSuccess,
  failAddVideo,
} from './slice';
import { ServerError } from './errors';

import { updateFileValues } from './utils';

export function fetchVideos(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));
    try {
      const { previousUploads, ...data } = await getVideos(courseId);
      dispatch(setPageSettings({ ...data }));
      // Previous uploads are the current videos associated with a course.
      // If previous uploads are empty there is no need to add an empty model
      // or loop through and empty list so automatically set loading to successful
      if (isEmpty(previousUploads)) {
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
      } else {
        const parsedVideos = updateFileValues(previousUploads);
        const videoIds = parsedVideos.map(video => video.id);
        dispatch(addModels({ modelType: 'videos', models: parsedVideos }));
        dispatch(setVideoIds({ videoIds }));
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.PARTIAL }));
        const allUsageLocations = await getAllUsagePaths({ courseId, videoIds });
        dispatch(updateModels({ modelType: 'videos', models: allUsageLocations }));
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(updateErrors({ error: 'loading', message: 'Failed to load videos' }));
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
      }
    }
  };
}

export function resetErrors({ errorType }) {
  return (dispatch) => { dispatch(clearErrors({ error: errorType })); };
}

export function updateVideoOrder(courseId, videoIds) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));
    dispatch(setVideoIds({ videoIds }));
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
  };
}

export function deleteVideoFile(courseId, id) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.IN_PROGRESS }));
    try {
      await deleteVideo(courseId, id);
      dispatch(deleteVideoSuccess({ videoId: id }));
      dispatch(removeModel({ modelType: 'videos', id }));
      dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'delete', message: `Failed to delete file id ${id}.` }));
      dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.FAILED }));
    }
  };
}

export function addVideoFile(courseId, file, videoIds) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.IN_PROGRESS }));
    let edxVideoId; let uploadUrl;
    try {
      const createUrlResponse = await addVideo(courseId, file);
      // eslint-disable-next-line
      console.log(`Post Response: ${createUrlResponse}`);
      if (createUrlResponse.status < 200 || createUrlResponse.status >= 300) {
        dispatch(failAddVideo({ fileName: file.name }));
      }
      // eslint-disable-next-line prefer-destructuring
      [{ edxVideoId, uploadUrl }] = camelCaseObject(createUrlResponse.data).files;
    } catch (error) {
      dispatch(failAddVideo({ fileName: file.name }));
      return;
    }
    try {
      const putToServerResponse = await uploadVideo(uploadUrl, file);
      if (putToServerResponse.status < 200 || putToServerResponse.status >= 300) {
        throw new ServerError('Server responded with an error status', putToServerResponse.status);
      } else {
        sendVideoUploadStatus(courseId, edxVideoId, 'Upload completed', 'upload_completed');
      }
    } catch (error) {
      if (error.response && error.response.status === 413) {
        const message = error.response.data.error;
        dispatch(updateErrors({ error: 'add', message }));
      } else {
        dispatch(updateErrors({ error: 'add', message: `Failed to upload ${file.name}.` }));
      }
      sendVideoUploadStatus(courseId, edxVideoId || '', 'Upload failed', 'upload_failed');
      dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.FAILED }));
    }
    try {
      const { videos } = await fetchVideoList(courseId);
      const newVideos = videos.filter(video => !videoIds.includes(video.edxVideoId));
      const newVideoIds = newVideos.map(video => video.edxVideoId);
      const parsedVideos = updateFileValues(newVideos, true);
      dispatch(addModels({ modelType: 'videos', models: parsedVideos }));
      dispatch(setVideoIds({ videoIds: videoIds.concat(newVideoIds) }));
    } catch (error) {
      dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.FAILED }));
      // eslint-disable-next-line
      console.error(`fetchVideoList failed with message: ${error.message}`);
      dispatch(updateErrors({ error: 'add', message: 'Failed to load videos' }));
      return;
    }
    dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.SUCCESSFUL }));
  };
}

export function addVideoThumbnail({ file, videoId, courseId }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'thumbnail', status: RequestStatus.IN_PROGRESS }));
    dispatch(resetErrors({ errorType: 'thumbnail' }));
    try {
      const { imageUrl } = await addThumbnail({ courseId, videoId, file });
      let thumbnail = imageUrl;
      if (thumbnail.startsWith('/')) {
        thumbnail = `${getConfig().STUDIO_BASE_URL}${imageUrl}`;
      }
      dispatch(updateModel({
        modelType: 'videos',
        model: {
          id: videoId,
          thumbnail,
        },
      }));
      dispatch(updateEditStatus({ editType: 'thumbnail', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response?.data?.error) {
        const message = error.response.data.error;
        dispatch(updateErrors({ error: 'thumbnail', message }));
      } else {
        dispatch(updateErrors({ error: 'thumbnail', message: `Failed to add thumbnail for video id ${videoId}.` }));
      }
      dispatch(updateEditStatus({ editType: 'thumbnail', status: RequestStatus.FAILED }));
    }
  };
}

export function deleteVideoTranscript({
  language,
  videoId,
  transcripts,
  apiUrl,
}) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.IN_PROGRESS }));

    try {
      await deleteTranscript({
        videoId,
        language,
        apiUrl,
      });
      const updatedTranscripts = transcripts.filter(transcript => transcript !== language);
      const transcriptStatus = updatedTranscripts?.length > 0 ? 'transcribed' : 'notTranscribed';

      dispatch(updateModel({
        modelType: 'videos',
        model: {
          id: videoId,
          transcripts: updatedTranscripts,
          transcriptStatus,
        },
      }));

      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'transcript', message: `Failed to delete ${language} transcript.` }));
      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.FAILED }));
    }
  };
}

export function downloadVideoTranscript({
  language,
  videoId,
  filename,
  apiUrl,
}) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.IN_PROGRESS }));

    try {
      await downloadTranscript({
        videoId,
        language,
        apiUrl,
        filename,
      });
      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'transcript', message: `Failed to download ${filename}.` }));
      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.FAILED }));
    }
  };
}

export function uploadVideoTranscript({
  language,
  newLanguage,
  videoId,
  file,
  apiUrl,
  transcripts,
}) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.IN_PROGRESS }));
    const isReplacement = !isEmpty(language);

    try {
      await uploadTranscript({
        videoId,
        language,
        apiUrl,
        file,
        newLanguage,
      });
      let updatedTranscripts = transcripts;
      if (isReplacement) {
        const removeTranscript = transcripts.filter(transcript => transcript !== language);
        updatedTranscripts = [...removeTranscript, newLanguage];
      } else {
        updatedTranscripts = [...transcripts, newLanguage];
      }

      const transcriptStatus = updatedTranscripts?.length > 0 ? 'transcribed' : 'notTranscribed';

      dispatch(updateModel({
        modelType: 'videos',
        model: {
          id: videoId,
          transcripts: updatedTranscripts,
          transcriptStatus,
        },
      }));

      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response?.data?.error) {
        const message = error.response.data.error;
        dispatch(updateErrors({ error: 'transcript', message }));
      } else {
        const message = isReplacement ? `Failed to replace ${language} with ${newLanguage}.` : `Failed to add ${newLanguage}.`;
        dispatch(updateErrors({ error: 'transcript', message }));
      }
      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.FAILED }));
    }
  };
}

export function getUsagePaths({ video, courseId }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.IN_PROGRESS }));

    try {
      const { usageLocations } = await getVideoUsagePaths({ videoId: video.id, courseId });
      const activeStatus = usageLocations?.length > 0 ? 'active' : 'inactive';

      dispatch(updateModel({
        modelType: 'videos',
        model: {
          id: video.id,
          usageLocations,
          activeStatus,
        },
      }));
      dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'usageMetrics', message: `Failed to get usage metrics for ${video.displayName}.` }));
      dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.FAILED }));
    }
  };
}

export function fetchVideoDownload({ selectedRows, courseId }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.IN_PROGRESS }));
    try {
      const errors = await getDownload(selectedRows, courseId);
      dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.SUCCESSFUL }));
      if (!isEmpty(errors)) {
        errors.forEach(error => {
          dispatch(updateErrors({ error: 'download', message: error }));
        });
        dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.FAILED }));
      }
    } catch (error) {
      dispatch(updateErrors({ error: 'download', message: 'Failed to download zip file of videos.' }));
      dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.FAILED }));
    }
  };
}

export function clearAutomatedTranscript({ courseId }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.IN_PROGRESS }));

    try {
      await deleteTranscriptPreferences(courseId);
      dispatch(updateTranscriptPreferenceSuccess({ modified: new Date() }));
      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'transcript', message: 'Failed to update order transcripts settings.' }));
      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.FAILED }));
    }
  };
}

export function updateTranscriptCredentials({ courseId, data }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.IN_PROGRESS }));

    try {
      await setTranscriptCredentials(courseId, data);
      dispatch(updateTranscriptCredentialsSuccess({ provider: camelCase(data.provider) }));
      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'transcript', message: `Failed to update ${data.provider} credentials.` }));
      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.FAILED }));
    }
  };
}

export function updateTranscriptPreference({ courseId, data }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.IN_PROGRESS }));

    try {
      const preferences = await setTranscriptPreferences(courseId, data);
      dispatch(updateTranscriptPreferenceSuccess(preferences));
      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response?.data?.error) {
        const message = error.response.data.error;
        dispatch(updateErrors({ error: 'transcript', message }));
      } else {
        dispatch(updateErrors({ error: 'transcript', message: `Failed to update ${data.provider} transcripts settings.` }));
      }
      dispatch(updateEditStatus({ editType: 'transcript', status: RequestStatus.FAILED }));
    }
  };
}
