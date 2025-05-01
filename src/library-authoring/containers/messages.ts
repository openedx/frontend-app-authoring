import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  openUnitButton: {
    id: 'course-authoring.library-authoring.container-sidebar.open-button',
    defaultMessage: 'Open',
    description: 'Button text to open unit',
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
    defaultMessage: 'Publish',
    description: 'Button text to publish the unit/subsection/section',
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
