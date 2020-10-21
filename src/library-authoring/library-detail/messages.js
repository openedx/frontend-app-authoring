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
  'library.detail.add.new.component': {
    id: 'library.detail.add.new.component',
    defaultMessage: 'Add New Component',
    description: 'Header on the add new component box.',
  },
  'library.detail.add.new.component.type': {
    id: 'library.detail.add.new.component.type',
    defaultMessage: 'Type',
    description: 'Label for the component type input field.',
  },
  'library.detail.add.new.component.slug': {
    id: 'library.detail.add.new.component.slug',
    defaultMessage: 'Slug',
    description: 'Label for the component slug input field.',
  },
  'library.detail.add.new.component.button': {
    id: 'library.detail.add.new.component.button',
    defaultMessage: 'Add Component',
    description: 'Text for the add component button.',
  },
  'library.detail.block.unpublished_changes': {
    id: 'library.detail.block.unpublished_changes',
    defaultMessage: 'Unpublished Changes',
    description: 'Text for a block with unpublished changes.',
  },
  'library.detail.block.view_link': {
    id: 'library.detail.block.view_link',
    defaultMessage: 'View',
    description: 'Text for a the view link in a block.',
  },
  'library.detail.block.edit_link': {
    id: 'library.detail.block.edit_link',
    defaultMessage: 'Edit',
    description: 'Text for a the edit link in a block.',
  },
  'library.detail.aside.title': {
    id: 'library.detail.aside.title',
    defaultMessage: 'Adding content to your library',
    description: 'Title text for the supplementary content.',
  },
  'library.detail.aside.text.1': {
    id: 'library.detail.aside.text.1',
    defaultMessage: `Add components to your library for use in courses, using
    Add New Component at the bottom of this page. Note that the slug becomes
    part of the usage ID and definition ID, and cannot be changed.`,
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
  'library.detail.aside.draft': {
    id: 'library.detail.aside.draft',
    defaultMessage: 'Draft (Unpublished changes)',
    description: 'Library has unpublished changes.',
  },
  'library.detail.aside.published': {
    id: 'library.detail.aside.published',
    defaultMessage: 'Published',
    description: 'Library has no unpublished changes.',
  },
  'library.detail.aside.publish': {
    id: 'library.detail.aside.publish',
    defaultMessage: 'Publish',
    description: 'Text for the publish button.',
  },
  'library.detail.aside.discard': {
    id: 'library.detail.aside.discard',
    defaultMessage: 'Discard changes',
    description: 'Text for the discard button.',
  },
  'library.detail.block.edit': {
    id: 'library.detail.block.edit',
    defaultMessage: 'Edit',
    description: 'Button text for edit button',
  },
  'library.detail.block.delete': {
    id: 'library.detail.block.delete',
    defaultMessage: 'Delete',
    description: 'Aria label for delete button',
  },
  'library.detail.block.delete.modal.title': {
    id: 'library.detail.block.delete.modal.title',
    defaultMessage: 'Delete this component?',
    description: 'Title bar for the block deletion modal.',
  },
  'library.detail.block.delete.modal.body': {
    id: 'library.detail.block.delete.modal.body',
    defaultMessage: 'Deleting this component is permanent and cannot be undone.',
    description: 'Body for the block deletion modal.',
  },
  'library.detail.block.copy': {
    id: 'library.detail.block.copy',
    defaultMessage: 'Copy',
    description: 'Aria label for copy button',
  },
  'library.detail.add_video': {
    id: 'library.detail.add_video',
    defaultMessage: 'Add Video',
    description: 'Button text for the "Add Video" button on video libraries.',
  },
  'library.detail.add_problem': {
    id: 'library.detail.add_problem',
    defaultMessage: 'Add Problem',
    description: 'Button text for the "Add Video" button on video libraries.',
  },
  'library.detail.add_complex': {
    id: 'library.detail.add_complex',
    defaultMessage: 'Add Component',
    description: 'Button text for the "Add Component" button on complex libraries.',
  },
  'library.detail.show_previews': {
    id: 'library.detail.show_previews',
    defaultMessage: 'Show Previews',
    description: 'Text for button which enables previews',
  },
  'library.detail.hide_previews': {
    id: 'library.detail.hide_previews',
    defaultMessage: 'Hide Previews',
    description: 'Text for button which disables previews',
  },
  'library.detail.sidebar.adding.heading': {
    id: 'library.detail.sidebar.adding.heading',
    defaultMessage: 'Adding content to your library',
    description: 'Header for the sidebar instructions for adding content to your library.',
  },
  'library.detail.sidebar.adding.first': {
    id: 'library.detail.sidebar.adding.first',
    defaultMessage: 'Add components to your library for use in courses, using the Add button at the bottom of '
      + 'this page.',
    description: 'First paragraph of instructional text about how to add content to a library.',
  },
  'library.detail.sidebar.adding.second': {
    id: 'library.detail.sidebar.adding.second',
    defaultMessage: 'Components are listed in the order in which they are added, with the most recently added at the '
      + 'bottom. Use the pagination arrows to navigate from page to page if you have more than one page of components '
      + 'in your library.',
    description: 'Second paragraph of instructional text about how to add content to a library.',
  },
  'library.detail.sidebar.using.heading': {
    id: 'library.detail.sidebar.using.heading',
    defaultMessage: 'Using library content in courses',
    description: 'Header for the sidebar instructions for using library content.',
  },
  'library.detail.sidebar.using.first': {
    id: 'library.detail.sidebar.using.first',
    defaultMessage: 'Use library content in courses by adding the "library_content" policy key to the Advanced Module '
      + 'List in the course\'s Advanced Settings, then adding a Randomized Content Block to your courseware. In the '
      + 'settings for each Randomized Content Block, select this library as the source library, and specify the number '
      + 'of problems to be randomly selected and displayed to each student.',
    description: 'The first (and presently only) paragraph of instructional text about how to use library content.',
  },
});

export default messages;
