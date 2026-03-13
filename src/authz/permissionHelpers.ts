import { COURSE_PERMISSIONS } from './constants';

export const getFilesPermissions = (courseId: string) => ({
  canViewFiles: {
    action: COURSE_PERMISSIONS.VIEW_FILES,
    scope: courseId,
  },
  canCreateFiles: {
    action: COURSE_PERMISSIONS.CREATE_FILES,
    scope: courseId,
  },
  canDeleteFiles: {
    action: COURSE_PERMISSIONS.DELETE_FILES,
    scope: courseId,
  },
  canEditFiles: {
    action: COURSE_PERMISSIONS.EDIT_FILES,
    scope: courseId,
  },
});
