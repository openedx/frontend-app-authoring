import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  draftChipText: {
    id: 'course-authoring.library-authoring.container-component.draft-chip.text',
    defaultMessage: 'Draft',
    description: 'Chip in children in section and subsection page that is shown when children has unpublished changes',
  },
  publishedChipText: {
    id: 'course-authoring.library-authoring.container-component.published-chip.text',
    defaultMessage: 'Published',
    description: 'Text shown when a unit/section/subsection is published.',
  },
  openButton: {
    id: 'course-authoring.library-authoring.container-sidebar.open-button',
    defaultMessage: 'Open',
    description: 'Button text to open container',
  },
  previewTabTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.preview-tab.title',
    defaultMessage: 'Preview',
    description: 'Title for preview tab',
  },
  manageTabTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.manage-tab.title',
    defaultMessage: 'Manage',
    description: 'Title for manage tab',
  },
  manageTabTagsTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.manage-tab.tags.title',
    defaultMessage: 'Tags ({count})',
    description: 'Title for tags section in manage tab',
  },
  manageTabCollectionsTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.manage-tab.collections.title',
    defaultMessage: 'Collections ({count})',
    description: 'Title for collections section in manage tab',
  },
  publishContainerButton: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-button',
    defaultMessage: 'Publish Changes {publishStatus}',
    description: 'Button text to initiate publish the unit/subsection/section, showing current publish status',
  },
  publishContainerConfirmHeading: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-confirm-heading',
    defaultMessage: 'Confirm Publish',
    description: 'Header text shown while confirming publish of a unit/subsection/section',
  },
  publishContainerConfirm: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-confirm-button',
    defaultMessage: 'Publish',
    description: 'Button text shown to confirm publish of a unit/subsection/section',
  },
  publishContainerCancel: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-cancel',
    defaultMessage: 'Cancel',
    description: 'Button text shown to cancel publish of a unit/subsection/section',
  },
  publishContainerSuccess: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-success',
    defaultMessage: 'All changes published',
    description: 'Popup text after publishing a unit/subsection/section',
  },
  publishContainerFailed: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-failure',
    defaultMessage: 'Failed to publish changes',
    description: 'Popup text seen if publishing a unit/subsection/section fails',
  },
  settingsTabTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.settings-tab.title',
    defaultMessage: 'Settings',
    description: 'Title for settings tab',
  },
  updateContainerSuccessMsg: {
    id: 'course-authoring.library-authoring.update-container-success-msg',
    defaultMessage: 'Container updated successfully.',
    description: 'Message displayed when container is updated successfully',
  },
  updateContainerErrorMsg: {
    id: 'course-authoring.library-authoring.update-container-error-msg',
    defaultMessage: 'Failed to update container.',
    description: 'Message displayed when container update fails',
  },
});

export default messages;
