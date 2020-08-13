import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig, ensureConfig } from '@edx/frontend-platform';

ensureConfig([
  'LMS_BASE_URL',
], 'LMS API service');

const lmsBaseUrl = getConfig().LMS_BASE_URL;

class LmsApiService {
  static getCourseDetailsUrl(courseID) {
    return `${lmsBaseUrl}/api/courses/v1/courses/${courseID}`;
  }

  static getCourseDetailsData(courseID) {
    const apiClient = getAuthenticatedHttpClient();
    const url = LmsApiService.getCourseDetailsUrl(courseID);
    return apiClient.get(url);
  }
}

export default LmsApiService;
