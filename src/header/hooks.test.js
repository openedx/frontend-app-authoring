import { useSelector } from 'react-redux';
import { getConfig, setConfig } from '@edx/frontend-platform';
import { renderHook } from '@testing-library/react';
import messages from './messages';
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
    it('when video upload page enabled should include Video Uploads option', () => {
      useSelector.mockReturnValue({
        librariesV2Enabled: false,
      });
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'true',
      });
      const actualItems = renderHook(() => useContentMenuItems('course-123')).result.current;
      expect(actualItems).toHaveLength(5);
    });
    it('when video upload page disabled should not include Video Uploads option', () => {
      useSelector.mockReturnValue({
        librariesV2Enabled: false,
      });
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'false',
      });
      const actualItems = renderHook(() => useContentMenuItems('course-123')).result.current;
      expect(actualItems).toHaveLength(4);
    });
    it('adds course libraries link to content menu when libraries v2 is enabled', () => {
      useSelector.mockReturnValue({
        librariesV2Enabled: true,
      });
      const actualItems = renderHook(() => useContentMenuItems('course-123')).result.current;
      expect(actualItems[1]).toEqual({ href: '/course/course-123/libraries', title: 'Libraries' });
    });
  });

  describe('getSettingsMenuitems', () => {
    beforeEach(() => {
      useSelector.mockReturnValue({
        canAccessAdvancedSettings: true,
      });
    });

    it('when certificate page enabled should include certificates option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_CERTIFICATE_PAGE: 'true',
      });
      const actualItems = renderHook(() => useSettingMenuItems('course-123')).result.current;
      expect(actualItems).toHaveLength(6);
    });
    it('when certificate page disabled should not include certificates option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_CERTIFICATE_PAGE: 'false',
      });
      const actualItems = renderHook(() => useSettingMenuItems('course-123')).result.current;
      expect(actualItems).toHaveLength(5);
    });
    it('when user has access to advanced settings should include advanced settings option', () => {
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123')).result.current.map((item) => item.title);
      expect(actualItemsTitle).toContain('Advanced Settings');
    });
    it('when user has no access to advanced settings should not include advanced settings option', () => {
      useSelector.mockReturnValue({ canAccessAdvancedSettings: false });
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123')).result.current.map((item) => item.title);
      expect(actualItemsTitle).not.toContain('Advanced Settings');
    });
  });

  describe('getToolsMenuItems', () => {
    beforeEach(() => {
      useSelector.mockReturnValue({
        waffleFlags: jest.fn(),
      });
    });
    it('when tags enabled should include export tags option', () => {
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
    it('when tags disabled should not include export tags option', () => {
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

    it('when course optimizer enabled should include optimizer option', () => {
      useSelector.mockReturnValue({ enableCourseOptimizer: true });
      const actualItemsTitle = renderHook(() => useToolsMenuItems('course-123')).result.current.map((item) => item.title);
      expect(actualItemsTitle).toContain(messages['header.links.optimizer'].defaultMessage);
    });

    it('when course optimizer disabled should not include optimizer option', () => {
      useSelector.mockReturnValue({ enableCourseOptimizer: false });
      const actualItemsTitle = renderHook(() => useToolsMenuItems('course-123')).result.current.map((item) => item.title);
      expect(actualItemsTitle).not.toContain(messages['header.links.optimizer'].defaultMessage);
    });
  });
});
