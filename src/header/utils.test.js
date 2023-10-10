import { getContentMenuItems, getSettingMenuItems, getToolsMenuItems } from './utils';

const baseProps = {
  studioBaseUrl: 'UrLSTuiO',
  courseId: '123',
  intl: {
    formatMessage: jest.fn(),
  },
};
const contentProps = { ...baseProps, hasContentPermissions: true };
const settingProps = { ...baseProps, hasSettingPermissions: true };
const toolsProps = { ...baseProps, hasToolsPermissions: true };

describe('header utils', () => {
  describe('getContentMenuItems', async () => {
    it('should include all options', () => {
      const actualItems = getContentMenuItems(contentProps);
      expect(actualItems).toHaveLength(5);
    });
    it('should not include Video Uploads option', () => {
      process.env.ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN = 'false';
      const actualItems = getContentMenuItems(contentProps);
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
      const actualItems = getSettingMenuItems({ ...baseProps, hasSettingPermissions: false });
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
