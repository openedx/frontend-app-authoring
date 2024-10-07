import { getConfig, getPath } from '@edx/frontend-platform';

import {
  getFileSizeToClosestByte,
  createCorrectInternalRoute,
  convertObjectToSnakeCase,
  deepConvertingKeysToCamelCase,
  deepConvertingKeysToSnakeCase,
  transformKeysToCamelCase,
  parseArrayOrObjectValues,
  convertToDateFromString,
  convertToStringFromDate,
  isValidDate,
} from './utils';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
  ensureConfig: jest.fn(),
  getPath: jest.fn(),
}));

describe('FilesAndUploads utils', () => {
  describe('getFileSizeToClosestByte', () => {
    it('should return file size with B for bytes', () => {
      const expectedSize = '219.00 B';
      const actualSize = getFileSizeToClosestByte(219);
      expect(expectedSize).toEqual(actualSize);
    });
    it('should return file size with KB for kilobytes', () => {
      const expectedSize = '21.90 KB';
      const actualSize = getFileSizeToClosestByte(21900);
      expect(expectedSize).toEqual(actualSize);
    });
    it('should return file size with MB for megabytes', () => {
      const expectedSize = '2.19 MB';
      const actualSize = getFileSizeToClosestByte(2190000);
      expect(expectedSize).toEqual(actualSize);
    });
    it('should return file size with GB for gigabytes', () => {
      const expectedSize = '2.03 GB';
      const actualSize = getFileSizeToClosestByte(2034190000);
      expect(expectedSize).toEqual(actualSize);
    });
    it('should return file size with TB for terabytes', () => {
      const expectedSize = '1.99 TB';
      const actualSize = getFileSizeToClosestByte(1988034190000);
      expect(expectedSize).toEqual(actualSize);
    });
    it('should return file size with TB for larger numbers', () => {
      const expectedSize = '1234.56 TB';
      const actualSize = getFileSizeToClosestByte(1234560000000000);
      expect(expectedSize).toEqual(actualSize);
    });
  });

  describe('createCorrectInternalRoute', () => {
    beforeEach(() => {
      getConfig.mockReset();
      getPath.mockReset();
    });

    it('returns the correct internal route when checkPath is not prefixed with basePath', () => {
      getConfig.mockReturnValue({ PUBLIC_PATH: 'example.com' });
      getPath.mockReturnValue('/');

      const checkPath = '/some/path';
      const result = createCorrectInternalRoute(checkPath);

      expect(result).toBe('/some/path');
    });

    it('returns the input checkPath when it is already prefixed with basePath', () => {
      getConfig.mockReturnValue({ PUBLIC_PATH: 'example.com' });
      getPath.mockReturnValue('/course-authoring');

      const checkPath = '/course-authoring/some/path';
      const result = createCorrectInternalRoute(checkPath);

      expect(result).toBe('/course-authoring/some/path');
    });

    it('handles basePath ending with a slash correctly', () => {
      getConfig.mockReturnValue({ PUBLIC_PATH: 'example.com/' });
      getPath.mockReturnValue('/course-authoring/');

      const checkPath = '/course-authoring/some/path';
      const result = createCorrectInternalRoute(checkPath);

      expect(result).toBe('/course-authoring/some/path');
    });

    it('returns checkPath as is when basePath is part of checkPath', () => {
      getConfig.mockReturnValue({ PUBLIC_PATH: 'example.com' });
      getPath.mockReturnValue('/example-base/');

      const checkPath = '/example-base/some/path';
      const result = createCorrectInternalRoute(checkPath);

      expect(result).toBe(checkPath);
    });
  });

  describe('convertObjectToSnakeCase', () => {
    it('converts object keys to snake_case', () => {
      const input = { firstName: 'John', lastName: 'Doe' };
      const expectedOutput = { first_name: { value: 'John' }, last_name: { value: 'Doe' } };
      expect(convertObjectToSnakeCase(input)).toEqual(expectedOutput);
    });

    it('converts object keys to snake_case with unpacked values', () => {
      const input = { firstName: 'John', lastName: 'Doe' };
      const expectedOutput = { first_name: 'John', last_name: 'Doe' };
      expect(convertObjectToSnakeCase(input, true)).toEqual(expectedOutput);
    });
  });

  describe('deepConvertingKeysToCamelCase', () => {
    it('converts object keys to camelCase', () => {
      const input = { first_name: 'John', last_name: 'Doe' };
      const expectedOutput = { firstName: 'John', lastName: 'Doe' };
      expect(deepConvertingKeysToCamelCase(input)).toEqual(expectedOutput);
    });

    it('converts nested object keys to camelCase', () => {
      const input = { user_info: { first_name: 'John', last_name: 'Doe' } };
      const expectedOutput = { userInfo: { firstName: 'John', lastName: 'Doe' } };
      expect(deepConvertingKeysToCamelCase(input)).toEqual(expectedOutput);
    });
  });

  describe('deepConvertingKeysToSnakeCase', () => {
    it('converts object keys to snake_case', () => {
      const input = { firstName: 'John', lastName: 'Doe' };
      const expectedOutput = { first_name: 'John', last_name: 'Doe' };
      expect(deepConvertingKeysToSnakeCase(input)).toEqual(expectedOutput);
    });

    it('converts nested object keys to snake_case', () => {
      const input = { userInfo: { firstName: 'John', lastName: 'Doe' } };
      const expectedOutput = { user_info: { first_name: 'John', last_name: 'Doe' } };
      expect(deepConvertingKeysToSnakeCase(input)).toEqual(expectedOutput);
    });
  });

  describe('transformKeysToCamelCase', () => {
    it('transforms a single key to camelCase', () => {
      const input = { key: 'first_name' };
      const expectedOutput = 'firstName';
      expect(transformKeysToCamelCase(input)).toEqual(expectedOutput);
    });
  });

  describe('parseArrayOrObjectValues', () => {
    it('parses stringified JSON values', () => {
      const input = { key1: '123', key2: '{"name":"John"}' };
      const expectedOutput = { key1: '123', key2: { name: 'John' } };
      expect(parseArrayOrObjectValues(input)).toEqual(expectedOutput);
    });

    it('returns non-JSON values as is', () => {
      const input = { key1: '123', key2: 'John' };
      const expectedOutput = { key1: '123', key2: 'John' };
      expect(parseArrayOrObjectValues(input)).toEqual(expectedOutput);
    });
  });

  describe('convertToDateFromString', () => {
    it('converts a date string to a Date object', () => {
      const dateStr = '2023-10-01T12:00:00Z';
      const date = convertToDateFromString(dateStr);
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe('2023-10-01T12:00:00.000Z');
    });

    it('returns an empty string for invalid date strings', () => {
      const dateStr = '';
      const date = convertToDateFromString(dateStr);
      expect(date).toBe('');
    });
  });

  describe('convertToStringFromDate', () => {
    it('converts a Date object to a date string', () => {
      const date = new Date('2023-10-01T12:00:00Z');
      const dateStr = convertToStringFromDate(date);
      expect(dateStr).toBe('2023-10-01T12:00:00Z');
    });

    it('returns an empty string for invalid Date objects', () => {
      const date = null;
      const dateStr = convertToStringFromDate(date);
      expect(dateStr).toBe('');
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid dates', () => {
      const date = new Date('2023-10-01T12:00:00Z');
      expect(isValidDate(date)).toBe(true);
    });

    it('returns false for invalid dates', () => {
      const date = new Date('invalid-date');
      expect(isValidDate(date)).toBe(false);
    });
  });
});
