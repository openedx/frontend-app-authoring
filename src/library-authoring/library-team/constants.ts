import messages from './messages';

// Enum values match the possible LibraryTeamMember accessLevel values
export enum LibraryRole {
  Admin = 'admin',
  Author = 'author',
  Reader = 'read',
  Unknown = 'unknown',
}

export const ROLE_LABEL = {
  [LibraryRole.Admin]: messages.roleAdmin,
  [LibraryRole.Author]: messages.roleAuthor,
  [LibraryRole.Reader]: messages.roleReader,
  [LibraryRole.Unknown]: messages.roleUnknown,
};

export const CHANGE_ROLE_LABEL = {
  [LibraryRole.Admin]: messages.makeMemberAdmin,
  [LibraryRole.Author]: messages.makeMemberAuthor,
  [LibraryRole.Reader]: messages.makeMemberReader,
  [LibraryRole.Unknown]: { // Won't be used.
    id: 'library-team-unknown-role',
    defaultMessage: '',
  },
};

export const ROLE_BADGE_VARIANT = {
  [LibraryRole.Admin]: 'info',
  [LibraryRole.Author]: 'dark',
  [LibraryRole.Reader]: 'light',
  [LibraryRole.Unknown]: 'danger',
};

export const ROLE_BUTTON_VARIANT = {
  [LibraryRole.Admin]: 'primary',
  [LibraryRole.Author]: 'secondary',
  [LibraryRole.Reader]: 'tertiary',
  [LibraryRole.Unknown]: 'danger',
};

export const EXAMPLE_USER_EMAIL = 'username@domain.com';
