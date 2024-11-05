import {
  parseLibraryImageData, getLibraryImageAssets, getFileMimeType, getFileName, LibraryAssetResponse,
} from './formatLibraryImgRequest';

// Mock the StrictDict function to avoid unnecessary complexity in the test
jest.mock('./StrictDict', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    gif: 'image/gif',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    ico: 'image/x-icon',
  }),
}));

describe('parseLibraryImageData', () => {
  describe('getFileName', () => {
    it('should return the file name from the path', () => {
      const data: LibraryAssetResponse = {
        path: 'static/example.jpg',
        size: 12345,
        url: 'http://example.com/static/example.jpg',
      };

      const result = getFileName(data);
      expect(result).toBe('example.jpg');
    });
  });

  describe('getFileMimeType', () => {
    it('should return the correct MIME type for supported file extensions', () => {
      const data: LibraryAssetResponse = {
        path: 'static/example.jpg',
        size: 12345,
        url: 'http://example.com/static/example.jpg',
      };

      const result = getFileMimeType(data);
      expect(result).toBe('image/jpg');
    });

    it('should return "unknown" for unsupported file extensions', () => {
      const data: LibraryAssetResponse = {
        path: '/assets/files/unknown.xyz',
        size: 12345,
        url: 'http://example.com/assets/files/unknown.xyz',
      };

      const result = getFileMimeType(data);
      expect(result).toBe('unknown');
    });
  });

  describe('parseLibraryImageData', () => {
    it('should correctly parse a valid LibraryAssetResponse into TinyMCEImageData', () => {
      const data: LibraryAssetResponse = {
        path: 'static/example.jpg',
        size: 12345,
        url: 'http://example.com/static/example.jpg',
      };

      const result = parseLibraryImageData(data);
      expect(result).toEqual({
        displayName: 'example.jpg',
        contentType: 'image/jpg',
        url: 'http://example.com/static/example.jpg',
        externalUrl: 'http://example.com/static/example.jpg',
        portableUrl: 'static/example.jpg',
        thumbnail: 'http://example.com/static/example.jpg',
        id: 'static/example.jpg',
        locked: false,
      });
    });

    it('should handle unknown MIME types by setting a fallback MIME type', () => {
      const data: LibraryAssetResponse = {
        path: '/assets/files/unknown.xyz',
        size: 12345,
        url: 'http://example.com/assets/files/unknown.xyz',
      };

      const result = parseLibraryImageData(data);
      expect(result.contentType).toBe('unknown');
    });
  });

  describe('getLibraryImageAssets', () => {
    it('should filter out assets with unsupported MIME types and return a dictionary of valid images', () => {
      const assets: LibraryAssetResponse[] = [
        { path: 'static/example.jpg', size: 12345, url: 'http://example.com/static/example.jpg' },
        { path: '/assets/files/unsupported.xyz', size: 67890, url: 'http://example.com/assets/files/unsupported.xyz' },
      ];

      const result = getLibraryImageAssets(assets);
      expect(result).toEqual({
        'example.jpg': {
          displayName: 'example.jpg',
          contentType: 'image/jpg',
          url: 'http://example.com/static/example.jpg',
          externalUrl: 'http://example.com/static/example.jpg',
          portableUrl: 'static/example.jpg',
          thumbnail: 'http://example.com/static/example.jpg',
          id: 'static/example.jpg',
          locked: false,
        },
      });
    });

    it('should return an empty object if no valid images are found', () => {
      const assets: LibraryAssetResponse[] = [
        { path: '/assets/files/unsupported.xyz', size: 67890, url: 'http://example.com/assets/files/unsupported.xyz' },
      ];

      const result = getLibraryImageAssets(assets);
      expect(result).toEqual({});
    });
  });
});
