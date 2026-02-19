import { initializeMocks } from '@src/testUtils';
import {
  CourseBestPracticesRequest,
  CourseLaunchRequest,
  getCourseBestPractices,
  getCourseBestPracticesApiUrl,
  getCourseLaunch,
  getCourseLaunchApiUrl,
} from './api';

let axiosMock;

describe('course checklist data API', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  describe('getCourseBestPractices', () => {
    it('should fetch course best practices', async () => {
      const params: CourseBestPracticesRequest = {
        courseId: 'course-v1:edX+DemoX+Demo_Course',
        excludeGraded: true,
        all: true,
      };
      const url = getCourseBestPracticesApiUrl(params);
      axiosMock.onGet(url).reply(200, { is_self_paced: false });

      const result = await getCourseBestPractices(params);

      expect(axiosMock.history.get[0].url).toEqual(url);
      expect(result).toEqual({ isSelfPaced: false });
    });
  });

  describe('getCourseLaunch', () => {
    it('should fetch course launch validation', async () => {
      const params: CourseLaunchRequest = {
        courseId: 'course-v1:edX+DemoX+Demo_Course',
        gradedOnly: true,
        validateOras: true,
        all: true,
      };
      const url = getCourseLaunchApiUrl(params);
      axiosMock.onGet(url).reply(200, { is_self_paced: false });

      const result = await getCourseLaunch(params);

      expect(axiosMock.history.get[0].url).toEqual(url);
      expect(result).toEqual({ isSelfPaced: false });
    });
  });
});
