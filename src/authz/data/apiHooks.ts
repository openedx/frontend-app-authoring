import { useQuery } from '@tanstack/react-query';
import { PermissionValidationRequest, PermissionValidationResponse } from '@src/authz/types';
import { validateUserPermissions } from './api';

const adminConsoleQueryKeys = {
  all: ['authz'],
  permissions: (permissions: PermissionValidationRequest[]) => [...adminConsoleQueryKeys.all, 'validatePermissions', permissions] as const,
};

/**
 * React Query hook to validate if the current user has permissions over a certain object in the instance.
 * It helps to:
 * - Determine whether the current user can access certain object.
 * - Provide role-based rendering logic for UI components.
 *
 * @param permissions - The array of objects and actions to validate.
 *
 * @example
 * const { data } = useValidateUserPermissions([{
           "action": "act:read",
           "scope": "org:OpenedX"
       }]);
 * if (data[0].allowed) { ... }
 *
 */
export const useValidateUserPermissions = (
  permissions: PermissionValidationRequest[],
) => useQuery<PermissionValidationResponse[], Error>({
  queryKey: adminConsoleQueryKeys.permissions(permissions),
  queryFn: () => validateUserPermissions(permissions),
  retry: false,
});
