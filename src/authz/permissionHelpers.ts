import { COURSE_PERMISSIONS } from './constants';

export const getScheduleAndDetailsPermissions = (courseId: string) => ({
  canViewScheduleAndDetails: {
    action: COURSE_PERMISSIONS.VIEW_SCHEDULE_AND_DETAILS,
    scope: courseId,
  },
  canEditSchedule: {
    action: COURSE_PERMISSIONS.EDIT_SCHEDULE,
    scope: courseId,
  },
  canEditDetails: {
    action: COURSE_PERMISSIONS.EDIT_DETAILS,
    scope: courseId,
  },
});

export const getGradingPermissions = (courseId: string) => ({
  canViewGradingSettings: {
    action: COURSE_PERMISSIONS.VIEW_GRADING_SETTINGS,
    scope: courseId,
  },
  canEditGradingSettings: {
    action: COURSE_PERMISSIONS.EDIT_GRADING_SETTINGS,
    scope: courseId,
  },
});

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
