export const LAST_EXPORT_COOKIE_NAME = 'lastexport';
export const LINK_CHECK_STATUSES = {
  UNINITIATED: 'Uninitiated',
  PENDING: 'Pending',
  IN_PROGRESS: 'In-Progress',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed',
  CANCELED: 'Canceled',
  RETRYING: 'Retrying',
};
export const LINK_CHECK_IN_PROGRESS_STATUSES = [
  LINK_CHECK_STATUSES.PENDING,
  LINK_CHECK_STATUSES.IN_PROGRESS,
  LINK_CHECK_STATUSES.RETRYING,
];
export const SUCCESS_DATE_FORMAT = 'MM/DD/yyyy';
