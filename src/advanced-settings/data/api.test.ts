import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getProctoringExamErrors } from './api';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('advanced settings API', () => {
  const mockHttpClient = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore since `getAuthenticatedHttpClient` is mocked. TODO: convert this test to use `initializeMocks()`
    getAuthenticatedHttpClient.mockReturnValue(mockHttpClient);
  });

  describe('getProctoringExamErrors', () => {
    it('should fetch proctoring errors and keep the settings url as a string', async () => {
      const fakeData = {
        mfe_proctored_exam_settings_url: '/course/course-v1:Test+T101+2024/pages-and-resources/proctoring/settings',
        proctoring_errors: [
          { key: 'proctoring_provider', message: 'error message', model: { display_name: 'Proctoring Provider' } },
        ],
      };
      mockHttpClient.get.mockResolvedValue({ data: fakeData });

      const result = await getProctoringExamErrors('course-v1:Test+T101+2024');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${process.env.STUDIO_BASE_URL}/api/contentstore/v1/proctoring_errors/course-v1:Test+T101+2024`,
      );
      expect(result).toEqual({
        mfeProctoredExamSettingsUrl: fakeData.mfe_proctored_exam_settings_url,
        proctoringErrors: [
          { key: 'proctoring_provider', message: 'error message', model: { displayName: 'Proctoring Provider' } },
        ],
      });
    });
  });
});
