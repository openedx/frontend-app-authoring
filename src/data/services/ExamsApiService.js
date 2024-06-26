import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { convertObjectToSnakeCase } from '../../utils';

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

  static getAvailableProviders(org) {
    const apiClient = getAuthenticatedHttpClient();
    const providersUrl = `${ExamsApiService.getExamsBaseUrl()}/api/v1/providers${org ? `?org=${org}` : ''}`;
    return apiClient.get(providersUrl);
  }

  static getCourseExamConfiguration(courseId) {
    const apiClient = getAuthenticatedHttpClient();
    return apiClient.get(this.getExamConfigurationUrl(courseId));
  }

  static saveCourseExamConfiguration(courseId, dataToSave) {
    const snakecaseDataToSave = convertObjectToSnakeCase(dataToSave, true);
    const apiClient = getAuthenticatedHttpClient();
    return apiClient.patch(this.getExamConfigurationUrl(courseId), snakecaseDataToSave);
  }
}

export default ExamsApiService;
