import { defineMessages } from '@edx/frontend-platform/i18n';
import { messageGuard } from '../common/data';

const messages = defineMessages({
  'library.header.logo.alt': {
    id: 'library.header.logo.alt',
    defaultMessage: 'Content libraries',
    description: 'Alt text for the the header logo.',
  },
  'library.header.settings.menu': {
    id: 'library.header.settings.menu',
    defaultMessage: 'Settings',
    description: 'Title text for the settings menu.',
  },
  'library.header.settings.details': {
    id: 'library.header.settings.details',
    defaultMessage: 'Details',
    description: 'Text for the details item in the settings menu.',
  },
  'library.header.settings.access': {
    id: 'library.header.settings.access',
    defaultMessage: 'User access',
    description: 'Text for the user access permissions item in the settings menu.',
  },
  'library.header.settings.import': {
    id: 'library.header.settings.import',
    defaultMessage: 'Import',
    description: 'Text for the import course in the settings menu.',
  },
  'library.header.nav.help.title': {
    id: 'library.header.nav.help.title',
    defaultMessage: 'Online help',
    description: 'Title text for the help link.',
  },
  'library.header.nav.help': {
    id: 'library.header.nav.help',
    defaultMessage: 'Help',
    description: 'Text for the help link.',
  },
  'library.header.account.label': {
    id: 'library.header.account.label',
    defaultMessage: 'Account',
    description: 'Label for account navigation.',
  },
  'library.header.account.navigation': {
    id: 'library.header.account.navigation',
    defaultMessage: 'Account navigation',
    description: 'Heading for account navigation.',
  },
  'library.header.account.signedinas': {
    id: 'library.header.account.signedinas',
    defaultMessage: 'Currently signed in as:',
    description: 'Label for signed-in-as field.',
  },
  'library.header.account.studiohome': {
    id: 'library.header.account.studiohome',
    defaultMessage: 'Studio home',
    description: 'Text for link to studio.',
  },
  'library.header.account.maintenance': {
    id: 'library.header.account.maintenance',
    defaultMessage: 'Maintenance',
    description: 'Text for link to maintenance.',
  },
  'library.header.account.signout': {
    id: 'library.header.account.signout',
    defaultMessage: 'Sign out',
    description: 'Text for link to sign out.',
  },
});

export default messageGuard(messages);
