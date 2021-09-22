import messages from '../app-config-form/apps/shared/messages';

export const blackoutDatesStatus = {
  UPCOMING: 'UPCOMING',
  COMPLETE: 'COMPLETE',
  ACTIVE: 'ACTIVE',
};

export const badgeVariant = {
  UPCOMING: 'primary',
  COMPLETE: 'light',
  ACTIVE: 'success',
};

export const deleteHelperText = {
  UPCOMING: messages.blackoutDatesDeletionHelp,
  COMPLETE: messages.completeBlackoutDatesDeletionHelp,
  ACTIVE: messages.activeBlackoutDatesDeletionHelp,
};
