import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headerSubtitle: {
    id: 'course-authoring.content-tags-drawer.header.subtitle',
    defaultMessage: 'Manage tags',
  },
  addTagsButtonText: {
    id: 'course-authoring.content-tags-drawer.collapsible.add-tags.button',
    defaultMessage: 'Add tags',
  },
  loadingMessage: {
    id: 'course-authoring.content-tags-drawer.spinner.loading',
    defaultMessage: 'Loading',
  },
  loadingTagsDropdownMessage: {
    id: 'course-authoring.content-tags-drawer.tags-dropdown-selector.spinner.loading',
    defaultMessage: 'Loading tags',
  },
  loadMoreTagsButtonText: {
    id: 'course-authoring.content-tags-drawer.tags-dropdown-selector.load-more-tags.button',
    defaultMessage: 'Load more',
  },
  noTagsFoundMessage: {
    id: 'course-authoring.content-tags-drawer.tags-dropdown-selector.no-tags-found',
    defaultMessage: 'No tags found with the search term "{searchTerm}"',
  },
  taxonomyTagChecked: {
    id: 'course-authoring.content-tags-drawer.tags-dropdown-selector.tag-checked',
    defaultMessage: 'Checked',
  },
  taxonomyTagUnchecked: {
    id: 'course-authoring.content-tags-drawer.tags-dropdown-selector.tag-unchecked',
    defaultMessage: 'Unchecked',
  },
  taxonomyTagImplicit: {
    id: 'course-authoring.content-tags-drawer.tags-dropdown-selector.tag-implicit',
    defaultMessage: 'Implicit',
  },
  taxonomyTagActionInstructionsAriaLabel: {
    id: 'course-authoring.content-tags-drawer.tags-dropdown-selector.tag-action-instructions.aria.label',
    defaultMessage: '{tagState} Tag: {tag}. Use the arrow keys to move among the tags in this taxonomy. Press space to select a tag.',
  },
  taxonomyTagActionsAriaLabel: {
    id: 'course-authoring.content-tags-drawer.tags-dropdown-selector.tag-actions.aria.label',
    defaultMessage: '{tagState} Tag: {tag}',
  },
  taxonomyTagsAriaLabel: {
    id: 'course-authoring.content-tags-drawer.content-tags-collapsible.selectable-box.selection.aria.label',
    defaultMessage: 'taxonomy tags selection',
  },
  manageTagsButton: {
    id: 'course-authoring.content-tags-drawer.button.manage',
    defaultMessage: 'Manage Tags',
    description: 'Label in the button that opens the drawer to edit content tags',
  },
  tagsSidebarTitle: {
    id: 'course-authoring.course-unit.sidebar.tags.title',
    defaultMessage: 'Unit Tags',
    description: 'Title of the tags sidebar',
  },
  collapsibleAddTagsPlaceholderText: {
    id: 'course-authoring.content-tags-drawer.content-tags-collapsible.custom-menu.placeholder-text',
    defaultMessage: 'Add a tag',
  },
  collapsibleAddStagedTagsButtonText: {
    id: 'course-authoring.content-tags-drawer.content-tags-collapsible.custom-menu.save-staged-tags',
    defaultMessage: 'Add tags',
  },
  collapsibleCancelStagedTagsButtonText: {
    id: 'course-authoring.content-tags-drawer.content-tags-collapsible.custom-menu.cancel-staged-tags',
    defaultMessage: 'Cancel',
  },
  collapsibleInlineAddStagedTagsButtonText: {
    id: 'course-authoring.content-tags-drawer.content-tags-collapsible.custom-menu.inline-save-staged-tags',
    defaultMessage: 'Add',
  },
});

export default messages;
