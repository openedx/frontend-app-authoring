import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  getAdvancedSettingsErrors,
  getCourseAdvancedSettings,
  updateCourseAdvancedSettings,
  getProctoringExamErrors,
} from './api';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('courseSettings API', () => {
  const mockHttpClient = {
    get: jest.fn(),
    patch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore since `getAuthenticatedHttpClient` is mocked. TODO: convert this test to use `initializeMocks()`
    getAuthenticatedHttpClient.mockReturnValue(mockHttpClient);
  });

  describe('getCourseAdvancedSettings', () => {
    it('should fetch and unformat course advanced settings', async () => {
      const fakeData = {
        key_snake_case: {
          display_name: 'To come camelCase',
          testCamelCase: 'This key must not be formatted',
          PascalCase: 'To come camelCase',
          'kebab-case': 'To come camelCase',
          UPPER_CASE: 'To come camelCase',
          lowercase: 'This key must not be formatted',
          UPPERCASE: 'To come lowercase',
          'Title Case': 'To come camelCase',
          'dot.case': 'To come camelCase',
          SCREAMING_SNAKE_CASE: 'To come camelCase',
          MixedCase: 'To come camelCase',
          'Train-Case': 'To come camelCase',
          nestedOption: {
            anotherOption: 'To come camelCase',
          },
          // value is an object with various cases
          // this contain must not be formatted to camelCase
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
      const expected = {
        keySnakeCase: {
          displayName: 'To come camelCase',
          testCamelCase: 'This key must not be formatted',
          pascalCase: 'To come camelCase',
          kebabCase: 'To come camelCase',
          upperCase: 'To come camelCase',
          lowercase: 'This key must not be formatted',
          uppercase: 'To come lowercase',
          titleCase: 'To come camelCase',
          dotCase: 'To come camelCase',
          screamingSnakeCase: 'To come camelCase',
          mixedCase: 'To come camelCase',
          trainCase: 'To come camelCase',
          nestedOption: {
            anotherOption: 'To come camelCase',
          },
          value: fakeData.key_snake_case.value,
        },
      };

      mockHttpClient.get.mockResolvedValue({ data: fakeData });

      const result = await getCourseAdvancedSettings('course-v1:Test+T101+2024');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${process.env.STUDIO_BASE_URL}/api/authoring/v1/courses/course-v1:Test+T101+2024/advanced_settings/`,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateCourseAdvancedSettings', () => {
    it('should update and unformat course advanced settings', async () => {
      const fakeData = {
        key_snake_case: {
          display_name: 'To come camelCase',
          testCamelCase: 'This key must not be formatted', // because already be camelCase
          PascalCase: 'To come camelCase',
          'kebab-case': 'To come camelCase',
          UPPER_CASE: 'To come camelCase',
          lowercase: 'This key must not be formatted', // because camelCase in lowercase not formatted
          UPPERCASE: 'To come lowercase', // because camelCase in UPPERCASE format to lowercase
          'Title Case': 'To come camelCase',
          'dot.case': 'To come camelCase',
          SCREAMING_SNAKE_CASE: 'To come camelCase',
          MixedCase: 'To come camelCase',
          'Train-Case': 'To come camelCase',
          nestedOption: {
            anotherOption: 'To come camelCase',
          },
          // value is an object with various cases
          // this contain must not be formatted to camelCase
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
      const expected = {
        keySnakeCase: {
          displayName: 'To come camelCase',
          testCamelCase: 'This key must not be formatted',
          pascalCase: 'To come camelCase',
          kebabCase: 'To come camelCase',
          upperCase: 'To come camelCase',
          lowercase: 'This key must not be formatted',
          uppercase: 'To come lowercase',
          titleCase: 'To come camelCase',
          dotCase: 'To come camelCase',
          screamingSnakeCase: 'To come camelCase',
          mixedCase: 'To come camelCase',
          trainCase: 'To come camelCase',
          nestedOption: {
            anotherOption: 'To come camelCase',
          },
          value: fakeData.key_snake_case.value,
        },
      };

      mockHttpClient.patch.mockResolvedValue({ data: fakeData });

      const result = await updateCourseAdvancedSettings('course-v1:Test+T101+2024', {});
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        `${process.env.STUDIO_BASE_URL}/api/authoring/v1/courses/course-v1:Test+T101+2024/advanced_settings/`,
        {},
      );
      expect(result).toEqual(expected);
    });
  });

  describe('getAdvancedSettingsErrors', () => {
    const validationError = (data) => ({ response: { status: 400, data } });

    it('lists each refused setting with its messages', () => {
      const error = validationError({
        type: 'https://docs.openedx.org/errors/validation',
        title: 'Validation error',
        status: 400,
        detail: 'The request is not valid.',
        instance: '/api/authoring/v1/courses/course-v1:Test+T101+2024/advanced_settings/',
        errors: {
          days_early_for_beta: ['The value is not valid for this setting.'],
          teams_configuration: [
            'max_team_size must be greater than zero',
            'duplicate ids: alpha',
          ],
        },
      });
      expect(getAdvancedSettingsErrors(error)).toEqual([
        { key: 'days_early_for_beta', message: 'The value is not valid for this setting.' },
        { key: 'teams_configuration', message: 'max_team_size must be greater than zero duplicate ids: alpha' },
      ]);
    });

    it('keeps an error that names no setting', () => {
      const error = validationError({
        status: 400,
        errors: { non_field_errors: ['The settings could not be saved. No setting was changed.'] },
      });
      expect(getAdvancedSettingsErrors(error)).toEqual([
        { key: 'non_field_errors', message: 'The settings could not be saved. No setting was changed.' },
      ]);
    });

    it.each([
      ['a body without errors', validationError({ status: 400, detail: 'Malformed request.' })],
      ['no body', { response: { status: 500 } }],
      ['no response', new Error('Network Error')],
      ['nothing', undefined],
    ])('gives an empty list for %s', (_, error) => {
      expect(getAdvancedSettingsErrors(error)).toEqual([]);
    });
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
