import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

class ExamsApiService {
  static isAvailable() {
    return !!this.getExamsBaseUrl();
  }

  static getExamsBaseUrl() {
    return getConfig().EXAMS_BASE_URL;
  }

  static getExamConfigurationUrl(courseId) {
    return `${ExamsApiService.getExamsBaseUrl()}/api/v1/configs/course_id/${courseId}`;
  }

  static getAvailableProviders() {
    const apiClient = getAuthenticatedHttpClient();
    const providersUrl = `${ExamsApiService.getExamsBaseUrl()}/api/v1/providers`;
    return apiClient.get(providersUrl);
  }

  static getCourseExamConfiguration(courseId) {
    const apiClient = getAuthenticatedHttpClient();
    return apiClient.get(this.getExamConfigurationUrl(courseId));
  }

  static saveCourseExamConfiguration(courseId, dataToSave) {
    const apiClient = getAuthenticatedHttpClient();
    return apiClient.patch(this.getExamConfigurationUrl(courseId), dataToSave);
  }
}

export default ExamsApiService;
