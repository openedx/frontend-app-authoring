import { getConfig, getPath } from '@edx/frontend-platform';

import { getFileSizeToClosestByte, createCorrectInternalRoute, constructLibraryAuthoringURL } from './utils';

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

      const checkPath = '/some/path';
      const result = createCorrectInternalRoute(checkPath);

      expect(result).toBe('/course-authoring/some/path');
    });
  });
});

describe('constructLibraryAuthoringURL', () => {
  it('should construct URL given no trailing `/` in base and no starting `/` in path', () => {
    const libraryAuthoringMfeUrl = 'http://localhost:3001';
    const path = 'example';
    const constructedURL = constructLibraryAuthoringURL(libraryAuthoringMfeUrl, path);
    expect(constructedURL).toEqual('http://localhost:3001/example');
  });
  it('should construct URL given a trailing `/` in base and no starting `/` in path', () => {
    const libraryAuthoringMfeUrl = 'http://localhost:3001/';
    const path = 'example';
    const constructedURL = constructLibraryAuthoringURL(libraryAuthoringMfeUrl, path);
    expect(constructedURL).toEqual('http://localhost:3001/example');
  });
  it('should construct URL with no trailing `/` in base and a starting `/` in path', () => {
    const libraryAuthoringMfeUrl = 'http://localhost:3001';
    const path = '/example';
    const constructedURL = constructLibraryAuthoringURL(libraryAuthoringMfeUrl, path);
    expect(constructedURL).toEqual('http://localhost:3001/example');
  });
  it('should construct URL with a trailing `/` in base and a starting `/` in path', () => {
    const libraryAuthoringMfeUrl = 'http://localhost:3001/';
    const path = '/example';
    const constructedURL = constructLibraryAuthoringURL(libraryAuthoringMfeUrl, path);
    expect(constructedURL).toEqual('http://localhost:3001/example');
  });
});
