import {
  describe, it, beforeEach, afterEach,
  mock,
} from 'node:test';
import assert from 'node:assert/strict';
import * as frontendPlatform from '@edx/frontend-platform';

import {
  getFileSizeToClosestByte,
  convertObjectToSnakeCase,
  deepConvertingKeysToCamelCase,
  deepConvertingKeysToSnakeCase,
  transformKeysToCamelCase,
  parseArrayOrObjectValues,
  convertToDateFromString,
  convertToStringFromDate,
  isValidDate,
  getPagePath,
} from './utils';

describe('FilesAndUploads utils', () => {
  describe('getFileSizeToClosestByte', () => {
    it('should return file size with B for bytes', () => {
      const expectedSize = '219.00 B';
      const actualSize = getFileSizeToClosestByte(219);
      assert.equal(actualSize, expectedSize);
    });
    it('should return file size with KB for kilobytes', () => {
      const expectedSize = '21.90 KB';
      const actualSize = getFileSizeToClosestByte(21900);
      assert.equal(actualSize, expectedSize);
    });
    it('should return file size with MB for megabytes', () => {
      const expectedSize = '2.19 MB';
      const actualSize = getFileSizeToClosestByte(2190000);
      assert.equal(actualSize, expectedSize);
    });
    it('should return file size with GB for gigabytes', () => {
      const expectedSize = '2.03 GB';
      const actualSize = getFileSizeToClosestByte(2034190000);
      assert.equal(actualSize, expectedSize);
    });
    it('should return file size with TB for terabytes', () => {
      const expectedSize = '1.99 TB';
      const actualSize = getFileSizeToClosestByte(1988034190000);
      assert.equal(actualSize, expectedSize);
    });
    it('should return file size with TB for larger numbers', () => {
      const expectedSize = '1234.56 TB';
      const actualSize = getFileSizeToClosestByte(1234560000000000);
      assert.equal(actualSize, expectedSize);
    });
  });

  describe('convertObjectToSnakeCase', () => {
    it('converts object keys to snake_case', () => {
      const input = { firstName: 'John', lastName: 'Doe' };
      const expectedOutput = { first_name: { value: 'John' }, last_name: { value: 'Doe' } };
      assert.deepStrictEqual(convertObjectToSnakeCase(input), expectedOutput);
    });

    it('converts object keys to snake_case with unpacked values', () => {
      const input = { firstName: 'John', lastName: 'Doe' };
      const expectedOutput = { first_name: 'John', last_name: 'Doe' };
      assert.deepStrictEqual(convertObjectToSnakeCase(input, true), expectedOutput);
    });
  });

  describe('deepConvertingKeysToCamelCase', () => {
    it('converts object keys to camelCase', () => {
      const input = { first_name: 'John', last_name: 'Doe' };
      const expectedOutput = { firstName: 'John', lastName: 'Doe' };
      assert.deepStrictEqual(deepConvertingKeysToCamelCase(input), expectedOutput);
    });

    it('converts nested object keys to camelCase', () => {
      const input = { user_info: { first_name: 'John', last_name: 'Doe' } };
      const expectedOutput = { userInfo: { firstName: 'John', lastName: 'Doe' } };
      assert.deepStrictEqual(deepConvertingKeysToCamelCase(input), expectedOutput);
    });
  });

  describe('deepConvertingKeysToSnakeCase', () => {
    it('converts object keys to snake_case', () => {
      const input = { firstName: 'John', lastName: 'Doe' };
      const expectedOutput = { first_name: 'John', last_name: 'Doe' };
      assert.deepStrictEqual(deepConvertingKeysToSnakeCase(input), expectedOutput);
    });

    it('converts nested object keys to snake_case', () => {
      const input = { userInfo: { firstName: 'John', lastName: 'Doe' } };
      const expectedOutput = { user_info: { first_name: 'John', last_name: 'Doe' } };
      assert.deepStrictEqual(deepConvertingKeysToSnakeCase(input), expectedOutput);
    });
  });

  describe('transformKeysToCamelCase', () => {
    it('transforms a single key to camelCase', () => {
      const input = { key: 'first_name' };
      const expectedOutput = 'firstName';
      assert.equal(transformKeysToCamelCase(input), expectedOutput);
    });
  });

  describe('parseArrayOrObjectValues', () => {
    it('parses stringified JSON values', () => {
      const input = { key1: '123', key2: '{"name":"John"}' };
      const expectedOutput = { key1: '123', key2: { name: 'John' } };
      assert.deepStrictEqual(parseArrayOrObjectValues(input), expectedOutput);
    });

    it('returns non-JSON values as is', () => {
      const input = { key1: '123', key2: 'John' };
      const expectedOutput = { key1: '123', key2: 'John' };
      assert.deepStrictEqual(parseArrayOrObjectValues(input), expectedOutput);
    });
  });

  describe('convertToDateFromString', () => {
    it('converts a date string to a Date object', () => {
      const dateStr = '2023-10-01T12:00:00Z';
      const date = convertToDateFromString(dateStr);
      assert.ok(date instanceof Date);
      assert.equal(date?.toISOString(), '2023-10-01T12:00:00.000Z');
    });

    it('returns undefined for invalid date strings', () => {
      const dateStr = '';
      const date = convertToDateFromString(dateStr);
      assert.equal(date, undefined);
    });
  });

  describe('convertToStringFromDate', () => {
    it('converts a Date object to a date string', () => {
      const date = new Date('2023-10-01T12:00:00Z');
      const dateStr = convertToStringFromDate(date);
      assert.equal(dateStr, '2023-10-01T12:00:00Z');
    });

    it('returns an empty string for invalid Date objects', () => {
      const date = null;
      const dateStr = convertToStringFromDate(date);
      assert.equal(dateStr, '');
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid dates', () => {
      const date = new Date('2023-10-01T12:00:00Z');
      assert.equal(isValidDate(date), true);
    });

    it('returns false for invalid dates', () => {
      const date = new Date('invalid-date');
      assert.equal(isValidDate(date), false);
    });
  });
});

describe('getPagePath', () => {
  beforeEach(() => {
    mock.method(frontendPlatform, 'getConfig', () => ({
      PUBLIC_PATH: '/authoring/',
      STUDIO_BASE_URL: 'https://studio.example.com',
    }));
    mock.method(frontendPlatform, 'getPath', (path?: string) => path || '');
    mock.method(frontendPlatform, 'ensureConfig', () => undefined);
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it('returns MFE path when isMfePageEnabled is true and urlParameter is "tabs"', () => {
    const courseId = '12345';
    const isMfePageEnabled = 'true';
    const urlParameter = 'tabs';

    const result = getPagePath(courseId, isMfePageEnabled, urlParameter);
    assert.equal(result, `/course/${courseId}/pages-and-resources`);
  });

  it('returns MFE path when isMfePageEnabled is true and urlParameter is not "tabs"', () => {
    const courseId = '12345';
    const isMfePageEnabled = 'true';
    const urlParameter = 'other-page';

    const result = getPagePath(courseId, isMfePageEnabled, urlParameter);
    assert.equal(result, `/course/${courseId}/${urlParameter}`);
  });
});
