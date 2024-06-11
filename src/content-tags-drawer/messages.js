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
  noTagsInTaxonomyMessage: {
    id: 'course-authoring.content-tags-drawer.tags-dropdown-selector.no-tags-in-taxonomy',
    defaultMessage: 'No tags in this taxonomy yet',
    description: 'Message when the user uses the tags dropdown selector of an empty taxonomy',
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
    defaultMessage: 'Manage tags',
    description: 'Label in the button that opens the drawer to edit content tags',
  },
  tagsSidebarTitle: {
    id: 'course-authoring.course-unit.sidebar.tags.title',
    defaultMessage: 'Unit tags',
    description: 'Title of the tags sidebar',
  },
  collapsibleAddTagsPlaceholderText: {
    id: 'course-authoring.content-tags-drawer.content-tags-collapsible.custom-menu.placeholder-text',
    defaultMessage: 'Add a tag',
  },
  collapsibleNoTagsAddedText: {
    id: 'course-authoring.content-tags-drawer.content-tags-collapsible.custom-menu.no-tags-added-text',
    defaultMessage: 'No tags added yet.',
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
  tagsDrawerCancelButtonText: {
    id: 'course-authoring.content-tags-drawer.cancel',
    defaultMessage: 'Cancel',
    description: 'Button to cancel edit tags.',
  },
  tagsDrawerSaveButtonText: {
    id: 'course-authoring.content-tags-drawer.save',
    defaultMessage: 'Save',
    description: 'Button to save edited tags.',
  },
  tagsDrawerCloseButtonText: {
    id: 'course-authoring.content-tags-drawer.close',
    defaultMessage: 'Close',
    description: 'Button to close manage tags drawer.',
  },
  tagsDrawerEditTagsButtonText: {
    id: 'course-authoring.content-tags-drawer.edit-tags',
    defaultMessage: 'Edit tags',
    description: 'Button to edit tags in manage tags drawer.',
  },
  tagsSaveToastTextTypeAdded: {
    id: 'course-authoring.content-tags-drawer.toast.added',
    defaultMessage: '{tagsAdded} tags added.',
    description: 'Text of toast after save when the user added tags.',
  },
  tagsSaveToastTextTypeRemoved: {
    id: 'course-authoring.content-tags-drawer.toast.removed',
    defaultMessage: '{tagsRemoved} tags removed.',
    description: 'Text of toast after save when the user removed tags.',
  },
  tagsDeleteAltText: {
    id: 'course-authoring.content-tags-drawer.tag.delete',
    defaultMessage: 'Delete',
    description: 'Alt label for Delete tag button.',
  },
  otherTagsHeader: {
    id: 'course-authoring.content-tags-drawer.other-tags.header',
    defaultMessage: 'Other tags',
    description: 'Header of "Other tags" subsection in tags drawer',
  },
  otherTagsDescription: {
    id: 'course-authoring.content-tags-drawer.other-tags.description',
    defaultMessage: 'These tags are already applied, but you can\'t add new ones as you don\'t have access to their taxonomies.',
    description: 'Description of "Other tags" subsection in tags drawer',
  },
  emptyDrawerContent: {
    id: 'course-authoring.content-tags-drawer.empty',
    defaultMessage: 'To use tags, please {link} or contact your administrator.',
    description: 'Message when there are no taxonomies.',
  },
  emptyDrawerContentLink: {
    id: 'course-authoring.content-tags-drawer.empty-link',
    defaultMessage: 'enable a taxonomy',
    description: 'Message of the link used in empty drawer message.',
  },
});

export default messages;
