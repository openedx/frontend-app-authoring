import { useWaffleFlags } from '@src/data/apiHooks';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { PermissionValidationAnswer, PermissionValidationQuery } from '@src/authz/types';

type UseCourseUserPermissionsReturn<Query extends PermissionValidationQuery> = {
  isLoading: boolean;
  isAuthzEnabled: boolean;
} & PermissionValidationAnswer<Query>;

/**
 * Return type for the useUserCoursePermissionsWithAuthz hook
 */
interface UseUserPermissionsWithAuthzCourseReturn {
  /** Whether permissions are currently loading */
  isLoading: boolean;
  /** Object containing permission results with boolean values */
  permissions: PermissionValidationAnswer;
  /** Whether authorization is enabled for the course */
  isAuthzEnabled: boolean;
}

/**
 * Custom hook to retrieve and evaluate user permissions for the current course using the openedx-authz service.
 *
 * The hook:
 * 1. Validate if authz is enabled via waffle flag
 * 2. Fetch user permissions when authz is enabled
 * 3. Fallback all permissions to 'true' when authz is disabled
 * 4. Provide fallback values for undefined permissions
 *
 * @param courseId - The course ID to check permissions for
 * @param permissions - Object mapping permission names to their action/scope definitions
 * @returns Object containing loading state, permissions results, and authz status
 *
 * @example
 * ```tsx
 * const { isLoading, canViewGradingSettings, canEditGradingSettings, isAuthzEnabled } = useCourseUserPermissions(
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
 * ```
 */
export const useCourseUserPermissions = <Query extends PermissionValidationQuery>(
  courseId: string,
  permissions: Query,
): UseCourseUserPermissionsReturn<Query> => {
  const waffleFlags = useWaffleFlags(courseId);
  const isWaffleFlagsLoading: boolean = waffleFlags?.isLoading ?? true;
  const isAuthzEnabled: boolean = waffleFlags?.enableAuthzCourseAuthoring ?? false;

  const {
    isLoading: isLoadingUserPermissions,
    data: userPermissions,
  } = useUserPermissions(permissions, isAuthzEnabled);

  const isLoading = isWaffleFlagsLoading || (isAuthzEnabled && isLoadingUserPermissions);

  const resolvePermission = (key: string): boolean => {
    if (!isAuthzEnabled) {
      return true;
    }
    return userPermissions?.[key] ?? false;
  };

  const permissionResults: Record<string, boolean> = isLoading
    ? Object.keys(permissions).reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = false;
      return acc;
    }, {})
    : Object.keys(permissions).reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = resolvePermission(key);
      return acc;
    }, {});

  return {
    isLoading,
    isAuthzEnabled,
    ...permissionResults as PermissionValidationAnswer<Query>,
  };
};

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
 *     canViewFiles: {
 *       action: COURSE_PERMISSIONS.VIEW_FILES,
 *       scope: courseId,
 *     },
 *     canManageFiles: {
 *       action: COURSE_PERMISSIONS.MANAGE_FILES,
 *       scope: courseId,
 *     },
 *   }
 * );
 *
 * const { canViewFiles, canManageFiles } = permissions;
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

  // Build permission results object
  const permissionResults: PermissionValidationAnswer = {};

  if (isAuthzEnabled && !isLoadingUserPermissions) {
    // Authz is enabled and permissions loaded, use actual permission values with fallback to false
    Object.keys(permissions).forEach((permissionKey: string) => {
      permissionResults[permissionKey] = userPermissions?.[permissionKey] ?? false;
    });
  } else if (!isLoadingUserPermissions) {
    // Authz is disabled or permissions still loading, default all to true
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
