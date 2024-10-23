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
  advancedDetailsAssetsDeleteFileTitle: {
    id: 'course-authoring.library-authoring.component.advanced.assets.delete-file-title',
    defaultMessage: 'Delete File',
    description: 'Title for confirmation dialog when deleting a file',
  },
  advancedDetailsAssetsDeleteButton: {
    id: 'course-authoring.library-authoring.component.advanced.assets.delete-btn',
    defaultMessage: 'Delete this file',
    description: 'screen reader description of the delete button for each static asset file',
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
    defaultMessage: 'Collections ({count})',
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
  detailsTabUsagePlaceholder: {
    id: 'course-authoring.library-authoring.component.details-tab.usage-placeholder',
    defaultMessage: 'This will show the courses that use this component. Feature coming soon.',
    description: 'Explanation/placeholder for the future "Component Usage" feature',
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
  manageCollectionsText: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.text',
    defaultMessage: 'Manage Collections',
    description: 'Header and button text for collection section in manage tab',
  },
  manageCollectionsAddBtnText: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.btn-text',
    defaultMessage: 'Add to Collection',
    description: 'Button text for collection section in manage tab',
  },
  manageCollectionsSearchPlaceholder: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.search-placeholder',
    defaultMessage: 'Search',
    description: 'Placeholder text for collection search in manage tab',
  },
  manageCollectionsSelectionLabel: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.selection-aria-label',
    defaultMessage: 'Collection selection',
    description: 'Aria label text for collection selection box',
  },
  manageCollectionsToComponentSuccess: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.add-success',
    defaultMessage: 'Component collections updated',
    description: 'Message to display on updating component collections',
  },
  manageCollectionsToComponentFailed: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.add-failed',
    defaultMessage: 'Failed to update Component collections',
    description: 'Message to display on failure of updating component collections',
  },
  manageCollectionsToComponentConfirmBtn: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.add-confirm-btn',
    defaultMessage: 'Confirm',
    description: 'Button text to confirm collections for a component',
  },
  manageCollectionsToComponentCancelBtn: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.add-cancel-btn',
    defaultMessage: 'Cancel',
    description: 'Button text to cancel collections selection for a component',
  },
  componentNotOrganizedIntoCollection: {
    id: 'course-authoring.library-authoring.component.manage-tab.collections.no-collections',
    defaultMessage: 'This component is not organized into any collection.',
    description: 'Message to display in manage collections section when component is not part of any collection.',
  },
  componentPickerSingleSelect: {
    id: 'course-authoring.library-authoring.component-picker.single-select',
    defaultMessage: 'Add to Course', // TODO: Change this message to a generic one?
    description: 'Button to add component to course',
  },
  componentPickerMultipleSelect: {
    id: 'course-authoring.library-authoring.component-picker.multiple-select',
    defaultMessage: 'Select',
    description: 'Button to select component',
  },
  publishSuccessMsg: {
    id: 'course-authoring.component-authoring.component.publish.success',
    defaultMessage: 'Component published successfully.',
    description: 'Message when the component is published successfully.',
  },
  publishErrorMsg: {
    id: 'course-authoring.component-authoring.component.publish.error',
    defaultMessage: 'There was an error publishing the component.',
    description: 'Message when there is an error when publishing the component.',
  },
});

export default messages;
