import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig, ensureConfig } from '@edx/frontend-platform';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Studio API service');

const studioBaseUrl = getConfig().STUDIO_BASE_URL;

class StudioApiService {
  static getProctoredExamSettingsData(courseID) {
    const apiClient = getAuthenticatedHttpClient();
    const url = `${studioBaseUrl}/api/contentstore/v1/proctored_exam_settings/${courseID}`;
    return apiClient.get(url);
  }
}

export default StudioApiService;
