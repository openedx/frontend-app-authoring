import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  getConfig, camelCaseObject, modifyObjectKeys, snakeCaseObject,
} from '@edx/frontend-platform';
import {
  getCourseAdvancedSettings,
  updateCourseAdvancedSettings,
  getProctoringExamErrors,
} from './api';
import { convertObjectToSnakeCase } from '../../utils';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
  camelCaseObject: jest.fn(),
  modifyObjectKeys: jest.fn(),
  snakeCaseObject: jest.fn(),
}));

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
    getConfig.mockReturnValue({ STUDIO_BASE_URL: 'http://studio.test' });
  });

  describe('getCourseAdvancedSettings', () => {
    it('should fetch and format course advanced settings', async () => {
      const fakeData = { key: { value: 'some_value' } };
      const camelCased = { key: { value: 'some_value' } };
      const modified = { key: { value: 'some_value_snake' } };

      mockHttpClient.get.mockResolvedValue({ data: fakeData });
      camelCaseObject.mockReturnValue(camelCased);
      snakeCaseObject.mockReturnValue('some_value_snake');
      modifyObjectKeys.mockImplementation((obj, fn) => {
        Object.keys(obj).forEach(fn);
        return modified;
      });

      const result = await getCourseAdvancedSettings('course-v1:Test+T101+2024');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'http://studio.test/api/contentstore/v0/advanced_settings/course-v1:Test+T101+2024?fetch_all=0',
      );
      expect(result).toEqual(modified);
    });
  });

  describe('updateCourseAdvancedSettings', () => {
    it('should update and format course advanced settings', async () => {
      const input = { key: 'value' };
      const snakeInput = { key: 'snake_value' };
      const serverData = { key: { value: 'server_value' } };
      const camelCased = { key: { value: 'server_value' } };
      const modified = { key: { value: 'formatted_value' } };

      convertObjectToSnakeCase.mockReturnValue(snakeInput);
      mockHttpClient.patch.mockResolvedValue({ data: serverData });
      camelCaseObject.mockReturnValue(camelCased);
      snakeCaseObject.mockReturnValue('formatted_value');
      modifyObjectKeys.mockImplementation((obj, fn) => {
        Object.keys(obj).forEach(fn);
        return modified;
      });

      const result = await updateCourseAdvancedSettings('course-v1:Test+T101+2024', input);
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        'http://studio.test/api/contentstore/v0/advanced_settings/course-v1:Test+T101+2024',
        snakeInput,
      );
      expect(result).toEqual(modified);
    });
  });

  describe('getProctoringExamErrors', () => {
    it('should fetch proctoring errors and return camelCase object', async () => {
      const fakeErrors = { errors: [] };
      const camelCased = { errors: [] };

      mockHttpClient.get.mockResolvedValue({ data: fakeErrors });
      camelCaseObject.mockReturnValue(camelCased);

      const result = await getProctoringExamErrors('course-v1:Test+T101+2024');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'http://studio.test/api/contentstore/v1/proctoring_errors/course-v1:Test+T101+2024',
      );
      expect(result).toEqual(camelCased);
    });
  });
});
