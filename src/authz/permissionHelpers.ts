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
export const getCourseOutlinePermissions = (courseId: string) => ({
  canViewCourse: {
    action: COURSE_PERMISSIONS.VIEW_COURSE,
    scope: courseId,
  },
  canEditCourseContent: {
    action: COURSE_PERMISSIONS.EDIT_COURSE_CONTENT,
    scope: courseId,
  },
});

export const getLibraryUpdatesPermissions = (courseId: string) => ({
  canManageLibraryUpdates: {
    action: COURSE_PERMISSIONS.MANAGE_LIBRARY_UPDATES,
    scope: courseId,
  },
});

export const getCourseTeamPermissions = (courseId: string) => ({
  canViewCourseTeam: {
    action: COURSE_PERMISSIONS.VIEW_COURSE_TEAM,
    scope: courseId,
  },
});

export const getGroupConfigurationsPermissions = (courseId: string) => ({
  canManageGroupConfigurations: {
    action: COURSE_PERMISSIONS.MANAGE_GROUP_CONFIGURATIONS,
    scope: courseId,
  },
});

export const getCertificatesPermissions = (courseId: string) => ({
  canManageCertificates: {
    action: COURSE_PERMISSIONS.MANAGE_CERTIFICATES,
    scope: courseId,
  },
});

export const getChecklistsPermissions = (courseId: string) => ({
  canViewChecklists: {
    action: COURSE_PERMISSIONS.VIEW_CHECKLISTS,
    scope: courseId,
  },
});

export const getImportExportPermissions = (courseId: string) => ({
  canImportCourse: {
    action: COURSE_PERMISSIONS.IMPORT_COURSE,
    scope: courseId,
  },
  canExportCourse: {
    action: COURSE_PERMISSIONS.EXPORT_COURSE,
    scope: courseId,
  },
  canExportTags: {
    action: COURSE_PERMISSIONS.EXPORT_TAGS,
    scope: courseId,
  },
});

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
