import { useSelector } from 'react-redux';
import { getConfig, setConfig } from '@edx/frontend-platform';
import { renderHook } from '@testing-library/react-hooks';
import { useContentMenuItems, useToolsMenuItems, useSettingMenuItems } from './hooks';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: jest.fn(message => message.defaultMessage),
  }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('header utils', () => {
  describe('getContentMenuItems', () => {
    it('should include Video Uploads option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'true',
      });
      const actualItems = renderHook(() => useContentMenuItems('course-123')).result.current;
      expect(actualItems).toHaveLength(5);
    });
    it('should not include Video Uploads option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'false',
      });
      const actualItems = renderHook(() => useContentMenuItems('course-123')).result.current;
      expect(actualItems).toHaveLength(4);
    });
  });

  describe('getSettingsMenuitems', () => {
    useSelector.mockReturnValue({ canAccessAdvancedSettings: true });

    it('should include certificates option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_CERTIFICATE_PAGE: 'true',
      });
      const actualItems = renderHook(() => useSettingMenuItems('course-123')).result.current;
      expect(actualItems).toHaveLength(6);
    });
    it('should not include certificates option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_CERTIFICATE_PAGE: 'false',
      });
      const actualItems = renderHook(() => useSettingMenuItems('course-123')).result.current;
      expect(actualItems).toHaveLength(5);
    });
    it('should include advanced settings option', () => {
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123')).result.current.map((item) => item.title);
      expect(actualItemsTitle).toContain('Advanced Settings');
    });
    it('should not include advanced settings option', () => {
      useSelector.mockReturnValue({ canAccessAdvancedSettings: false });
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123')).result.current.map((item) => item.title);
      expect(actualItemsTitle).not.toContain('Advanced Settings');
    });
  });

  describe('getToolsMenuItems', () => {
    it('should include export tags option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      });
      const actualItemsTitle = renderHook(() => useToolsMenuItems('course-123')).result.current.map((item) => item.title);
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
      const actualItemsTitle = renderHook(() => useToolsMenuItems('course-123')).result.current.map((item) => item.title);
      expect(actualItemsTitle).toEqual([
        'Import',
        'Export Course',
        'Checklists',
      ]);
    });
  });
});
