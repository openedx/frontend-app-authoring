import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { PermissionValidationRequest, PermissionValidationResponse } from '@src/authz/types';
import { getApiUrl } from './utils';

export const validateUserPermissions = async (
  validations: PermissionValidationRequest[],
): Promise<PermissionValidationResponse[]> => {
  const { data } = await getAuthenticatedHttpClient().post(getApiUrl('/api/authz/v1/permissions/validate/me'), validations);
  return data;
};