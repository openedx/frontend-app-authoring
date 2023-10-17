import { getFileSizeToClosestByte } from './utils';

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
  });
});
