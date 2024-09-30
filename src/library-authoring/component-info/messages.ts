import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  advancedDetailsTitle: {
    id: 'course-authoring.library-authoring.component.advanced.title',
    defaultMessage: 'Advanced details',
    description: 'Heading for the advanced technical details of a component',
  },
  advancedDetailsAssets: {
    id: 'course-authoring.library-authoring.component.advanced.assets',
    defaultMessage: 'Assets (Files)',
    description: 'Heading for files attached to the component',
  },
  advancedDetailsOLX: {
    id: 'course-authoring.library-authoring.component.advanced.olx',
    defaultMessage: 'OLX Source',
    description: 'Heading for the component\'s OLX source code',
  },
  advancedDetailsOLXEditButton: {
    id: 'course-authoring.library-authoring.component.advanced.olx-edit',
    defaultMessage: 'Edit OLX',
    description: 'Label for button to enable editing the OLX',
  },
  advancedDetailsOLXSaveButton: {
    id: 'course-authoring.library-authoring.component.advanced.olx-save',
    defaultMessage: 'Save',
    description: 'Button to save changes to the OLX',
  },
  advancedDetailsOLXCancelButton: {
    id: 'course-authoring.library-authoring.component.advanced.olx-save',
    defaultMessage: 'Cancel',
    description: 'Button to cancel changes to the OLX',
  },
  advancedDetailsOLXEditWarning: {
    id: 'course-authoring.library-authoring.component.advanced.olx-warning',
    defaultMessage: 'Be careful! This is an advanced feature and errors may break the component.',
    description: 'Warning for users about editing OLX directly.',
  },
  advancedDetailsOLXEditFailed: {
    id: 'course-authoring.library-authoring.component.advanced.olx-failed',
    defaultMessage: 'An error occurred and the OLX could not be saved.',
    description: 'Error message shown when saving the OLX fails.',
  },
  advancedDetailsOLXError: {
    id: 'course-authoring.library-authoring.component.advanced.olx-error',
    defaultMessage: 'Unable to load OLX',
    description: 'Error message if OLX is unavailable',
  },
  advancedDetailsUsageKey: {
    id: 'course-authoring.library-authoring.component.advanced.usage-key',
    defaultMessage: 'ID (Usage key)',
    description: 'Heading for the component\'s ID',
  },
  editNameButtonAlt: {
    id: 'course-authoring.library-authoring.component.edit-name.alt',
    defaultMessage: 'Edit component name',
    description: 'Alt text for edit component name icon button',
  },
  updateComponentSuccessMsg: {
    id: 'course-authoring.library-authoring.component.update.success',
    defaultMessage: 'Component updated successfully.',
    description: 'Message when the component is updated successfully',
  },
  updateComponentErrorMsg: {
    id: 'course-authoring.library-authoring.component.update.error',
    defaultMessage: 'There was an error updating the component.',
    description: 'Message when there is an error when updating the component',
  },
  editComponentButtonTitle: {
    id: 'course-authoring.library-authoring.component.edit.title',
    defaultMessage: 'Edit component',
    description: 'Title for edit component button',
  },
  publishComponentButtonTitle: {
    id: 'course-authoring.library-authoring.component.publish.title',
    defaultMessage: 'Publish component',
    description: 'Title for publish component button',
  },
  previewTabTitle: {
    id: 'course-authoring.library-authoring.component.preview-tab.title',
    defaultMessage: 'Preview',
    description: 'Title for preview tab',
  },
  manageTabTitle: {
    id: 'course-authoring.library-authoring.component.manage-tab.title',
    defaultMessage: 'Manage',
    description: 'Title for manage tab',
  },
  manageTabTagsTitle: {
    id: 'course-authoring.library-authoring.component.manage-tab.tags-title',
    defaultMessage: 'Tags ({count})',
    description: 'Title for the Tags container in the management tab',
  },
  manageTabCollectionsTitle: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections-title',
    defaultMessage: 'Collections',
    description: 'Title for the Collections container in the management tab',
  },
  detailsTabTitle: {
    id: 'course-authoring.library-authoring.component.details-tab.title',
    defaultMessage: 'Details',
    description: 'Title for details tab',
  },
  detailsTabUsageTitle: {
    id: 'course-authoring.library-authoring.component.details-tab.usage-title',
    defaultMessage: 'Component Usage',
    description: 'Title for the Component Usage container in the details tab',
  },
  detailsTabHistoryTitle: {
    id: 'course-authoring.library-authoring.component.details-tab.history-title',
    defaultMessage: 'Component History',
    description: 'Title for the Component History container in the details tab',
  },
  previewExpandButtonTitle: {
    id: 'course-authoring.library-authoring.component.preview.expand.title',
    defaultMessage: 'Expand',
    description: 'Title for expand preview button',
  },
  previewModalTitle: {
    id: 'course-authoring.library-authoring.component.preview.modal.title',
    defaultMessage: 'Component Preview',
    description: 'Title for preview modal',
  },
  addToCollectionSubtitle: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.subtitle',
    defaultMessage: 'Add {displayName} to Collection',
    description: 'Subtitle for collection section in manage tab',
  },
  addToCollectionSearchPlaceholder: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.search-placeholder',
    defaultMessage: 'Search',
    description: 'Placeholder text for collection search in manage tab',
  },
  addToCollectionSelectionLabel: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.selection-aria-label',
    defaultMessage: 'Collection selection',
    description: 'Aria label text for collection selection box',
  },
});

export default messages;
