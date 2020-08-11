import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'library.detail.page.heading': {
    id: 'library.detail.page.heading',
    defaultMessage: 'Content Library',
    description: 'The page heading for the library detail page.',
  },
  'library.detail.loading.message': {
    id: 'library.detail.loading.message',
    defaultMessage: 'Loading...',
    description: 'Message when data is being loaded',
  },
  'library.detail.loading.error': {
    id: 'library.detail.loading.error',
    defaultMessage: 'Error: {errorMessage}',
    description: 'Message when data failed to load',
  },
  'library.detail.new.component': {
    id: 'library.detail.new.component',
    defaultMessage: 'New Component',
    description: 'Text on the new component button.',
  },
  'library.detail.aside.title': {
    id: 'library.detail.aside.title',
    defaultMessage: 'Adding content to your library',
    description: 'Title text for the supplementary content.',
  },
  'library.detail.aside.text.1': {
    id: 'library.detail.aside.text.1',
    defaultMessage: `Add components to your library for use in courses, using
    Add New Component at the bottom of this page.`,
    description: 'Text for the supplementary content.',
  },
  'library.detail.aside.text.2': {
    id: 'library.detail.aside.text.2',
    defaultMessage: `Components are listed in the order in which they are
    added, with the most recently added at the bottom. Use the pagination
    arrows to navigate from page to page if you have more than one page of
    components in your library.`,
    description: 'Text for the supplementary content.',
  },
  'library.detail.aside.help.link': {
    id: 'library.detail.aside.help.link',
    defaultMessage: 'Learn more about content libraries',
    description: 'Link text for the help link in the supplementary content.',
  },
});

export default messages;
