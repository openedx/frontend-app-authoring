import {
  getGradingPermissions,
  getPagesAndResourcesPermissions,
  getAdvancedSettingsPermissions,
  getCourseUpdatesPermissions,
  getFilesPermissions,
} from './permissionHelpers';
import { COURSE_PERMISSIONS } from './constants';

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
});
