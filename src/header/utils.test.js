import { getConfig, setConfig } from '@edx/frontend-platform';
import { getContentMenuItems, getSettingMenuItems, getToolsMenuItems } from './utils';

const baseProps = {
  studioBaseUrl: 'UrLSTuiO',
  courseId: '123',
  intl: {
    formatMessage: jest.fn(),
  },
};
const contentProps = { ...baseProps, hasContentPermissions: true, hasOutlinePermissions: true };
const settingProps = { ...baseProps, hasAdvancedSettingsAccess: true, hasSettingsPermissions: true };
const toolsProps = { ...baseProps, hasToolsPermissions: true };

describe('header utils', () => {
  describe('getContentMenuItems', () => {
    it('should include Video Uploads option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'true',
      });
      const actualItems = getContentMenuItems(contentProps);
      expect(actualItems).toHaveLength(5);
    });
    it('should not include Video Uploads option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'false',
      });
      const actualItems = getContentMenuItems(contentProps);
      expect(actualItems).toHaveLength(4);
    });
    it('should include only Video Uploads option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'true',
      });
      const actualItems = getContentMenuItems({
        ...baseProps,
        hasContentPermissions: false,
        hasOutlinePermissions: false,
      });
      expect(actualItems).toHaveLength(1);
    });
    it('should include Outline if outline permissions', () => {
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'false',
      });
      const actualItems = getContentMenuItems({
        ...baseProps,
        hasContentPermissions: false,
        hasOutlinePermissions: true,
      });
      expect(actualItems).toHaveLength(1);
    });
    it('should include content sections if content permissions', () => {
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'false',
      });
      const actualItems = getContentMenuItems({
        ...baseProps,
        hasContentPermissions: true,
        hasOutlinePermissions: false,
      });
      expect(actualItems).toHaveLength(3);
    });
  });
  describe('getSettingMenuItems', async () => {
    it('should include all options', () => {
      const actualItems = getSettingMenuItems(settingProps);
      expect(actualItems).toHaveLength(6);
    });
    it('should include Advanced Settings option, but not settings options', () => {
      const actualItems = getSettingMenuItems({
        ...baseProps,
        hasSettingsPermissions: false,
        hasAdvancedSettingsAccess: true,
      });
      expect(actualItems).toHaveLength(4);
    });
    it('should include settings, but not advanced settings', () => {
      const actualItems = getSettingMenuItems({
        ...baseProps,
        hasSettingsPermissions: true,
        hasAdvancedSettingsAccess: false,
      });
      expect(actualItems).toHaveLength(5);
    });
    it('should only include default options', () => {
      const actualItems = getSettingMenuItems({
        ...baseProps,
        hasSettingsPermissions: false,
        hasAdvancedSettingsAccess: false,
      });
      expect(actualItems).toHaveLength(3);
    });
  });
  describe('getToolsMenuItems', async () => {
    it('should include all options', () => {
      const actualItems = getToolsMenuItems(toolsProps);
      expect(actualItems).toHaveLength(3);
    });
    it('should not include any items if there are no permissions', () => {
      const actualItems = getToolsMenuItems({ ...baseProps, hasToolsPermissions: false });
      expect(actualItems).toHaveLength(0);
    });
  });
});
