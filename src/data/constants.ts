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
  PENDING: 'pending',
  CLEAR: 'clear',
  PARTIAL: 'partial',
  PARTIAL_FAILURE: 'partial failure',
  NOT_FOUND: 'not-found',
} as const;
export type RequestStatusType = (typeof RequestStatus)[keyof typeof RequestStatus];

export const RequestFailureStatuses = [
  RequestStatus.FAILED,
  RequestStatus.DENIED,
  RequestStatus.PARTIAL_FAILURE,
  RequestStatus.NOT_FOUND,
];

/**
 * Team sizes enum
 * @enum
 */
export const TeamSizes = {
  DEFAULT: 5,
  MIN: 1,
  MAX: 500,
} as const;

/**
 * Group types enum
 * @enum
 */
export const GroupTypes = {
  OPEN: 'open',
  PUBLIC_MANAGED: 'public_managed',
  PRIVATE_MANAGED: 'private_managed',
  OPEN_MANAGED: 'open_managed',
} as const;

export const DivisionSchemes = {
  NONE: 'none',
  COHORT: 'cohort',
} as const;

export const VisibilityTypes = {
  GATED: 'gated',
  LIVE: 'live',
  STAFF_ONLY: 'staff_only',
  HIDE_AFTER_DUE: 'hide_after_due',
  UNSCHEDULED: 'unscheduled',
  NEEDS_ATTENTION: 'needs_attention',
} as const;

export const TOTAL_LENGTH_KEY = 'total-length';

export const MAX_TOTAL_LENGTH = 65;
