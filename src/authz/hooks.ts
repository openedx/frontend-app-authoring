import { useWaffleFlags } from '@src/data/apiHooks';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { PermissionValidationQuery, PermissionValidationAnswer } from '@src/authz/types';

interface UseUserPermissionsWithAuthzCourseReturn {
  isLoading: boolean;
  permissions: PermissionValidationAnswer;
  isAuthzEnabled: boolean;
}

/**
 * Custom hook to handle user permissions with course authorization waffle flag
 *
 * This hook abstracts the common pattern of:
 * 1. Checking if authz is enabled via waffle flag
 * 2. Fetching user permissions when authz is enabled
 * 3. Defaulting all permissions to true when authz is disabled
 * 4. Providing fallback values for undefined permissions
 *
 * @param courseId - The course ID to check permissions for
 * @param permissions - Object mapping permission names to their action/scope definitions
 * @returns Object containing loading state, permissions results, and authz status
 *
 * @example
 * ```tsx
 * const { isLoading, permissions, isAuthzEnabled } = useUserPermissionsWithAuthzCourse(
 *   courseId,
 *   {
 *     canViewGradingSettings: {
 *       action: COURSE_PERMISSIONS.VIEW_GRADING_SETTINGS,
 *       scope: courseId,
 *     },
 *     canEditGradingSettings: {
 *       action: COURSE_PERMISSIONS.EDIT_GRADING_SETTINGS,
 *       scope: courseId,
 *     },
 *   }
 * );
 *
 * const { canViewGradingSettings, canEditGradingSettings } = permissions;
 * ```
 */
export const useUserPermissionsWithAuthzCourse = (
  courseId: string,
  permissions: PermissionValidationQuery,
): UseUserPermissionsWithAuthzCourseReturn => {
  const waffleFlags = useWaffleFlags(courseId);
  const isAuthzEnabled: boolean = waffleFlags?.enableAuthzCourseAuthoring ?? false;

  const {
    isLoading: isLoadingUserPermissions,
    data: userPermissions,
  } = useUserPermissions(permissions, isAuthzEnabled);

  const permissionResults: PermissionValidationAnswer = {};

  if (isAuthzEnabled && !isLoadingUserPermissions) {
    Object.keys(permissions).forEach((permissionKey: string) => {
      permissionResults[permissionKey] = userPermissions?.[permissionKey] ?? false;
    });
  } else if (!isLoadingUserPermissions) {
    Object.keys(permissions).forEach((permissionKey: string) => {
      permissionResults[permissionKey] = true;
    });
  }

  return {
    isLoading: isAuthzEnabled ? isLoadingUserPermissions : false,
    permissions: permissionResults,
    isAuthzEnabled,
  };
};
