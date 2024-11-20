/**
 * Enum for request status.
 * @readonly
 * @enum {string}
 */
export const RequestStatus = /** @type {const} */ ({
  IN_PROGRESS: 'in-progress',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  DENIED: 'denied',
  PENDING: 'pending',
  CLEAR: 'clear',
  PARTIAL: 'partial',
  PARTIAL_FAILURE: 'partial failure',
  NOT_FOUND: 'not-found',
});

/**
 * Team sizes enum
 * @enum
 * @type {{MIN: number, MAX: number, DEFAULT: number}}
 */
export const TeamSizes = /** @type {const} */ ({
  DEFAULT: 5,
  MIN: 1,
  MAX: 500,
});

/**
 * Group types enum
 * @enum
 * @type {{PRIVATE_MANAGED: string, PUBLIC_MANAGED: string, OPEN: string}}
 */
export const GroupTypes = /** @type {const} */ ({
  OPEN: 'open',
  PUBLIC_MANAGED: 'public_managed',
  PRIVATE_MANAGED: 'private_managed',
  OPEN_MANAGED: 'open_managed',
});

export const DivisionSchemes = /** @type {const} */ ({
  NONE: 'none',
  COHORT: 'cohort',
});

export const VisibilityTypes = /** @type {const} */ ({
  GATED: 'gated',
  LIVE: 'live',
  STAFF_ONLY: 'staff_only',
  HIDE_AFTER_DUE: 'hide_after_due',
  UNSCHEDULED: 'unscheduled',
  NEEDS_ATTENTION: 'needs_attention',
});

export const TOTAL_LENGTH_KEY = 'total-length';

export const MAX_TOTAL_LENGTH = 65;
