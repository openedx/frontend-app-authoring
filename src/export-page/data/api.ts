import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const postExportCourseApiUrl = (courseId: string) => new URL(`export/${courseId}`, getApiBaseUrl()).href;
export const getExportStatusApiUrl = (courseId: string) => new URL(`export_status/${courseId}`, getApiBaseUrl()).href;

export interface ExportStatusData {
  exportStatus: number;
  exportOutput?: string;
  exportError?: {
    rawErrorMsg?: string;
    editUnitUrl?: string;
  }
}

export async function startCourseExporting(courseId: string): Promise<ExportStatusData> {
  const { data } = await getAuthenticatedHttpClient()
    .post(postExportCourseApiUrl(courseId));
  return camelCaseObject(data);
}

export async function getExportStatus(courseId: string): Promise<ExportStatusData> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getExportStatusApiUrl(courseId));
  return camelCaseObject(data);
}
