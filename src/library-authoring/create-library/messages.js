import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'library.form.generic.error': {
    id: 'library.form.generic.error',
    defaultMessage: 'Invalid field',
    description: 'Text to display on field errors.',
  },
  'library.form.create.library': {
    id: 'library.form.create.library',
    defaultMessage: 'Create a New Library',
    description: 'Text for the form header.',
  },
  'library.form.title.label': {
    id: 'library.form.title.label',
    defaultMessage: 'Library Title *',
    description: 'Label for the title field.',
  },
  'library.form.title.placeholder': {
    id: 'library.form.title.placeholder',
    defaultMessage: 'e.g. Computer Science Problems',
    description: 'Placeholder text for the title field.',
  },
  'library.form.title.help': {
    id: 'library.form.title.help',
    defaultMessage: 'The title for your library.',
    description: 'Help text for the title field.',
  },
  'library.form.org.label': {
    id: 'library.form.org.label',
    defaultMessage: 'Organization *',
    description: 'Label for the organization field.',
  },
  'library.form.org.placeholder': {
    id: 'library.form.org.placeholder',
    defaultMessage: 'e.g. UniversityX or OrganizationX',
    description: 'Placeholder text for the organization field.',
  },
  'library.form.org.help': {
    id: 'library.form.org.help',
    defaultMessage: 'The public organization name for your library. This cannot be changed.',
    description: 'Help text for the organization field.',
  },
  'library.form.slug.label': {
    id: 'library.form.slug.label',
    defaultMessage: 'Library ID *',
    description: 'Label for the slug field.',
  },
  'library.form.slug.placeholder': {
    id: 'library.form.slug.placeholder',
    defaultMessage: 'e.g. CSPROB',
    description: 'Placeholder text for the slug field.',
  },
  'library.form.slug.help': {
    id: 'library.form.slug.help',
    defaultMessage: `The unique id that identifies this library. Note: This is
    part of your library URL, so no spaces or special characters are allowed.
    This cannot be changed.`,
    description: 'Help text for the slug field.',
  },
  'library.form.type.label': {
    id: 'library.form.type.label',
    defaultMessage: 'Library Type *',
    description: 'Label for the type field.',
  },
  'library.form.type.help': {
    id: 'library.form.type.help',
    defaultMessage: 'The type of library that will be created.',
    description: 'Help text for the type field.',
  },
  'library.form.button.cancel': {
    id: 'library.form.button.cancel',
    defaultMessage: 'Cancel',
    description: 'Text for the cancel button.',
  },
  'library.form.type.label.complex': {
    id: 'library.form.type.label.complex',
    defaultMessage: 'Complex',
    description: 'Label for the complex library type.',
  },
  'library.form.type.label.legacy': {
    id: 'library.form.type.label.legacy',
    defaultMessage: 'Legacy',
    description: 'Label for the legacy library type.',
  },
});

export default messages;
