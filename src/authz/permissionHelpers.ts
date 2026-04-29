import { COURSE_PERMISSIONS } from './constants';

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
  canEditPagesAndResources: {
    action: COURSE_PERMISSIONS.EDIT_PAGES_AND_RESOURCES,
    scope: courseId,
  },
});

export const getAdvancedSettingsPermissions = (courseId: string) => ({
  canViewAdvancedSettings: {
    action: COURSE_PERMISSIONS.VIEW_ADVANCED_SETTINGS,
    scope: courseId,
  },
  canManageAdvancedSettings: {
    action: COURSE_PERMISSIONS.MANAGE_ADVANCED_SETTINGS,
    scope: courseId,
  },
});
