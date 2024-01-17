import { getConfig, setConfig } from '@edx/frontend-platform';
import { getContentMenuItems, getSettingMenuItems, getToolsMenuItems } from './utils';

const baseProps = {
  studioBaseUrl: 'UrLSTuiO',
  courseId: '123',
  intl: {
    formatMessage: jest.fn(),
  },
};
const contentProps = { ...baseProps, hasContentPermissions: true };
const settingProps = { ...baseProps, hasSettingsPermissions: true };
const toolsProps = { ...baseProps, hasToolsPermissions: true };

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
    it('should include only Video Uploads option', () => {
      process.env.ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN = 'true';
      const actualItems = getContentMenuItems({ ...baseProps, hasContentPermissions: false });
      expect(actualItems).toHaveLength(1);
    });
  });
  describe('getSettingMenuItems', async () => {
    it('should include all options', () => {
      const actualItems = getSettingMenuItems(settingProps);
      expect(actualItems).toHaveLength(6);
    });
    it('should not include Advanced Settings option', () => {
      const actualItems = getSettingMenuItems({ ...baseProps, hasSettingsPermissions: false });
      expect(actualItems).toHaveLength(5);
    });
  });
  describe('getToolsMenuItems', async () => {
    it('should include all options', () => {
      const actualItems = getToolsMenuItems(toolsProps);
      expect(actualItems).toHaveLength(3);
    });
    it('should not include Checklist option', () => {
      const actualItems = getToolsMenuItems({ ...baseProps, hasToolsPermissions: false });
      expect(actualItems).toHaveLength(2);
    });
  });
});
