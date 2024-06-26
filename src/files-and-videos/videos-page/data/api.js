/* eslint-disable no-param-reassign */
import saveAs from 'file-saver';
import { camelCaseObject, ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import { isEmpty } from 'lodash';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getVideosUrl = (courseId) => `${getApiBaseUrl()}/api/contentstore/v1/videos/${courseId}`;
export const getCourseVideosApiUrl = (courseId) => `${getApiBaseUrl()}/videos/${courseId}`;

/**
 * Fetches the course custom pages for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getVideos(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getVideosUrl(courseId));
  const { video_transcript_settings: videoTranscriptSettings } = data;
  const { transcription_plans: transcriptionPlans } = videoTranscriptSettings;
  return {
    ...camelCaseObject(data),
    videoTranscriptSettings: {
      ...camelCaseObject(videoTranscriptSettings),
      transcriptionPlans,
    },
  };
}

export async function getAllUsagePaths({ courseId, videoIds }) {
  const apiPromises = videoIds.map(id => getAuthenticatedHttpClient()
    .get(`${getVideosUrl(courseId)}/${id}/usage`, { videoId: id }));
  const updatedUsageLocations = [];
  const results = await Promise.allSettled(apiPromises);

  results.forEach(result => {
    const value = camelCaseObject(result.value);
    if (value) {
      const { usageLocations } = value.data;
      const activeStatus = usageLocations?.length > 0 ? 'active' : 'inactive';
      const { videoId } = value.config;
      updatedUsageLocations.push({ id: videoId, usageLocations, activeStatus });
    }
  });
  return updatedUsageLocations;
}

/**
 * Fetches the course custom pages for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function fetchVideoList(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseVideosApiUrl(courseId));
  return camelCaseObject(data);
}

export async function deleteTranscript({ videoId, language, apiUrl }) {
  await getAuthenticatedHttpClient()
    .delete(`${getApiBaseUrl()}${apiUrl}/${videoId}/${language}`);
}

export async function downloadTranscript({
  videoId,
  language,
  apiUrl,
  filename,
}) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getApiBaseUrl()}${apiUrl}?edx_video_id=${videoId}&language_code=${language}`);
  const file = new Blob([data], { type: 'text/plain;charset=utf-8' });
  saveAs(file, filename);
}

export async function uploadTranscript({
  videoId,
  newLanguage,
  apiUrl,
  file,
  language,
}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('edx_video_id', videoId);
  formData.append('language_code', language);
  formData.append('new_language_code', newLanguage);
  await getAuthenticatedHttpClient().post(`${getApiBaseUrl()}${apiUrl}`, formData);
}

export async function getDownload(selectedRows, courseId) {
  const downloadErrors = [];
  let file;
  let filename;
  if (selectedRows?.length > 1) {
    const downloadLinks = selectedRows.map(row => {
      const video = row.original;
      try {
        const url = video.downloadLink;
        const name = video.displayName;
        return { url, name };
      } catch (error) {
        downloadErrors.push(`Cannot find download file for ${video?.displayName || 'video'}.`);
        return null;
      }
    });
    if (!isEmpty(downloadLinks)) {
      const json = { files: downloadLinks };
      const { data } = await getAuthenticatedHttpClient()
        .put(`${getVideosUrl(courseId)}/download`, json, { responseType: 'arraybuffer' });

      const date = new Date().toString();
      filename = `${courseId}-videos-${date}`;
      file = new Blob([data], { type: 'application/zip' });
      saveAs(file, filename);
    }
  } else if (selectedRows?.length === 1) {
    try {
      const video = selectedRows[0].original;
      const { downloadLink } = video;
      if (!isEmpty(downloadLink)) {
        saveAs(downloadLink, video.displayName);
      } else {
        downloadErrors.push(`Cannot find download file for ${video?.displayName}.`);
      }
    } catch (error) {
      downloadErrors.push('Failed to download video.');
    }
  } else {
    downloadErrors.push('No files were selected to download.');
  }

  return downloadErrors;
}

/**
 * Fetch where a video is used in a course.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function getVideoUsagePaths({ courseId, videoId }) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getVideosUrl(courseId)}/${videoId}/usage`);
  return camelCaseObject(data);
}

/**
 * Delete video from course.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function deleteVideo(courseId, videoId) {
  await getAuthenticatedHttpClient()
    .delete(`${getCourseVideosApiUrl(courseId)}/${videoId}`);
}

/**
 * Add thumbnail to video.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function addThumbnail({ courseId, videoId, file }) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await getAuthenticatedHttpClient()
    .post(`${getApiBaseUrl()}/video_images/${courseId}/${videoId}`, formData);
  return camelCaseObject(data);
}

/**
 * Add video to course.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function addVideo(courseId, file, controller) {
  const postJson = {
    files: [{ file_name: file.name, content_type: file.type }],
  };
  return getAuthenticatedHttpClient().post(
    getCourseVideosApiUrl(courseId),
    postJson,
    { signal: controller?.signal },
  );
}

export async function sendVideoUploadStatus(
  courseId,
  edxVideoId,
  message,
  status,
) {
  return getAuthenticatedHttpClient()
    .post(getCourseVideosApiUrl(courseId), [{
      edxVideoId,
      message,
      status,
    }]);
}

export async function uploadVideo(
  uploadUrl,
  uploadFile,
  uploadingIdsRef,
  videoId,
  controller,
) {
  const currentUpload = uploadingIdsRef.current.uploadData[videoId];
  return getHttpClient().put(uploadUrl, uploadFile, {
    headers: {
      'Content-Disposition': `attachment; filename="${uploadFile.name}"`,
      'Content-Type': uploadFile.type,
    },
    multipart: false,
    signal: controller?.signal,
    onUploadProgress: ({ loaded, total }) => {
      const progress = ((loaded / total) * 100).toFixed(2);
      uploadingIdsRef.current.uploadData[videoId] = {
        ...currentUpload,
        progress,
      };
    },
  });
}

export async function deleteTranscriptPreferences(courseId) {
  await getAuthenticatedHttpClient().delete(`${getApiBaseUrl()}/transcript_preferences/${courseId}`);
}

export async function setTranscriptPreferences(courseId, preferences) {
  const {
    cielo24Fidelity,
    cielo24Turnaround,
    global,
    preferredLanguages,
    provider,
    threePlayTurnaround,
    videoSourceLanguage,
  } = preferences;
  const postJson = {
    cielo24_fidelity: cielo24Fidelity?.toUpperCase(),
    cielo24_turnaround: cielo24Turnaround,
    global,
    preferred_languages: preferredLanguages,
    provider,
    video_source_language: videoSourceLanguage,
    three_play_turnaround: threePlayTurnaround,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(`${getApiBaseUrl()}/transcript_preferences/${courseId}`, postJson);
  return camelCaseObject(data);
}

export async function setTranscriptCredentials(courseId, formFields) {
  const {
    apiKey,
    global,
    provider,
    ...otherFields
  } = formFields;
  const postJson = {
    api_key: apiKey,
    global,
    provider,
  };

  if (provider === '3PlayMedia') {
    const { apiSecretKey } = otherFields;
    postJson.api_secret_key = apiSecretKey;
  } else {
    const { username } = otherFields;
    postJson.username = username;
  }
  await getAuthenticatedHttpClient()
    .post(`${getApiBaseUrl()}/transcript_credentials/${courseId}`, postJson);
}
