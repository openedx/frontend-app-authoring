import { useWaffleFlags } from '@src/data/apiHooks';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { PermissionValidationAnswer, PermissionValidationQuery } from '@src/authz/types';
import { CONTENT_LIBRARY_PERMISSIONS } from '@src/authz/constants';

type UseCourseUserPermissionsReturn<Query extends PermissionValidationQuery> = {
  isLoading: boolean;
  isAuthzEnabled: boolean;
} & PermissionValidationAnswer<Query>;

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
  const shouldValidatePermissions = isAuthzEnabled && !!courseId;

  const {
    isLoading: isLoadingUserPermissions,
    data: userPermissions,
  } = useUserPermissions(permissions, shouldValidatePermissions);

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
 * Validates the `view_library` permission for one or more libraries in a single request.
 *
 * @param libraryKeys - Library key, or list of library keys, to validate.
 * @returns React Query result whose `data` is keyed by library key, e.g. `data?.['lib:OpenedX:CSPROB']`.
 */
export const useLibraryViewPermissions = (libraryKeys: string | string[]) => {
  const keys = Array.isArray(libraryKeys) ? libraryKeys : [libraryKeys];
  return useUserPermissions(
    Object.fromEntries(
      keys.map((key) => [key, { action: CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY, scope: key }]),
    ),
    keys.length > 0,
  );
};
