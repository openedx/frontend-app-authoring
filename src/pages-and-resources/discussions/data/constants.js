import moment from 'moment';

import messages from '../app-config-form/apps/shared/messages';

export const blackoutDatesStatus = {
  UPCOMING: 'UPCOMING',
  COMPLETE: 'COMPLETE',
  ACTIVE: 'ACTIVE',
  NEW: 'NEW',
};

export const badgeVariant = {
  UPCOMING: 'primary',
  COMPLETE: 'light',
  ACTIVE: 'success',
  NEW: 'LIGHT',
};

export const deleteHelperText = {
  UPCOMING: messages.blackoutDatesDeletionHelp,
  COMPLETE: messages.completeBlackoutDatesDeletionHelp,
  ACTIVE: messages.activeBlackoutDatesDeletionHelp,
  NEW: messages.completeBlackoutDatesDeletionHelp,
};

export const today = moment();
export const active = [today.format('YYYY-MM-DDTHH:mm'), today.add(5, 'hours').format('YYYY-MM-DDTHH:mm')];
export const upcoming = [today.add(2, 'days').format('YYYY-MM-DD'), today.add(5, 'days').format('YYYY-MM-DD')];
export const complete = [today.subtract(7, 'days').format('YYYY-MM-DD'), today.subtract(5, 'days').format('YYYY-MM-DD')];
