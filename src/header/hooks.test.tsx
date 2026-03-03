import { useSelector } from 'react-redux';
import { getConfig, setConfig } from '@edx/frontend-platform';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import messages from './messages';
import {
  useContentMenuItems, useToolsMenuItems, useSettingMenuItems, useLibrarySettingsMenuItems, useLibraryToolsMenuItems,
} from './hooks';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: jest.fn(message => message.defaultMessage),
  }),
}));

// Bypass React Query for waffle flags, and just return the default values.
mockWaffleFlags({
  // Some flags can be enabled with either a config value or a waffle flag.
  // For test purposes, we'll configure the video upload page using the config, so leave the waffle flag off.
  useNewVideoUploadsPage: false,
  useNewCertificatesPage: false,
});

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('@src/authz/data/apiHooks', () => ({
  useUserPermissions: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
};

describe('header utils', () => {
  describe('getContentMenuItems', () => {
    it('when video upload page enabled should include Video Uploads option', () => {
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: false,
      });
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'true',
      });
      const actualItems = renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(actualItems).toHaveLength(5);
    });
    it('when video upload page disabled should not include Video Uploads option', () => {
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: false,
      });
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'false',
      });
      const actualItems = renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(actualItems).toHaveLength(4);
    });
    it('adds course libraries link to content menu when libraries v2 is enabled', () => {
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: true,
      });
      const actualItems = renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(actualItems[1]).toEqual({ href: '/course/course-123/libraries', title: 'Library Updates' });
    });
  });

  describe('getSettingsMenuitems', () => {
    beforeEach(() => {
      jest.mocked(useSelector).mockReturnValue({
        canAccessAdvancedSettings: true,
      });
      jest.mocked(useUserPermissions).mockReturnValue({
        isLoading: false,
        data: { canManageAdvancedSettings: true },
      } as any);
    });

    it('when certificate page enabled should include certificates option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_CERTIFICATE_PAGE: 'true',
      });
      const actualItems = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(actualItems).toHaveLength(6);
    });
    it('when certificate page disabled should not include certificates option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_CERTIFICATE_PAGE: 'false',
      });
      const actualItems = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(actualItems).toHaveLength(5);
    });
    it('when user has access to advanced settings should include advanced settings option', () => {
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result.current.map((item) => item.title);
      expect(actualItemsTitle).toContain('Advanced Settings');
    });
    it('when user has no access to advanced settings should not include advanced settings option', () => {
      jest.mocked(useSelector).mockReturnValue({ canAccessAdvancedSettings: false });
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result.current.map((item) => item.title);
      expect(actualItemsTitle).not.toContain('Advanced Settings');
    });

    it('when the authz.enable_course_authoring flag is enabled and user has access to advanced settings should include advanced settings option', async () => {
      // Mock feature flag
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      // Mock the useUserPermissions hook to return true for the authz.enable_course_authoring permission
      jest.mocked(useUserPermissions).mockReturnValue({
        isLoading: false,
        data: { canManageAdvancedSettings: true },
      } as any);
      const { result } = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        const actualItemsTitle = result.current.map((item) => item.title);
        expect(actualItemsTitle).toContain('Advanced Settings');
      });
    });
    it('when authz.enable_course_authoring flag is enabled and user has no access to advanced settings should not include advanced settings option', async () => {
      // Mock feature flag
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      // Mock the useUserPermissions hook to return true for the authz.enable_course_authoring permission
      jest.mocked(useUserPermissions).mockReturnValue({
        isLoading: false,
        data: { canManageAdvancedSettings: false },
      } as any);
      const { result } = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        const actualItemsTitle = result.current.map((item) => item.title);
        expect(actualItemsTitle).not.toContain('Advanced Settings');
      });
    });

    it('when authz.enable_course_authoring flag is enabled and the permission request is still loading, should not include advanced settings option', async () => {
      // Mock feature flag
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      // Mock the useUserPermissions hook to return true for the authz.enable_course_authoring permission
      jest.mocked(useUserPermissions).mockReturnValue({
        isLoading: true,
        data: undefined,
      } as any);
      const { result } = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        const actualItemsTitle = result.current.map((item) => item.title);
        expect(actualItemsTitle).not.toContain('Advanced Settings');
      });
    });
  });

  describe('getToolsMenuItems', () => {
    it('when tags enabled should include export tags option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      });
      const actualItemsTitle = renderHook(() => useToolsMenuItems('course-123'), { wrapper: createWrapper() }).result.current.map((item) => item.title);
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
      const actualItemsTitle = renderHook(() => useToolsMenuItems('course-123'), { wrapper: createWrapper() }).result.current.map((item) => item.title);
      expect(actualItemsTitle).toEqual([
        'Import',
        'Export Course',
        'Checklists',
      ]);
    });

    it('when course optimizer enabled should include optimizer option', () => {
      mockWaffleFlags({
        enableCourseOptimizer: true,
      });
      const optimizerItem = renderHook(() => useToolsMenuItems('course-123'), { wrapper: createWrapper() }).result.current.find(
        item => item.href === '/course/course-123/optimizer',
      );
      expect(optimizerItem).toBeDefined();
    });

    it('when course optimizer disabled should not include optimizer option', () => {
      mockWaffleFlags({
        enableCourseOptimizer: false,
      });
      const actualItemsTitle = renderHook(() => useToolsMenuItems('course-123'), { wrapper: createWrapper() }).result.current.map((item) => item.title);
      expect(actualItemsTitle).not.toContain(messages['header.links.optimizer'].defaultMessage);
    });
  });

  describe('useLibrarySettingsMenuItems', () => {
    it('should contain team access url', () => {
      const items = renderHook(() => useLibrarySettingsMenuItems('library-123', false), { wrapper: createWrapper() }).result.current;
      expect(items).toContainEqual({ title: 'Library Team', href: 'http://localhost/?sa=manage-team' });
    });
    it('should contain admin console url if set', () => {
      setConfig({
        ...getConfig(),
        ADMIN_CONSOLE_URL: 'http://admin-console.com',
      });
      const items = renderHook(() => useLibrarySettingsMenuItems('library-123', false), { wrapper: createWrapper() }).result.current;
      expect(items).toContainEqual({
        title: 'Library Team',
        href: 'http://admin-console.com/authz/libraries/library-123',
      });
    });
    it('should contain admin console url if set and readOnly is true', () => {
      setConfig({
        ...getConfig(),
        ADMIN_CONSOLE_URL: 'http://admin-console.com',
      });
      const items = renderHook(() => useLibrarySettingsMenuItems('library-123', true), { wrapper: createWrapper() }).result.current;
      expect(items).toContainEqual({
        title: 'Library Team',
        href: 'http://admin-console.com/authz/libraries/library-123',
      });
    });
  });

  describe('useLibraryToolsMenuItems', () => {
    it('should contain backup and import url', () => {
      const items = renderHook(() => useLibraryToolsMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(items).toContainEqual({
        href: '/library/course-123/backup',
        title: 'Back up to local archive',
      });
      expect(items).toContainEqual({ href: '/library/course-123/import', title: 'Import' });
    });
  });
});
