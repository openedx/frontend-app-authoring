import {
  getGradingPermissions,
  getPagesAndResourcesPermissions,
  getAdvancedSettingsPermissions,
  getCourseUpdatesPermissions,
  getFilesPermissions,
  getCourseOutlinePermissions,
  getLibraryUpdatesPermissions,
  getCourseTeamPermissions,
  getGroupConfigurationsPermissions,
  getCertificatesPermissions,
  getChecklistsPermissions,
  getImportExportPermissions,
  getViewTeamPermissions,
} from './permissionHelpers';
import { CONTENT_LIBRARY_PERMISSIONS, COURSE_PERMISSIONS } from './constants';

const courseId = 'course-v1:org+course+run';

describe('permissionHelpers', () => {
  const mockCourseId = 'course-v1:edX+DemoX+Demo_Course';

  describe('getCourseUpdatesPermissions', () => {
    it('should return correct permission structure for course updates operations', () => {
      const result = getCourseUpdatesPermissions(courseId);

      expect(result).toEqual({
        canViewCourseUpdates: {
          action: COURSE_PERMISSIONS.VIEW_COURSE_UPDATES,
          scope: courseId,
        },
        canManageCourseUpdates: {
          action: COURSE_PERMISSIONS.MANAGE_COURSE_UPDATES,
          scope: courseId,
        },
      });
    });

    describe('getFilesPermissions', () => {
      it('should return correct permission structure for file operations', () => {
        const result = getFilesPermissions(mockCourseId);

        expect(result).toEqual({
          canViewFiles: {
            action: COURSE_PERMISSIONS.VIEW_FILES,
            scope: mockCourseId,
          },
          canCreateFiles: {
            action: COURSE_PERMISSIONS.CREATE_FILES,
            scope: mockCourseId,
          },
          canDeleteFiles: {
            action: COURSE_PERMISSIONS.DELETE_FILES,
            scope: mockCourseId,
          },
          canEditFiles: {
            action: COURSE_PERMISSIONS.EDIT_FILES,
            scope: mockCourseId,
          },
        });
      });

      it('should use the provided courseId as scope for all permissions', () => {
        const customCourseId = 'course-v1:TestOrg+TestCourse+2024';
        const result = getFilesPermissions(customCourseId);

        Object.values(result).forEach(permission => {
          expect(permission.scope).toBe(customCourseId);
        });
      });
    });

    describe('getGradingPermissions', () => {
      it('returns VIEW and EDIT permissions with the correct actions and scope', () => {
        const result = getGradingPermissions(courseId);

        expect(result.canViewGradingSettings.action).toBe(COURSE_PERMISSIONS.VIEW_GRADING_SETTINGS);
        expect(result.canViewGradingSettings.scope).toBe(courseId);
        expect(result.canEditGradingSettings.action).toBe(COURSE_PERMISSIONS.EDIT_GRADING_SETTINGS);
        expect(result.canEditGradingSettings.scope).toBe(courseId);
      });
    });

    describe('getPagesAndResourcesPermissions', () => {
      it('returns VIEW and MANAGE permissions with the correct actions and scope', () => {
        const result = getPagesAndResourcesPermissions(courseId);

        expect(result.canViewPagesAndResources.action).toBe(COURSE_PERMISSIONS.VIEW_PAGES_AND_RESOURCES);
        expect(result.canViewPagesAndResources.scope).toBe(courseId);
        expect(result.canManagePagesAndResources.action).toBe(COURSE_PERMISSIONS.MANAGE_PAGES_AND_RESOURCES);
        expect(result.canManagePagesAndResources.scope).toBe(courseId);
      });
    });

    describe('getAdvancedSettingsPermissions', () => {
      it('returns MANAGE permission with the correct action and scope', () => {
        const result = getAdvancedSettingsPermissions(courseId);

        expect(result.canManageAdvancedSettings.action).toBe(COURSE_PERMISSIONS.MANAGE_ADVANCED_SETTINGS);
        expect(result.canManageAdvancedSettings.scope).toBe(courseId);
      });

      it('uses the provided courseId as scope', () => {
        const otherId = 'course-v1:another+test+run';
        const result = getAdvancedSettingsPermissions(otherId);

        expect(result.canManageAdvancedSettings.scope).toBe(otherId);
      });
    });

    it('should use correct COURSE_PERMISSIONS constants for each action', () => {
      const result = getFilesPermissions(mockCourseId);

      expect(result.canViewFiles.action).toBe(COURSE_PERMISSIONS.VIEW_FILES);
      expect(result.canCreateFiles.action).toBe(COURSE_PERMISSIONS.CREATE_FILES);
      expect(result.canDeleteFiles.action).toBe(COURSE_PERMISSIONS.DELETE_FILES);
      expect(result.canEditFiles.action).toBe(COURSE_PERMISSIONS.EDIT_FILES);
    });
  });

  describe('getGradingPermissions', () => {
    it('should return correct permission structure for grading operations', () => {
      const result = getGradingPermissions(mockCourseId);

      expect(result).toEqual({
        canViewGradingSettings: {
          action: COURSE_PERMISSIONS.VIEW_GRADING_SETTINGS,
          scope: mockCourseId,
        },
        canEditGradingSettings: {
          action: COURSE_PERMISSIONS.EDIT_GRADING_SETTINGS,
          scope: mockCourseId,
        },
      });
    });

    it('should use the provided courseId as scope for all permissions', () => {
      const customCourseId = 'course-v1:TestOrg+TestCourse+2024';
      const result = getGradingPermissions(customCourseId);

      Object.values(result).forEach(permission => {
        expect(permission.scope).toBe(customCourseId);
      });
    });

    it('should use correct COURSE_PERMISSIONS constants for each action', () => {
      const result = getGradingPermissions(mockCourseId);

      expect(result.canViewGradingSettings.action).toBe(COURSE_PERMISSIONS.VIEW_GRADING_SETTINGS);
      expect(result.canEditGradingSettings.action).toBe(COURSE_PERMISSIONS.EDIT_GRADING_SETTINGS);
    });
  });

  describe('getCourseOutlinePermissions', () => {
    it('returns VIEW_COURSE and EDIT_COURSE_CONTENT permissions with the correct actions and scope', () => {
      const result = getCourseOutlinePermissions(courseId);

      expect(result).toEqual({
        canViewCourse: {
          action: COURSE_PERMISSIONS.VIEW_COURSE,
          scope: courseId,
        },
        canEditCourseContent: {
          action: COURSE_PERMISSIONS.EDIT_COURSE_CONTENT,
          scope: courseId,
        },
      });
    });
  });

  describe('getLibraryUpdatesPermissions', () => {
    it('returns MANAGE_LIBRARY_UPDATES permission with the correct action and scope', () => {
      const result = getLibraryUpdatesPermissions(courseId);

      expect(result).toEqual({
        canManageLibraryUpdates: {
          action: COURSE_PERMISSIONS.MANAGE_LIBRARY_UPDATES,
          scope: courseId,
        },
      });
    });
  });

  describe('getCourseTeamPermissions', () => {
    it('returns VIEW_COURSE_TEAM permission with the correct action and scope', () => {
      const result = getCourseTeamPermissions(courseId);

      expect(result).toEqual({
        canViewCourseTeam: {
          action: COURSE_PERMISSIONS.VIEW_COURSE_TEAM,
          scope: courseId,
        },
      });
    });
  });

  describe('getGroupConfigurationsPermissions', () => {
    it('returns MANAGE_GROUP_CONFIGURATIONS permission with the correct action and scope', () => {
      const result = getGroupConfigurationsPermissions(courseId);

      expect(result).toEqual({
        canManageGroupConfigurations: {
          action: COURSE_PERMISSIONS.MANAGE_GROUP_CONFIGURATIONS,
          scope: courseId,
        },
      });
    });
  });

  describe('getCertificatesPermissions', () => {
    it('returns MANAGE_CERTIFICATES permission with the correct action and scope', () => {
      const result = getCertificatesPermissions(courseId);

      expect(result).toEqual({
        canManageCertificates: {
          action: COURSE_PERMISSIONS.MANAGE_CERTIFICATES,
          scope: courseId,
        },
      });
    });
  });

  describe('getChecklistsPermissions', () => {
    it('returns VIEW_CHECKLISTS permission with the correct action and scope', () => {
      const result = getChecklistsPermissions(courseId);

      expect(result).toEqual({
        canViewChecklists: {
          action: COURSE_PERMISSIONS.VIEW_CHECKLISTS,
          scope: courseId,
        },
      });
    });
  });

  describe('getImportExportPermissions', () => {
    it('returns IMPORT and EXPORT permissions with the correct actions and scope', () => {
      const result = getImportExportPermissions(courseId);

      expect(result).toEqual({
        canImportCourse: {
          action: COURSE_PERMISSIONS.IMPORT_COURSE,
          scope: courseId,
        },
        canExportCourse: {
          action: COURSE_PERMISSIONS.EXPORT_COURSE,
          scope: courseId,
        },
        canExportTags: {
          action: COURSE_PERMISSIONS.EXPORT_TAGS,
          scope: courseId,
        },
      });
    });
  });

  describe('getViewTeamPermissions', () => {
    it('returns course and library view-team permissions with the correct actions', () => {
      const result = getViewTeamPermissions();

      expect(result).toEqual({
        canViewCourseTeam: {
          action: COURSE_PERMISSIONS.VIEW_COURSE_TEAM,
        },
        canViewLibraryTeam: {
          action: CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM,
        },
      });
    });

    it('is scope-less so it validates the permissions across any course or library', () => {
      const result = getViewTeamPermissions();

      // A scope of '' would be rejected by the AuthZ API as a bad request; the scope key
      // must be absent entirely so the check applies to any object.
      Object.values(result).forEach((permission) => {
        expect(permission).not.toHaveProperty('scope');
      });
    });
  });
});
