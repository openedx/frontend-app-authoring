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
});
