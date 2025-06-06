import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  getCourseAdvancedSettings,
  updateCourseAdvancedSettings,
  getProctoringExamErrors,
} from './api';
import { convertObjectToSnakeCase } from '../../utils';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('../../utils', () => ({
  convertObjectToSnakeCase: jest.fn(),
}));

describe('courseSettings API', () => {
  const mockHttpClient = {
    get: jest.fn(),
    patch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getAuthenticatedHttpClient.mockReturnValue(mockHttpClient);
  });

  describe('getCourseAdvancedSettings', () => {
    it('should fetch and format course advanced settings', async () => {
      const fakeData = {
        keyCamelCase: {
          value: {
            oneOption: 'content-1',
            two_option: 'content-2',
            threeOption: 'threeContent',
            nestedOption: {
              anotherOption: 'nestedContent',
            },
          },
        },
      };
      const expected = {
        keyCamelCase: {
          value: {
            one_option: 'content-1',
            two_option: 'content-2',
            three_option: 'threeContent',
            nested_option: {
              another_option: 'nestedContent',
            },
          },
        },
      };

      mockHttpClient.get.mockResolvedValue({ data: fakeData });

      const result = await getCourseAdvancedSettings('course-v1:Test+T101+2024');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${process.env.STUDIO_BASE_URL}/api/contentstore/v0/advanced_settings/course-v1:Test+T101+2024?fetch_all=0`,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateCourseAdvancedSettings', () => {
    it('should update and format course advanced settings', async () => {
      const fakeData = {
        keyCamelCase: {
          value: {
            oneOption: 'content-1',
            two_option: 'content-2',
            threeOption: 'threeContent',
            nestedOption: {
              anotherOption: 'nestedContent',
            },
          },
        },
      };
      const expected = {
        keyCamelCase: {
          value: {
            one_option: 'content-1',
            two_option: 'content-2',
            three_option: 'threeContent',
            nested_option: {
              another_option: 'nestedContent',
            },
          },
        },
      };

      convertObjectToSnakeCase.mockReturnValue({});
      mockHttpClient.patch.mockResolvedValue({ data: fakeData });

      const result = await updateCourseAdvancedSettings('course-v1:Test+T101+2024', {});
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        `${process.env.STUDIO_BASE_URL}/api/contentstore/v0/advanced_settings/course-v1:Test+T101+2024`,
        {},
      );
      expect(result).toEqual(expected);
    });
  });

  describe('getProctoringExamErrors', () => {
    it('should fetch proctoring errors and return camelCase object', async () => {
      const fakeData = {
        keyCamelCase: {
          value: {
            oneOption: 'content-1',
            two_option: 'content-2',
            threeOption: 'threeContent',
          },
        },
      };
      const expected = {
        keyCamelCase: {
          value: {
            oneOption: 'content-1',
            twoOption: 'content-2',
            threeOption: 'threeContent',
          },
        },
      };

      mockHttpClient.get.mockResolvedValue({ data: fakeData });

      const result = await getProctoringExamErrors('course-v1:Test+T101+2024');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${process.env.STUDIO_BASE_URL}/api/contentstore/v1/proctoring_errors/course-v1:Test+T101+2024`,
      );
      expect(result).toEqual(expected);
    });
  });
});
