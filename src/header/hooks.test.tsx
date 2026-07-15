import { useSelector } from 'react-redux';
import { getConfig, setConfig } from '@edx/frontend-platform';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import messages from './messages';
import {
  useContentMenuItems,
  useToolsMenuItems,
  useSettingMenuItems,
  useLibrarySettingsMenuItems,
  useLibraryToolsMenuItems,
} from './hooks';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: jest.fn(message => message.defaultMessage),
  }),
}));

// Bypass React Query for waffle flags, and just return the default values.
mockWaffleFlags({});

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('@src/authz/hooks', () => ({
  ...jest.requireActual('@src/authz/hooks'),
  useCourseUserPermissions: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode; }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
};

describe('header utils', () => {
  describe('getContentMenuItems', () => {
    beforeEach(() => {
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: false,
        canViewCourse: true,
        canManageLibraryUpdates: true,
        canViewPagesAndResources: true,
        canManagePagesAndResources: true,
        canViewCourseUpdates: true,
        canViewFiles: true,
      } as ReturnType<typeof useCourseUserPermissions>);
    });

    it('when video upload page enabled should include Video Uploads option', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: false });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        canViewCourse: true,
        canViewCourseUpdates: true,
        canViewPagesAndResources: true,
        canViewFiles: true,
      } as any);
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: false,
      });
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'true',
      });
      const actualItems =
        renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(actualItems).toHaveLength(5);
    });
    it('when video upload page disabled should not include Video Uploads option', () => {
      mockWaffleFlags({
        enableAuthzCourseAuthoring: false,
        useNewVideoUploadsPage: false,
        useNewCertificatesPage: false,
      });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        canViewCourse: true,
        canViewCourseUpdates: true,
        canViewPagesAndResources: true,
        canViewFiles: true,
      } as any);
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: false,
      });
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'false',
      });
      const actualItems =
        renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(actualItems).toHaveLength(4);
    });
    it('when authz enabled and user has no permission to view files should not include files option', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        canViewFiles: false,
      } as any);
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: false,
      });
      const actualItems =
        renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      const actualItemsTitle = actualItems.map((item) => item.title);
      expect(actualItemsTitle).not.toContain(messages['header.links.filesAndUploads'].defaultMessage);
    });
    it('when authz enabled and user has permission to view files should include files option', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        canViewFiles: true,
      } as any);
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: false,
      });
      const actualItems =
        renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      const actualItemsTitle = actualItems.map((item) => item.title);
      expect(actualItemsTitle).toContain(messages['header.links.filesAndUploads'].defaultMessage);
    });
    it('when authz disabled user should view files option', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: false });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        canViewFiles: true,
      } as any);
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: false,
      });
      const actualItems =
        renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      const actualItemsTitle = actualItems.map((item) => item.title);
      expect(actualItemsTitle).toContain(messages['header.links.filesAndUploads'].defaultMessage);
    });
    it('adds course libraries link to content menu when libraries v2 is enabled', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: false });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        canViewCourse: true,
        canManageLibraryUpdates: true,
        canViewCourseUpdates: false,
      } as any);
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: true,
      });
      const actualItems =
        renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(actualItems[1]).toEqual({ href: '/course/course-123/libraries', title: 'Library Updates' });
    });
    it('when authz enabled and user has no permission to view course updates should not include course updates option', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        canViewCourseUpdates: false,
      } as any);
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: false,
      });
      const actualItems =
        renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      const actualItemsTitle = actualItems.map((item) => item.title);
      expect(actualItemsTitle).not.toContain(messages['header.links.updates'].defaultMessage);
    });
    it('when authz enabled and user has permission to view course updates should include course updates option', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canViewCourseUpdates: true,
      } as any);
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: false,
      });
      const actualItems =
        renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      const actualItemsTitle = actualItems.map((item) => item.title);
      expect(actualItemsTitle).toContain(messages['header.links.updates'].defaultMessage);
    });
    it('when useNewUpdatesPage is false should use legacy studio URL for updates', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: false, useNewUpdatesPage: false });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: false,
        canViewCourseUpdates: true,
      } as any);
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: false,
      });
      const actualItems =
        renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      const updatesItem = actualItems.find((item) => item.title === messages['header.links.updates'].defaultMessage);
      expect(updatesItem?.href).toContain('/course_info/course-123');
    });
    it('when authz enabled and user has canViewPagesAndResources should include pages and resources option', async () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useSelector).mockReturnValue({ librariesV2Enabled: false });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canViewPagesAndResources: true,
        canManagePagesAndResources: true,
      } as ReturnType<typeof useCourseUserPermissions>);
      const { result } = renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        expect(result.current.map((item) => item.title)).toContain('Pages & Resources');
      });
    });
    it('when authz enabled and user lacks canViewPagesAndResources should not include pages and resources option', async () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useSelector).mockReturnValue({ librariesV2Enabled: false });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canViewPagesAndResources: false,
        canManagePagesAndResources: false,
      } as ReturnType<typeof useCourseUserPermissions>);
      const { result } = renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        expect(result.current.map((item) => item.title)).not.toContain('Pages & Resources');
      });
    });
    it('when authz enabled and user has no permissions should return an empty menu', () => {
      mockWaffleFlags({
        enableAuthzCourseAuthoring: true,
        useNewVideoUploadsPage: false,
      });
      setConfig({
        ...getConfig(),
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: 'false',
      });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canViewCourse: false,
        canManageLibraryUpdates: false,
        canViewCourseUpdates: false,
        canViewPagesAndResources: false,
        canViewFiles: false,
      } as ReturnType<typeof useCourseUserPermissions>);
      jest.mocked(useSelector).mockReturnValue({
        librariesV2Enabled: true,
      });
      const actualItems =
        renderHook(() => useContentMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(actualItems).toHaveLength(0);
    });
  });

  describe('getSettingsMenuitems', () => {
    beforeAll(() => {
      mockWaffleFlags({
        enableAuthzCourseAuthoring: false,
        useNewVideoUploadsPage: false,
        useNewCertificatesPage: false,
      });
    });
    beforeEach(() => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: false, useNewCertificatesPage: false });
      jest.mocked(useSelector).mockReturnValue({
        canAccessAdvancedSettings: true,
      });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: false,
        canManageAdvancedSettings: true,
        canViewGradingSettings: true,
        canViewScheduleAndDetails: true,
        canViewCourseTeam: true,
        canManageGroupConfigurations: true,
        canManageCertificates: true,
      } as ReturnType<typeof useCourseUserPermissions>);
    });

    it('when certificate page enabled should include certificates option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_CERTIFICATE_PAGE: 'true',
      });
      const actualItems =
        renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(actualItems).toHaveLength(6);
    });
    it('when user has access to advanced settings should include advanced settings option', () => {
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result
        .current.map((item) => item.title);
      expect(actualItemsTitle).toContain('Advanced Settings');
    });
    it('when user has no access to advanced settings should not include advanced settings option', () => {
      jest.mocked(useSelector).mockReturnValue({ canAccessAdvancedSettings: false });
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result
        .current.map((item) => item.title);
      expect(actualItemsTitle).not.toContain('Advanced Settings');
    });

    it('when the authz.enable_course_authoring flag is enabled and user has access to advanced settings should include advanced settings option', async () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canManageAdvancedSettings: true,
        canViewGradingSettings: true,
        canViewScheduleAndDetails: true,
      } as ReturnType<typeof useCourseUserPermissions>);
      const { result } = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        const actualItemsTitle = result.current.map((item) => item.title);
        expect(actualItemsTitle).toContain('Advanced Settings');
      });
    });

    it('should include course team option when authz is disabled', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: false });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        canManageAdvancedSettings: true,
        canViewCourseTeam: true,
      } as any);
      const actualItems =
        renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      const courseTeamItem = actualItems.find(item => item.title === 'Course Team');
      expect(courseTeamItem).toEqual({
        href: '/course/course-123/course_team',
        title: 'Course Team',
      });
      const rolesPermissionsItem = actualItems.find(item => item.title === 'Roles and Permissions');
      expect(rolesPermissionsItem).toBeUndefined();
    });

    it('should encode courseId in roles and permissions URL', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      setConfig({
        ...getConfig(),
        ADMIN_CONSOLE_URL: 'http://admin-console.example.com',
      });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canManageAdvancedSettings: true,
        canViewCourseTeam: true,
      } as any);
      const courseIdWithSpecialChars = 'course-v1:org+course+run';
      const actualItems =
        renderHook(() => useSettingMenuItems(courseIdWithSpecialChars), { wrapper: createWrapper() }).result.current;
      const rolesPermissionsItem = actualItems.find(item => item.title === 'Roles and Permissions');
      expect(rolesPermissionsItem?.href).toBe(
        `http://admin-console.example.com/authz?scope=${encodeURIComponent(courseIdWithSpecialChars)}`,
      );
    });

    it('when authz.enable_course_authoring flag is enabled and user has no access to advanced settings should not include advanced settings option', async () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canManageAdvancedSettings: false,
        canViewGradingSettings: true,
        canViewScheduleAndDetails: true,
      } as ReturnType<typeof useCourseUserPermissions>);
      const { result } = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        const actualItemsTitle = result.current.map((item) => item.title);
        expect(actualItemsTitle).not.toContain('Advanced Settings');
      });
    });

    it('when authz.enable_course_authoring flag is enabled and the permission request is still loading, should not include advanced settings option', async () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: true,
        isAuthzEnabled: true,
      } as ReturnType<typeof useCourseUserPermissions>);
      const { result } = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        const actualItemsTitle = result.current.map((item) => item.title);
        expect(actualItemsTitle).not.toContain('Advanced Settings');
      });
    });

    it('when authz flag is enabled and user has canViewScheduleAndDetails should include schedule and details option', async () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canViewScheduleAndDetails: true,
        canManageAdvancedSettings: true,
        canViewGradingSettings: true,
      } as ReturnType<typeof useCourseUserPermissions>);
      const { result } = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        const actualItemsTitle = result.current.map((item) => item.title);
        expect(actualItemsTitle).toContain('Schedule & Details');
      });
    });

    it('when authz flag is enabled and user lacks canViewScheduleAndDetails should not include schedule and details option', async () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canViewScheduleAndDetails: false,
        canManageAdvancedSettings: true,
        canViewGradingSettings: true,
      } as ReturnType<typeof useCourseUserPermissions>);
      const { result } = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        const actualItemsTitle = result.current.map((item) => item.title);
        expect(actualItemsTitle).not.toContain('Schedule & Details');
      });
    });

    it('when authz flag is enabled and user has canViewGradingSettings should include grading option', async () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canViewGradingSettings: true,
        canManageAdvancedSettings: true,
        canViewScheduleAndDetails: true,
      } as ReturnType<typeof useCourseUserPermissions>);
      const { result } = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        const actualItemsTitle = result.current.map((item) => item.title);
        expect(actualItemsTitle).toContain('Grading');
      });
    });

    it('when authz flag is enabled and user lacks canViewGradingSettings should not include grading option', async () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canViewGradingSettings: false,
        canManageAdvancedSettings: true,
        canViewScheduleAndDetails: true,
      } as ReturnType<typeof useCourseUserPermissions>);
      const { result } = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() });
      await waitFor(() => {
        const actualItemsTitle = result.current.map((item) => item.title);
        expect(actualItemsTitle).not.toContain('Grading');
      });
    });

    it('should include roles and permissions option', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true, useNewCertificatesPage: false });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canManageAdvancedSettings: true,
        canViewGradingSettings: true,
        canViewScheduleAndDetails: true,
        canViewCourseTeam: true,
      } as ReturnType<typeof useCourseUserPermissions>);
      setConfig({
        ...getConfig(),
        ADMIN_CONSOLE_URL: 'http://admin-console.example.com',
      });
      const actualItems =
        renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      const rolesPermissionsItem = actualItems.find(item => item.title === 'Roles and Permissions');
      expect(rolesPermissionsItem).toEqual({
        href: 'http://admin-console.example.com/authz?scope=course-123',
        title: 'Roles and Permissions',
      });
    });

    it('when authz flag is enabled and user lacks canViewCourseTeam should not include roles and permissions option', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canViewCourseTeam: false,
      } as any);
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result
        .current.map((item) => item.title);
      expect(actualItemsTitle).not.toContain('Roles and Permissions');
    });

    it('when authz flag is enabled and user lacks canManageGroupConfigurations should not include group configurations option', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canManageGroupConfigurations: false,
      } as any);
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result
        .current.map((item) => item.title);
      expect(actualItemsTitle).not.toContain('Group Configurations');
    });

    it('when authz flag is enabled and user lacks canManageCertificates should not include certificates option', () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      setConfig({
        ...getConfig(),
        ENABLE_CERTIFICATE_PAGE: 'true',
      });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canManageCertificates: false,
      } as any);
      const actualItemsTitle = renderHook(() => useSettingMenuItems('course-123'), { wrapper: createWrapper() }).result
        .current.map((item) => item.title);
      expect(actualItemsTitle).not.toContain('Certificates');
    });
  });

  describe('getToolsMenuItems', () => {
    beforeEach(() => {
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: false,
        canEditCourseContent: true,
        canViewChecklists: true,
        canImportCourse: true,
        canExportCourse: true,
        canExportTags: true,
      } as ReturnType<typeof useCourseUserPermissions>);
    });

    it('when tags enabled should include export tags option', () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      });
      const actualItemsTitle = renderHook(() => useToolsMenuItems('course-123'), { wrapper: createWrapper() }).result
        .current.map((item) => item.title);
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
      const actualItemsTitle = renderHook(() => useToolsMenuItems('course-123'), { wrapper: createWrapper() }).result
        .current.map((item) => item.title);
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
      const optimizerItem = renderHook(() => useToolsMenuItems('course-123'), { wrapper: createWrapper() }).result
        .current.find(
          item => item.href === '/course/course-123/optimizer',
        );
      expect(optimizerItem).toBeDefined();
    });

    it('when course optimizer disabled should not include optimizer option', () => {
      mockWaffleFlags({
        enableCourseOptimizer: false,
      });
      const actualItemsTitle = renderHook(() => useToolsMenuItems('course-123'), { wrapper: createWrapper() }).result
        .current.map((item) => item.title);
      expect(actualItemsTitle).not.toContain(messages['header.links.optimizer'].defaultMessage);
    });

    it('when authz enabled and user has no permissions should return an empty menu', () => {
      mockWaffleFlags({
        enableAuthzCourseAuthoring: true,
        enableCourseOptimizer: true,
      });
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      });
      jest.mocked(useCourseUserPermissions).mockReturnValue({
        isLoading: false,
        isAuthzEnabled: true,
        canEditCourseContent: false,
        canViewChecklists: false,
        canImportCourse: false,
        canExportCourse: false,
        canExportTags: false,
      } as ReturnType<typeof useCourseUserPermissions>);
      const actualItems = renderHook(() => useToolsMenuItems('course-123'), { wrapper: createWrapper() }).result
        .current;
      expect(actualItems).toHaveLength(0);
    });
  });

  describe('useLibrarySettingsMenuItems', () => {
    let originalConfig: any;

    beforeEach(() => {
      originalConfig = { ...getConfig() };
    });

    afterEach(() => {
      setConfig(originalConfig);
    });

    it('should contain team access url', () => {
      const configWithoutAdminConsole = { ...getConfig() };
      delete configWithoutAdminConsole.ADMIN_CONSOLE_URL;
      setConfig(configWithoutAdminConsole);

      const items =
        renderHook(() => useLibrarySettingsMenuItems('library-123', false), { wrapper: createWrapper() }).result
          .current;
      expect(items).toContainEqual({ title: 'Library Team', href: 'http://localhost/?sa=manage-team' });
    });
    it('should contain admin console url if set', () => {
      setConfig({
        ...getConfig(),
        ADMIN_CONSOLE_URL: 'http://admin-console.com',
      });
      const items =
        renderHook(() => useLibrarySettingsMenuItems('library-123', false), { wrapper: createWrapper() }).result
          .current;
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
      const items =
        renderHook(() => useLibrarySettingsMenuItems('library-123', true), { wrapper: createWrapper() }).result.current;
      expect(items).toContainEqual({
        title: 'Library Team',
        href: 'http://admin-console.com/authz/libraries/library-123',
      });
    });
  });

  describe('useLibraryToolsMenuItems', () => {
    it('should contain backup and import url', () => {
      const items =
        renderHook(() => useLibraryToolsMenuItems('course-123'), { wrapper: createWrapper() }).result.current;
      expect(items).toContainEqual({
        href: '/library/course-123/backup',
        title: 'Back up to local archive',
      });
      expect(items).toContainEqual({ href: '/library/course-123/import', title: 'Import' });
    });
  });
});
