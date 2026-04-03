import { COURSE_PERMISSIONS } from './constants';

export const getCourseUpdatesPermissions = (courseId: string) => ({
  canViewCourseUpdates: {
    action: COURSE_PERMISSIONS.VIEW_COURSE_UPDATES,
    scope: courseId,
  },
  canManageCourseUpdates: {
    action: COURSE_PERMISSIONS.MANAGE_COURSE_UPDATES,
    scope: courseId,
  },
});
