export const MODAL_TYPES = {
  error: 'error',
  delete: 'delete',
  warning: 'warning',
} as const;

export type ModalType = typeof MODAL_TYPES[keyof typeof MODAL_TYPES];

export const BADGE_STATES = {
  admin: 'primary-700',
  staff: 'gray-500',
} as const;

export const USER_ROLES = {
  admin: 'instructor',
  staff: 'staff',
} as const;

export const EXAMPLE_USER_EMAIL = 'username@domain.com';
