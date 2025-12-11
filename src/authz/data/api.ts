import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  PermissionValidationAnswer,
  PermissionValidationQuery,
  PermissionValidationRequestItem,
  PermissionValidationResponseItem,
} from '@src/authz/types';
import { getApiUrl } from './utils';

export const validateUserPermissions = async (
  query: PermissionValidationQuery,
): Promise<PermissionValidationAnswer> => {
  // Convert the validations query object into an array for the API request
  const request: PermissionValidationRequestItem[] = Object.values(query);

  const { data }: { data: PermissionValidationResponseItem[] } = await getAuthenticatedHttpClient().post(
    getApiUrl('/api/authz/v1/permissions/validate/me'),
    request,
  );

  // Convert the API response back into the expected answer format
  const result: PermissionValidationAnswer = {};
  data.forEach((item: { action: string; scope?: string; allowed: boolean }) => {
    const key = Object.keys(query).find(
      (k) => query[k].action === item.action
        && query[k].scope === item.scope,
    );
    if (key) {
      result[key] = item.allowed;
    }
  });

  // Fill any missing keys with false
  Object.keys(query).forEach((key) => {
    if (!(key in result)) {
      result[key] = false;
    }
  });

  return result;
};
