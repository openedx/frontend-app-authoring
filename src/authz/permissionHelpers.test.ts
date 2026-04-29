import {
  getGradingPermissions,
  getPagesAndResourcesPermissions,
  getAdvancedSettingsPermissions,
} from './permissionHelpers';
import { COURSE_PERMISSIONS } from './constants';

describe('permissionHelpers', () => {
  const courseId = 'course-v1:org+course+run';

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
    it('returns VIEW and MANAGE permissions with the correct actions and scope', () => {
      const result = getAdvancedSettingsPermissions(courseId);

      expect(result.canViewAdvancedSettings.action).toBe(COURSE_PERMISSIONS.VIEW_ADVANCED_SETTINGS);
      expect(result.canViewAdvancedSettings.scope).toBe(courseId);
      expect(result.canManageAdvancedSettings.action).toBe(COURSE_PERMISSIONS.MANAGE_ADVANCED_SETTINGS);
      expect(result.canManageAdvancedSettings.scope).toBe(courseId);
    });

    it('uses the provided courseId as scope', () => {
      const otherId = 'course-v1:another+test+run';
      const result = getAdvancedSettingsPermissions(otherId);

      expect(result.canViewAdvancedSettings.scope).toBe(otherId);
      expect(result.canManageAdvancedSettings.scope).toBe(otherId);
    });
  });
});
