import {
  parseLibraryImageData, getLibraryImageAssets, isImage, getFileName,
} from './formatLibraryImgRequest';
import { LibraryAssetResponse } from '../../library-authoring/data/api';

const acceptedImgExt = ['jpg'];

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

  describe('isImage', () => {
    it('should return true for supported file extensions', () => {
      const data: LibraryAssetResponse = {
        path: 'static/example.jpg',
        size: 12345,
        url: 'http://example.com/static/example.jpg',
      };
      const result = isImage(data, acceptedImgExt);
      expect(result).toBe(true);
    });

    it('should return false for unsupported file extensions', () => {
      const data: LibraryAssetResponse = {
        path: '/assets/files/unknown.xyz',
        size: 12345,
        url: 'http://example.com/assets/files/unknown.xyz',
      };

      const result = isImage(data, acceptedImgExt);
      expect(result).toBe(false);
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
        url: 'http://example.com/static/example.jpg',
        externalUrl: 'http://example.com/static/example.jpg',
        portableUrl: 'static/example.jpg',
        thumbnail: 'http://example.com/static/example.jpg',
        id: 'static/example.jpg',
        locked: false,
      });
    });
  });

  describe('getLibraryImageAssets', () => {
    it('should filter out assets and return a dictionary of valid images', () => {
      const assets: LibraryAssetResponse[] = [
        { path: 'static/example.jpg', size: 12345, url: 'http://example.com/static/example.jpg' },
        { path: '/assets/files/unsupported.xyz', size: 67890, url: 'http://example.com/assets/files/unsupported.xyz' },
      ];

      const result = getLibraryImageAssets(assets, acceptedImgExt);
      expect(result).toEqual({
        'example.jpg': {
          displayName: 'example.jpg',
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

      const result = getLibraryImageAssets(assets, acceptedImgExt);
      expect(result).toEqual({});
    });
  });
});
