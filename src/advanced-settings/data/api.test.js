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
    it('should fetch and unformat course advanced settings', async () => {
      const fakeData = {
        keyCamelCase: {
          value: {
            snake_case: 'snake_case',
            camelCase: 'camelCase',
            PascalCase: 'PascalCase',
            'kebab-case': 'kebab-case',
            UPPER_CASE: 'UPPER_CASE',
            lowercase: 'lowercase',
            UPPERCASE: 'UPPERCASE',
            'Title Case': 'Title Case',
            'dot.case': 'dot.case',
            SCREAMING_SNAKE_CASE: 'SCREAMING_SNAKE_CASE',
            MixedCase: 'MixedCase',
            'Train-Case': 'Train-Case',
            nestedOption: {
              anotherOption: 'nestedContent',
            },
          },
        },
      };

      mockHttpClient.get.mockResolvedValue({ data: fakeData });

      const result = await getCourseAdvancedSettings('course-v1:Test+T101+2024');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${process.env.STUDIO_BASE_URL}/api/contentstore/v0/advanced_settings/course-v1:Test+T101+2024?fetch_all=0`,
      );
      expect(result).toEqual(fakeData);
    });
  });

  describe('updateCourseAdvancedSettings', () => {
    it('should update and unformat course advanced settings', async () => {
      const fakeData = {
        keyCamelCase: {
          value: {
            snake_case: 'snake_case',
            camelCase: 'camelCase',
            PascalCase: 'PascalCase',
            'kebab-case': 'kebab-case',
            UPPER_CASE: 'UPPER_CASE',
            lowercase: 'lowercase',
            UPPERCASE: 'UPPERCASE',
            'Title Case': 'Title Case',
            'dot.case': 'dot.case',
            SCREAMING_SNAKE_CASE: 'SCREAMING_SNAKE_CASE',
            MixedCase: 'MixedCase',
            'Train-Case': 'Train-Case',
            nestedOption: {
              anotherOption: 'nestedContent',
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
      expect(result).toEqual(fakeData);
    });
  });

  describe('getProctoringExamErrors', () => {
    it('should fetch proctoring errors and return unformat object', async () => {
      const fakeData = {
        keyCamelCase: {
          value: {
            snake_case: 'snake_case',
            camelCase: 'camelCase',
            PascalCase: 'PascalCase',
            'kebab-case': 'kebab-case',
            UPPER_CASE: 'UPPER_CASE',
            lowercase: 'lowercase',
            UPPERCASE: 'UPPERCASE',
            'Title Case': 'Title Case',
            'dot.case': 'dot.case',
            SCREAMING_SNAKE_CASE: 'SCREAMING_SNAKE_CASE',
            MixedCase: 'MixedCase',
            'Train-Case': 'Train-Case',
            nestedOption: {
              anotherOption: 'nestedContent',
            },
          },
        },
      };

      mockHttpClient.get.mockResolvedValue({ data: fakeData });

      const result = await getProctoringExamErrors('course-v1:Test+T101+2024');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${process.env.STUDIO_BASE_URL}/api/contentstore/v1/proctoring_errors/course-v1:Test+T101+2024`,
      );
      expect(result).toEqual(fakeData);
    });
  });
});
