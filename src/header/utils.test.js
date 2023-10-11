import { getContentMenuItems } from './utils';

const props = {
  studioBaseUrl: 'UrLSTuiO',
  courseId: '123',
  intl: {
    formatMessage: jest.fn(),
  },
};

describe('header utils', () => {
  describe('getContentMenuItems', () => {
    it('should include Video Uploads option', () => {
      const actualItems = getContentMenuItems(props);
      expect(actualItems).toHaveLength(5);
    });
    it('should not include Video Uploads option', () => {
      process.env.ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN = 'false';
      const actualItems = getContentMenuItems(props);
      expect(actualItems).toHaveLength(4);
    });
  });
});
