import { getConfig } from '@edx/frontend-platform';

/**
 * URLs of the admin console MFE, where roles and permissions are managed when authz is enabled.
 *
 * ADMIN_CONSOLE_URL is null when the MFE isn't deployed; the callers that offer a legacy in-Studio
 * team UI as an alternative check `isAdminConsoleEnabled()` before building any of these links.
 */

const getAdminConsoleBaseUrl = (): string => getConfig().ADMIN_CONSOLE_URL ?? '';

/** Whether the admin console MFE is deployed. */
export const isAdminConsoleEnabled = (): boolean => !!getConfig().ADMIN_CONSOLE_URL;

/** "Roles & permissions" home, covering every scope the user can manage. */
export const getAdminConsoleUrl = (): string => `${getAdminConsoleBaseUrl()}/authz`;

/** "Roles & permissions" of a single scope: a course or a library. */
export const getAdminConsoleScopeUrl = (scope: string): string => (
  `${getAdminConsoleUrl()}?scope=${encodeURIComponent(scope)}`
);
