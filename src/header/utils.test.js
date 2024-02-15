import { getConfig, setConfig } from '@edx/frontend-platform';
import { getContentMenuItems, getToolsMenuItems } from './utils';

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
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'true',
      });
      const actualItems = getContentMenuItems(props);
      expect(actualItems).toHaveLength(5);
    });
    it('should not include Video Uploads option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'false',
      });
      const actualItems = getContentMenuItems(props);
      expect(actualItems).toHaveLength(4);
    });
  });
  describe('getToolsMenuItems', () => {
    it('should include export tags option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      });
      const actualItems = getToolsMenuItems(props);
      expect(actualItems).toHaveLength(4);
    });
    it('should not include export tags option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
      });
      const actualItems = getToolsMenuItems(props);
      expect(actualItems).toHaveLength(3);
    });
  });
});
