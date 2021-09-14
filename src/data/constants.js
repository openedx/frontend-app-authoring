/* eslint-disable import/prefer-default-export */

/**
 * Enum for request status.
 * @readonly
 * @enum {string}
 */
export const RequestStatus = {
  IN_PROGRESS: 'in-progress',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  DENIED: 'denied',
};

/**
 * Team sizes enum
 * @enum
 * @type {{MIN: number, MAX: number, DEFAULT: number}}
 */
export const TeamSizes = {
  DEFAULT: 50,
  MIN: 1,
  MAX: 500,
};

/**
 * Team types enum
 * @enum
 * @type {{PRIVATE_MANAGED: string, PUBLIC_MANAGED: string, OPEN: string}}
 */
export const TeamSetTypes = {
  OPEN: 'open',
  PUBLIC_MANAGED: 'public_managed',
  PRIVATE_MANAGED: 'private_managed',
};
