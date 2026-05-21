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

export const getPagesAndResourcesPermissions = (courseId: string) => ({
  canViewPagesAndResources: {
    action: COURSE_PERMISSIONS.VIEW_PAGES_AND_RESOURCES,
    scope: courseId,
  },
  canManagePagesAndResources: {
    action: COURSE_PERMISSIONS.MANAGE_PAGES_AND_RESOURCES,
    scope: courseId,
  },
});

export const getAdvancedSettingsPermissions = (courseId: string) => ({
  canManageAdvancedSettings: {
    action: COURSE_PERMISSIONS.MANAGE_ADVANCED_SETTINGS,
    scope: courseId,
  },
});
