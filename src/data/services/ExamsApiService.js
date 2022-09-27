import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig, ensureConfig } from '@edx/frontend-platform';

ensureConfig([
  'EXAMS_BASE_URL',
], 'Exams API service');

class ExamsApiService {
  static isAvailable() {
    return !!this.getExamsBaseUrl();
  }

  static getExamsBaseUrl() {
    return getConfig().EXAMS_BASE_URL;
  }

  static getAvailableProviders() {
    const providersUrl = `${ExamsApiService.getExamsBaseUrl()}/api/v1/providers`;
    const apiClient = getAuthenticatedHttpClient();
    return apiClient.get(providersUrl);
  }

  static saveCourseExamConfiguration(courseId, dataToSave) {
    const apiClient = getAuthenticatedHttpClient();
    const examConfigUrl = `${ExamsApiService.getExamsBaseUrl()}/api/v1/configs/course_id/${courseId}`;
    return apiClient.patch(examConfigUrl, dataToSave);
  }
}

export default ExamsApiService;
