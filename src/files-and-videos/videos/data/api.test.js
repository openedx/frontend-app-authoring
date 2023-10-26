import { getDownload } from './api';
import 'file-saver';

jest.mock('file-saver');

describe('api.js', () => {
  describe('getDownload', () => {
    describe('selectedRows length is undefined or less than zero', () => {
      it('should return with no files selected error if selectedRows is empty', async () => {
        const expected = ['No files were selected to download.'];
        const actual = await getDownload([], 'courseId');
        expect(actual).toEqual(expected);
      });
      it('should return with no files selected error if selectedRows is null', async () => {
        const expected = ['No files were selected to download.'];
        const actual = await getDownload(null, 'courseId');
        expect(actual).toEqual(expected);
      });
    });
    describe('selectedRows length is greater than one', () => {
      it('should not throw error when blob returns null', async () => {
        const expected = [];
        const actual = await getDownload([
          { original: { displayName: 'test1', downloadLink: 'test1.com' } },
          { original: { displayName: 'test2', id: '2', downloadLink: 'test2.com' } },
        ]);
        expect(actual).toEqual(expected);
      });
      it('should return error if row does not contain .original attribute', async () => {
        const expected = ['Failed to download video.'];
        const actual = await getDownload([
          { asset: { displayName: 'test1', id: '1' } },
          { original: { displayName: 'test2', id: '2', downloadLink: 'test1.com' } },
        ]);
        expect(actual).toEqual(expected);
      });
      it('should return error if original does not contain .downloadLink attribute', async () => {
        const expected = ['Cannot find download file for test2.'];
        const actual = await getDownload([
          { original: { displayName: 'test2', id: '2' } },
        ]);
        expect(actual).toEqual(expected);
      });
    });
    describe('selectedRows length equals one', () => {
      it('should return error if row does not contain .original ancestor', async () => {
        const expected = ['Failed to download video.'];
        const actual = await getDownload([
          { asset: { displayName: 'test1', id: '1', download_link: 'test1.com'} },
        ]);
        expect(actual).toEqual(expected);
      });
    });
  });
});
