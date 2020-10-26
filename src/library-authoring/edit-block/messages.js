import { defineMessages } from '@edx/frontend-platform/i18n';
import { messageGuard } from '../common/data';

const messages = defineMessages({
  'library.block.page.heading': {
    id: 'library.block.page.heading',
    defaultMessage: 'Component',
    description: 'The page heading for the library.block page.',
  },
  'library.block.page.back_to_library': {
    id: 'library.block.page.back_to_library',
    defaultMessage: 'Back to Library',
    description: 'Text for the button that takes you back to the library authoring page.',
  },
  'library.block.loading.message': {
    id: 'library.block.loading.message',
    defaultMessage: 'Loading...',
    description: 'Message when data is being loaded',
  },
  'library.block.loading.error': {
    id: 'library.block.loading.error',
    defaultMessage: 'Error: {errorMessage}',
    description: 'Message when data failed to load',
  },
  'library.block.block.unpublished_changes': {
    id: 'library.block.block.unpublished_changes',
    defaultMessage: 'Unpublished Changes',
    description: 'Text for a block with unpublished changes.',
  },
  'library.block.block.view_link': {
    id: 'library.block.block.view_link',
    defaultMessage: 'View',
    description: 'Text for a the view link in a block.',
  },
  'library.block.block.edit_link': {
    id: 'library.block.block.edit_link',
    defaultMessage: 'Edit',
    description: 'Text for a the edit link in a block.',
  },
  'library.block.aside.title': {
    id: 'library.block.aside.title',
    defaultMessage: 'Adding content to your library',
    description: 'Title text for the supplementary content.',
  },
  'library.block.aside.text.1': {
    id: 'library.block.aside.text.1',
    defaultMessage: 'Add a component to your library for use in courses.',
    description: 'Text for the supplementary content.',
  },
  'library.block.aside.help.link': {
    id: 'library.block.aside.help.link',
    defaultMessage: 'Learn more about content libraries',
    description: 'Link text for the help link in the supplementary content.',
  },
  'library.block.aside.draft': {
    id: 'library.detail.aside.draft',
    defaultMessage: 'Draft (Unpublished changes)',
    description: 'Block has unpublished changes.',
  },
  'library.block.aside.published': {
    id: 'library.detail.aside.published',
    defaultMessage: 'Published',
    description: 'Block has no unpublished changes.',
  },
  'library.block.aside.publish': {
    id: 'library.block.aside.publish',
    defaultMessage: 'Publish library',
    description: 'Text for the publish button.',
  },
  'library.block.aside.discard': {
    id: 'library.block.aside.discard',
    defaultMessage: 'Discard library changes',
    description: 'Text for the discard button.',
  },
  'library.block.aside.delete': {
    id: 'library.block.aside.delete',
    defaultMessage: 'Delete block',
    description: 'Button text for the delete block button.',
  },
});

export default messageGuard(messages);
