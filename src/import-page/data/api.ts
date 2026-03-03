import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const postImportCourseApiUrl = (courseId) => `${getApiBaseUrl()}/import/${courseId}`;
export const getImportStatusApiUrl = (courseId, fileName) => `${getApiBaseUrl()}/import_status/${courseId}/${fileName}`;

export interface ImportStatusData {
  importStatus: number,
  message?: string,
}

/**
 * Start import course.
 */
export async function startCourseImporting(
  courseId: string,
  fileData: File,
  requestConfig: Record<string, any>,
  updateProgress: (percent: number) => void,
): Promise<ImportStatusData> {
  const chunkSize = 20 * 1000000; // 20 MB
  const fileSize = fileData.size || 0;
  const chunkLength = Math.ceil(fileSize / chunkSize);
  let resp;
  const upload = async (blob, start, stop, index) => {
    const contentRange = `bytes ${start}-${stop}/${fileSize}`;
    const contentDisposition = `attachment; filename="${fileData.name}"`;
    const headers = {
      'Content-Range': contentRange,
      'Content-Disposition': contentDisposition,
    };
    const formData = new FormData();
    formData.append('course-data', blob, fileData.name);
    const { data } = await getAuthenticatedHttpClient()
      .post(
        postImportCourseApiUrl(courseId),
        formData,
        { headers, ...requestConfig },
      );
    const percent = Math.trunc(((1 / chunkLength) * (index + 1)) * 100);
    updateProgress(percent);
    resp = camelCaseObject(data);
  };

  const chunkUpload = async (file, index) => {
    const start = index * chunkSize;
    const stop = start + chunkSize < fileSize ? start + chunkSize : fileSize;
    const blob = file.slice(start, stop, file.type);
    await upload(blob, start, stop - 1, index);
  };

  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < chunkLength; i++) {
    await chunkUpload(fileData, i);
  }

  return resp;
}

/**
 * Get import status.
 */
export async function getImportStatus(
  courseId: string,
  fileName: string,
): Promise<ImportStatusData> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getImportStatusApiUrl(courseId, fileName));

  return camelCaseObject(data);
}
