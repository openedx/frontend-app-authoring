import { defineMessages } from '@edx/frontend-platform/i18n';
import { messageGuard } from '../common/data';

const messages = defineMessages({
  'library.form.generic.error': {
    id: 'library.form.generic.error',
    defaultMessage: 'Invalid field',
    description: 'Text to display on field errors.',
  },
  'library.form.generic.error.title': {
    id: 'library.form.generic.error.title',
    defaultMessage: 'We couldn\'t save your changes.',
    description: 'Text to display on alert title errors.',
  },
  'library.form.generic.error.description': {
    id: 'library.form.generic.error.description',
    defaultMessage: 'Please check your entries and try again.',
    description: 'Text to display on alert description errors.',
  },
  'library.form.create.library': {
    id: 'library.form.create.library',
    defaultMessage: 'Create new library',
    description: 'Text for the form header.',
  },
  'library.form.title.label': {
    id: 'library.form.title.label',
    defaultMessage: 'Library name',
    description: 'Label for the title field.',
  },
  'library.form.title.placeholder': {
    id: 'library.form.title.placeholder',
    defaultMessage: 'e.g. Computer Science Problems',
    description: 'Placeholder text for the title field.',
  },
  'library.form.title.help': {
    id: 'library.form.title.help',
    defaultMessage: 'The name for your library',
    description: 'Help text for the title field.',
  },
  'library.form.org.label': {
    id: 'library.form.org.label',
    defaultMessage: 'Organization',
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
    defaultMessage: 'Library ID',
    description: 'Label for the slug field.',
  },
  'library.form.slug.placeholder': {
    id: 'library.form.slug.placeholder',
    defaultMessage: 'e.g. CSPROB',
    description: 'Placeholder text for the slug field.',
  },
  'library.form.slug.help': {
    id: 'library.form.slug.help',
    defaultMessage: `The unique code that identifies this library. Note: This is 
    part of your library URL, so no spaces or special characters are allowed. 
    This cannot be changed.`,
    description: 'Help text for the slug field.',
  },
  'library.form.button.cancel': {
    id: 'library.form.button.cancel',
    defaultMessage: 'Cancel',
    description: 'Text for the cancel button.',
  },
  'library.form.breadcrumbs.home': {
    id: 'library.form.breadcrumbs.home',
    defaultMessage: 'Studio',
    description: 'Label for the breadcrumbs home link.',
  },
  'library.form.breadcrumbs.list': {
    id: 'library.form.breadcrumbs.list',
    defaultMessage: 'Libraries',
    description: 'Label for the breadcrumbs parent link.',
  },
  'library.form.breadcrumbs.current': {
    id: 'library.form.breadcrumbs.current',
    defaultMessage: 'Library authoring',
    description: 'Label for the breadcrumbs current link.',
  },
  'library.form.modal.title': {
    id: 'library.form.modal.title',
    defaultMessage: 'Unsaved changes',
    description: 'Text to display as a title on alert modal.',
  },
  'library.form.modal.description': {
    id: 'library.form.modal.description',
    defaultMessage: 'Are you sure you want to leave this page? Changes you made will be lost if you proceed.',
    description: 'Text to display as a message on alert modal.',
  },
});

export default messageGuard(messages);
