import { defineMessages } from '@edx/frontend-platform/i18n';
import { messageGuard } from '../common/data';

const messages = defineMessages({
  'library.edit.loading.message': {
    id: 'library.edit.loading.message',
    defaultMessage: 'Loading...',
    description: 'Message when data is being loaded',
  },
  'library.edit.page.heading': {
    id: 'library.edit.page.heading',
    defaultMessage: 'Content library',
    description: 'The page heading for the library edit page.',
  },
  'library.edit.title.label': {
    id: 'library.edit.title.label',
    defaultMessage: 'Library title *',
    description: 'Label for the title field.',
  },
  'library.edit.title.placeholder': {
    id: 'library.edit.title.placeholder',
    defaultMessage: 'e.g. Computer Science Problems',
    description: 'Placeholder text for the title field.',
  },
  'library.edit.title.help': {
    id: 'library.edit.title.help',
    defaultMessage: 'The title for your library.',
    description: 'Help text for the title field.',
  },
  'library.edit.description.label': {
    id: 'library.edit.description.label',
    defaultMessage: 'Library description *',
    description: 'Label for the description field.',
  },
  'library.edit.description.placeholder': {
    id: 'library.edit.description.placeholder',
    defaultMessage: 'e.g. This library contains a collection of CS problems.',
    description: 'Placeholder text for the description field.',
  },
  'library.edit.description.help': {
    id: 'library.edit.description.help',
    defaultMessage: 'The description for your library.',
    description: 'Help text for the description field.',
  },
  'library.edit.type.label': {
    id: 'library.edit.type.label',
    defaultMessage: 'Library type *',
    description: 'Label for the type field.',
  },
  'library.edit.type.help': {
    id: 'library.edit.type.help',
    defaultMessage: 'The type of library.',
    description: 'Help text for the type field.',
  },
  'library.edit.type.label.video': {
    id: 'library.edit.type.label.video',
    defaultMessage: 'Video (beta)',
    description: 'Label for the video library type.',
  },
  'library.edit.type.label.problem': {
    id: 'library.edit.type.label.problem',
    defaultMessage: 'Problem (beta)',
    description: 'Label for the problem library type.',
  },
  'library.edit.type.label.complex': {
    id: 'library.edit.type.label.complex',
    defaultMessage: 'Complex (beta)',
    description: 'Label for the complex library type.',
  },
  'library.edit.public_learning.label': {
    id: 'library.edit.public_learning.label',
    defaultMessage: 'Allow public learning',
    description: 'Label for the allow_public_learning field.',
  },
  'library.edit.public_read.label': {
    id: 'library.edit.public_read.label',
    defaultMessage: 'Allow public read',
    description: 'Label for the allow_public_read field.',
  },
  'library.edit.button.submit': {
    id: 'library.edit.button.submit',
    defaultMessage: 'Submit',
    description: 'Text for the submit button.',
  },
  'library.edit.button.submitting': {
    id: 'library.edit.button.submitting',
    defaultMessage: 'Submitting',
    description: 'Text for the submit button when submitting.',
  },
  'library.edit.button.cancel': {
    id: 'library.edit.button.cancel',
    defaultMessage: 'Cancel',
    description: 'Text for the cancel button.',
  },
  'library.edit.aside.title': {
    id: 'library.edit.aside.title',
    defaultMessage: 'Editing your library details',
    description: 'Title text for the supplementary content.',
  },
  'library.edit.aside.text': {
    id: 'library.edit.aside.text',
    defaultMessage: 'Edit the details of your library using the form on the left.',
    description: 'Text for the supplementary content.',
  },
  'library.edit.aside.help.link': {
    id: 'library.edit.aside.help.link',
    defaultMessage: 'Learn more about content libraries',
    description: 'Link text for the help link in the supplementary content.',
  },
});

export default messageGuard(messages);
