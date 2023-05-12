import moment from 'moment';

import messages from '../app-config-form/messages';

export const restrictedDatesStatus = {
  UPCOMING: 'UPCOMING',
  COMPLETE: 'COMPLETE',
  ACTIVE: 'ACTIVE',
};

export const badgeVariant = {
  UPCOMING: 'primary',
  COMPLETE: 'light',
  ACTIVE: 'success',
};

export const deleteRestrictedDatesHelperText = {
  UPCOMING: messages.restrictedDatesDeletionHelp,
  COMPLETE: messages.completeRestrictedDatesDeletionHelp,
  ACTIVE: messages.activeRestrictedDatesDeletionHelp,
};

export const discussionRestriction = {
  OFF: 'off',
  ON: 'on',
  SCHEDULED: 'scheduled',
};

export const discussionRestrictionLabel = {
  [discussionRestriction.OFF]: 'Off',
  [discussionRestriction.ON]: 'On',
  [discussionRestriction.SCHEDULED]: 'Scheduled',
};

export const discussionRestrictionOptions = [
  {
    value: discussionRestriction.OFF,
    description: messages.discussionRestrictionOffLabel,
    label: discussionRestrictionLabel[discussionRestriction.OFF],
  },
  {
    value: discussionRestriction.ON,
    description: messages.discussionRestrictionOnLabel,
    label: discussionRestrictionLabel[discussionRestriction.ON],
  },
  {
    value: discussionRestriction.SCHEDULED,
    description: messages.discussionRestrictionScheduledLabel,
    label: discussionRestrictionLabel[discussionRestriction.SCHEDULED],
  },
];

export const today = moment();
export const active = [today.format('YYYY-MM-DDTHH:mm'), today.add(5, 'hours').format('YYYY-MM-DDTHH:mm')];
export const upcoming = [today.add(2, 'days').format('YYYY-MM-DD'), today.add(5, 'days').format('YYYY-MM-DD')];
export const complete = [today.subtract(7, 'days').format('YYYY-MM-DD'), today.subtract(5, 'days').format('YYYY-MM-DD')];

export const FEATURE_TYPES = ['basic', 'partial', 'full', 'common'];
