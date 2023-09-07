import getPageHeadTitle from './utils';

describe('utils', () => {
  describe('getPageHeader', () => {
    it('should return with page name and site name', () => {
      const expected = 'pageName | edX';
      const actual = getPageHeadTitle(null, 'pageName');
      expect(expected).toEqual(actual);
    });
    it('should return with page name, course name, and site name', () => {
      const expected = 'pageName | courseName | edX';
      const actual = getPageHeadTitle('courseName', 'pageName');
      expect(expected).toEqual(actual);
    });
  });
});
