import { getCourseUpdatesPermissions } from './permissionHelpers';
import { COURSE_PERMISSIONS } from './constants';

describe('permissionHelpers', () => {
  describe('getCourseUpdatesPermissions', () => {
    const mockCourseId = 'course-v1:edX+DemoX+Demo_Course';

    it('should return correct permission structure for course updates operations', () => {
      const result = getCourseUpdatesPermissions(mockCourseId);

      expect(result).toEqual({
        canViewCourseUpdates: {
          action: COURSE_PERMISSIONS.VIEW_COURSE_UPDATES,
          scope: mockCourseId,
        },
        canManageCourseUpdates: {
          action: COURSE_PERMISSIONS.MANAGE_COURSE_UPDATES,
          scope: mockCourseId,
        },
      });
    });

    it('should use the provided courseId as scope for all permissions', () => {
      const customCourseId = 'course-v1:TestOrg+TestCourse+2024';
      const result = getCourseUpdatesPermissions(customCourseId);

      Object.values(result).forEach(permission => {
        expect(permission.scope).toBe(customCourseId);
      });
    });
  });
});
