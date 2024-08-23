import { getConfig, setConfig } from '@edx/frontend-platform';
import { getContentMenuItems, getToolsMenuItems, getSettingMenuItems } from './utils';

const props = {
  studioBaseUrl: 'UrLSTuiO',
  courseId: '123',
  intl: {
    formatMessage: jest.fn(message => message.defaultMessage),
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

  describe('getSettingsMenuitems', () => {
    it('should include certificates option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_CERTIFICATE_PAGE: 'true',
      });
      const actualItems = getSettingMenuItems(props);
      expect(actualItems).toHaveLength(6);
    });
    it('should not include certificates option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_CERTIFICATE_PAGE: 'false',
      });
      const actualItems = getSettingMenuItems(props);
      expect(actualItems).toHaveLength(5);
    });
  });

  describe('getToolsMenuItems', () => {
    it('should include export tags option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      });
      const actualItemsTitle = getToolsMenuItems(props).map((item) => item.title);
      expect(actualItemsTitle).toEqual([
        'Import',
        'Export Course',
        'Export Tags',
        'Checklists',
      ]);
    });
    it('should not include export tags option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
      });
      const actualItemsTitle = getToolsMenuItems(props).map((item) => item.title);
      expect(actualItemsTitle).toEqual([
        'Import',
        'Export Course',
        'Checklists',
      ]);
    });
  });
});
