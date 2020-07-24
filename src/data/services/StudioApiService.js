import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig, ensureConfig } from '@edx/frontend-platform';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Studio API service');

const studioBaseUrl = getConfig().STUDIO_BASE_URL;

class StudioApiService {
  static getServiceUrl(courseID) {
    return `${studioBaseUrl}/api/contentstore/v1/proctored_exam_settings/${courseID}`;
  }

  static getProctoredExamSettingsData(courseID) {
    const apiClient = getAuthenticatedHttpClient();
    const url = StudioApiService.getServiceUrl(courseID);
    return apiClient.get(url);
  }

  static saveProctoredExamSettingsData(courseID, dataToSave) {
    const apiClient = getAuthenticatedHttpClient();
    const url = StudioApiService.getServiceUrl(courseID);
    return apiClient.post(url, dataToSave);
  }

  static getStudioUrl(courseID) {
    return `${studioBaseUrl}/course/${courseID}`;
  }
}

export default StudioApiService;
