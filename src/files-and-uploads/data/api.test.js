import { getDownload } from './api';
import 'file-saver';

jest.mock('file-saver');

describe('api.js', () => {
  describe('getDownload', () => {
    describe('selectedRows length is undefined or less than zero', () => {
      it('should return with no files selected error if selectedRows is empty', async () => {
        const expected = ['No files were selected to download'];
        const actual = await getDownload([], 'courseId');
        expect(actual).toEqual(expected);
      });
      it('should return with no files selected error if selectedRows is null', async () => {
        const expected = ['No files were selected to download'];
        const actual = await getDownload(null, 'courseId');
        expect(actual).toEqual(expected);
      });
    });
    describe('selectedRows length is greater than one', () => {
      it('should not throw error when blob returns null', async () => {
        const mockResponseData = { ok: true, blob: () => null };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);
        const expected = [];
        const actual = await getDownload([
          { original: { displayName: 'test1' } },
          { original: { displayName: 'test2', id: '2' } },
        ]);
        expect(actual).toEqual(expected);
      });
      it('should return error if row does not contain .original ancestor', async () => {
        const mockResponseData = { ok: true, blob: () => 'data' };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);
        const expected = ['Failed to download undefined.'];
        const actual = await getDownload([
          { asset: { displayName: 'test1', id: '1' } },
          { original: { displayName: 'test2', id: '2' } },
        ]);
        expect(actual).toEqual(expected);
      });
    });
    describe('selectedRows length equals one', () => {
      it('should return error if row does not contain .original ancestor', async () => {
        const mockResponseData = { ok: true, blob: () => 'data' };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);
        const expected = ['Failed to download undefined.'];
        const actual = await getDownload([
          { asset: { displayName: 'test1', id: '1' } },
        ]);
        expect(actual).toEqual(expected);
      });
    });
  });
});
