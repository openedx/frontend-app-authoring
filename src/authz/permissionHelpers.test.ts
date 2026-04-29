import { getGradingPermissions, getPagesAndResourcesPermissions } from './permissionHelpers';
import { COURSE_PERMISSIONS } from './constants';

describe('permissionHelpers', () => {
  const courseId = 'course-v1:org+course+run';

  describe('getGradingPermissions', () => {
    it('returns correct permission structure with VIEW action', () => {
      const result = getGradingPermissions(courseId);

      expect(result.canViewGradingSettings).toBeDefined();
      expect(result.canViewGradingSettings.action).toBe(COURSE_PERMISSIONS.VIEW_GRADING_SETTINGS);
      expect(result.canViewGradingSettings.scope).toBe(courseId);
    });

    it('returns correct permission structure with EDIT action', () => {
      const result = getGradingPermissions(courseId);

      expect(result.canEditGradingSettings).toBeDefined();
      expect(result.canEditGradingSettings.action).toBe(COURSE_PERMISSIONS.EDIT_GRADING_SETTINGS);
      expect(result.canEditGradingSettings.scope).toBe(courseId);
    });

    it('returns both VIEW and EDIT permissions in single call', () => {
      const result = getGradingPermissions(courseId);

      const permissions = Object.keys(result);
      expect(permissions).toContain('canViewGradingSettings');
      expect(permissions).toContain('canEditGradingSettings');
    });

    it('uses correct courseId as scope for all permissions', () => {
      const customCourseId = 'course-v1:custom+org+custom_run';
      const result = getGradingPermissions(customCourseId);

      expect(result.canViewGradingSettings.scope).toBe(customCourseId);
      expect(result.canEditGradingSettings.scope).toBe(customCourseId);
    });
  });

  describe('getPagesAndResourcesPermissions', () => {
    it('returns correct permission structure with VIEW action', () => {
      const result = getPagesAndResourcesPermissions(courseId);

      expect(result.canViewPagesAndResources).toBeDefined();
      expect(result.canViewPagesAndResources.action).toBe(COURSE_PERMISSIONS.VIEW_PAGES_AND_RESOURCES);
      expect(result.canViewPagesAndResources.scope).toBe(courseId);
    });

    it('returns correct permission structure with EDIT action', () => {
      const result = getPagesAndResourcesPermissions(courseId);

      expect(result.canEditPagesAndResources).toBeDefined();
      expect(result.canEditPagesAndResources.action).toBe(COURSE_PERMISSIONS.EDIT_PAGES_AND_RESOURCES);
      expect(result.canEditPagesAndResources.scope).toBe(courseId);
    });

    it('returns both VIEW and EDIT permissions in single call', () => {
      const result = getPagesAndResourcesPermissions(courseId);

      const permissions = Object.keys(result);
      expect(permissions).toContain('canViewPagesAndResources');
      expect(permissions).toContain('canEditPagesAndResources');
    });

    it('uses correct courseId as scope for all permissions', () => {
      const customCourseId = 'course-v1:another+test+course';
      const result = getPagesAndResourcesPermissions(customCourseId);

      expect(result.canViewPagesAndResources.scope).toBe(customCourseId);
      expect(result.canEditPagesAndResources.scope).toBe(customCourseId);
    });
  });

  describe('permission constants verification', () => {
    it('uses correct VIEW_GRADING_SETTINGS constant', () => {
      const result = getGradingPermissions(courseId);
      expect(result.canViewGradingSettings.action).toBe('courses.view_grading_settings');
    });

    it('uses correct EDIT_GRADING_SETTINGS constant', () => {
      const result = getGradingPermissions(courseId);
      expect(result.canEditGradingSettings.action).toBe('courses.edit_grading_settings');
    });

    it('uses correct VIEW_PAGES_AND_RESOURCES constant', () => {
      const result = getPagesAndResourcesPermissions(courseId);
      expect(result.canViewPagesAndResources.action).toBe('courses.view_pages_and_resources');
    });

    it('uses correct EDIT_PAGES_AND_RESOURCES constant', () => {
      const result = getPagesAndResourcesPermissions(courseId);
      expect(result.canEditPagesAndResources.action).toBe('courses.manage_pages_and_resources');
    });
  });

  describe('edge cases', () => {
    it('handles empty courseId', () => {
      const result = getGradingPermissions('');

      expect(result.canViewGradingSettings.scope).toBe('');
      expect(result.canEditGradingSettings.scope).toBe('');
    });

    it('handles special characters in courseId', () => {
      const specialCourseId = 'course-v1:test+special:id';
      const result = getPagesAndResourcesPermissions(specialCourseId);

      expect(result.canViewPagesAndResources.scope).toBe(specialCourseId);
    });

    it('returns consistent structure across multiple calls', () => {
      const result1 = getGradingPermissions(courseId);
      const result2 = getGradingPermissions(courseId);

      expect(Object.keys(result1)).toEqual(Object.keys(result2));
      expect(result1.canViewGradingSettings.action).toBe(result2.canViewGradingSettings.action);
    });
  });
});
