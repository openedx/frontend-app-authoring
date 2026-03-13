import { getFilesPermissions } from './permissionHelpers';
import { COURSE_PERMISSIONS } from './constants';

describe('permissionHelpers', () => {
  describe('getFilesPermissions', () => {
    const mockCourseId = 'course-v1:edX+DemoX+Demo_Course';

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

    it('should use correct COURSE_PERMISSIONS constants for each action', () => {
      const result = getFilesPermissions(mockCourseId);

      expect(result.canViewFiles.action).toBe(COURSE_PERMISSIONS.VIEW_FILES);
      expect(result.canCreateFiles.action).toBe(COURSE_PERMISSIONS.CREATE_FILES);
      expect(result.canDeleteFiles.action).toBe(COURSE_PERMISSIONS.DELETE_FILES);
      expect(result.canEditFiles.action).toBe(COURSE_PERMISSIONS.EDIT_FILES);
    });
  });
});
