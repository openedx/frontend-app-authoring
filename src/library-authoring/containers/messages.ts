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
  organizeTabTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.organize-tab.title',
    defaultMessage: 'Organize',
    description: 'Title for organize tab',
  },
  organizeTabTagsTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.organize-tab.tags.title',
    defaultMessage: 'Tags ({count})',
    description: 'Title for tags section in organize tab',
  },
  organizeTabCollectionsTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.organize-tab.collections.title',
    defaultMessage: 'Collections ({count})',
    description: 'Title for collections section in organize tab',
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
  unitVisibilityTitle: {
    id: 'course-authoring.library-authoring.unit.settings.visibility.title',
    defaultMessage: 'Unit Visibility',
    description: 'Title of the Unit Visibility section on Unit Settings',
  },
  unitDiscussionTitle: {
    id: 'course-authoring.library-authoring.unit.settings.discussion.title',
    defaultMessage: 'Discussion',
    description: 'Title of the Discussion section on Unit Settings',
  },
  unitVisibilityStudentLabel: {
    id: 'course-authoring.library-authoring.unit.settings.visibility.student',
    defaultMessage: 'Student Visible',
    description: 'Label of the button for set the unit as student visible on unit settins.',
  },
  unitVisibilityStaffLabel: {
    id: 'course-authoring.library-authoring.unit.settings.visibility.staff',
    defaultMessage: 'Staff Only',
    description: 'Label of the button for set the unit as staff only visible on unit settins.',
  },
  unitEnableDiscussionLabel: {
    id: 'course-authoring.library-authoring.unit.settings.discussion.enable.label',
    defaultMessage: 'Enable discussion',
    description: 'Label of the check to enable discussion on units settings.',
  },
  unitEnableDiscussionDescription: {
    id: 'course-authoring.library-authoring.unit.settings.discussion.enable.description',
    defaultMessage: 'Topics for unpublished units will not be created',
    description: 'Description of the check to enable discussion on units settings.',
  },
});

export default messages;
