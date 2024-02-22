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
  taxonomyTagsCheckboxAriaLabel: {
    id: 'course-authoring.content-tags-drawer.tags-dropdown-selector.selectable-box.aria.label',
    defaultMessage: '{tag} checkbox',
  },
  taxonomyTagsAriaLabel: {
    id: 'course-authoring.content-tags-drawer.content-tags-collapsible.selectable-box.selection.aria.label',
    defaultMessage: 'taxonomy tags selection',
  },
  manageTagsButton: {
    id: 'course-authoring.content-tags-drawer.button.manage',
    defaultMessage: 'Manage tags',
  },
});

export default messages;
