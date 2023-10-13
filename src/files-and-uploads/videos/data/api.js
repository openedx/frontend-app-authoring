/* eslint-disable import/prefer-default-export */
import { camelCaseObject, ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import JSZip from 'jszip';
import saveAs from 'file-saver';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getVideosUrl = (courseId) => `${getApiBaseUrl()}/api/contentstore/v1/videos/${courseId}`;
export const getCoursVideosApiUrl = (courseId) => `${getApiBaseUrl()}/videos/${courseId}`;

/**
 * Fetches the course custom pages for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getVideos(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getVideosUrl(courseId));
  return camelCaseObject(data);
}

/**
 * Fetches the course custom pages for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function fetchVideoList(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCoursVideosApiUrl(courseId));
  return camelCaseObject(data);
}

export async function deleteTranscript({ videoId, language, apiUrl }) {
  await getAuthenticatedHttpClient()
    .delete(`${getApiBaseUrl()}${apiUrl}/${videoId}/${language}`);
}

export async function downloadTranscriipt({
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
  formData.append('new_langage_code', newLanguage);
  await getAuthenticatedHttpClient().post(`${getApiBaseUrl()}${apiUrl}`, formData);
}

export async function getDownloadLink(courseId, edxVideoId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getVideosUrl(courseId)}/${edxVideoId}`);
  return camelCaseObject(data);
}

/**
 * Fetch video file.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function getDownload(selectedRows, courseId) {
  const downloadErrors = [];
  if (selectedRows?.length > 1) {
    const zip = new JSZip();
    const date = new Date().toString();
    const folder = zip.folder(`${courseId}-videos-${date}`);
    const videoNames = [];
    const videoFetcher = await Promise.allSettled(
      selectedRows.map(async (row) => {
        const video = row?.original;
        try {
          videoNames.push(video.displayName);
          const { downloadLink } = await getDownloadLink(courseId, video.id);
          const res = await fetch(downloadLink);
          if (!res.ok) {
            throw new Error();
          }
          return res.blob();
        } catch (error) {
          downloadErrors.push(`Failed to download ${video?.displayName}.`);
          return null;
        }
      }),
    );
    const definedVideos = videoFetcher.filter(video => video.value !== null);
    if (definedVideos.length > 0) {
      definedVideos.forEach((videoBlob, index) => {
        folder.file(videoNames[index], videoBlob.value, { blob: true });
      });
      zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, `${courseId}-videos-${date}.zip`);
      });
    }
  } else if (selectedRows?.length === 1) {
    const video = selectedRows[0].original;
    try {
      const { downloadLink } = await getDownloadLink(courseId, video.id);
      saveAs(downloadLink, video.displayName);
    } catch (error) {
      downloadErrors.push(`Failed to download ${video?.displayName}.`);
    }
  } else {
    downloadErrors.push('No files were selected to download');
  }
  return downloadErrors;
}

// /**
//  * Fetch where video is used in a course.
//  * @param {blockId} courseId Course ID for the course to operate on

//  */
// export async function getAssetUsagePaths({ courseId, videoId }) {
//   const { data } = await getAuthenticatedHttpClient()
//     .get(`${getAssetsUrl(courseId)}${videoId}/usage`);
//   return camelCaseObject(data);
// }

/**
 * Delete video from course.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function deleteVideo(courseId, videoId) {
  await getAuthenticatedHttpClient()
    .delete(`${getCoursVideosApiUrl(courseId)}/${videoId}`);
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
export async function addVideo(courseId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await getAuthenticatedHttpClient()
    .post(getCoursVideosApiUrl(courseId), formData);
  return camelCaseObject(data);
}

export async function uploadVideo(
  courseId,
  uploadUrl,
  uploadFile,
  edxVideoId,
) {
  const formData = new FormData();
  formData.append('uploaded-file', uploadFile);
  const uploadErrors = [];
  await fetch(uploadUrl, {
    method: 'PUT',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(async () => {
      await getAuthenticatedHttpClient()
        .post(getCoursVideosApiUrl(courseId), [{
          edxVideoId,
          message: 'Upload completed',
          status: 'upload_completed',
        }]);
    })
    .catch(async () => {
      uploadErrors.push(`Failed to upload ${uploadFile.name}.`);
      await getAuthenticatedHttpClient()
        .post(getCoursVideosApiUrl(courseId), [{
          edxVideoId,
          message: 'Upload failed',
          status: 'upload_failed',
        }]);
    });
  return uploadErrors;
}
