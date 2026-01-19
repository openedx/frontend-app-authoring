import { skipToken, useQuery } from '@tanstack/react-query';
import { PermissionValidationAnswer, PermissionValidationQuery } from '@src/authz/types';
import { validateUserPermissions } from './api';

const adminConsoleQueryKeys = {
  all: ['authz'],
  permissions: (permissions: PermissionValidationQuery) => [...adminConsoleQueryKeys.all, 'validatePermissions', permissions] as const,
};

/**
 * React Query hook to validate if the current user has permissions over a certain object in the instance.
 * It helps to:
 * - Determine whether the current user can access certain object.
 * - Provide role-based rendering logic for UI components.
 *
 * @param permissions - A key/value map of objects and actions to validate.
 * The key is an arbitrary string to identify the permission check,
 * and the value is an object containing the action and optional scope.
 *
 * @example
 * const { isLoading, data } = useUserPermissions({
 *     canRead: {
 *         action: "content_libraries.view_library",
 *         scope: "lib:OpenedX:CSPROB"
 *      }
 *    });
 * if (data.canRead) { ... }
 *
 */
export const useUserPermissions = (
  permissions: PermissionValidationQuery,
  enabled: boolean = true,
) => useQuery<PermissionValidationAnswer, Error>({
  queryKey: adminConsoleQueryKeys.permissions(permissions),
  queryFn: enabled ? () => validateUserPermissions(permissions) : skipToken,
  retry: false,
});
