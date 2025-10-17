import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'authoring.course-unit.preview-changes.modal-title',
    defaultMessage: 'Preview changes: {blockIcon} {blockTitle}',
    description: 'Preview changes modal title text',
  },
  defaultContainerTitle: {
    id: 'authoring.course-unit.preview-changes.modal-default-unit-title',
    defaultMessage: 'Preview changes: {itemIcon} Container',
    description: 'Preview changes modal default title text for containers',
  },
  defaultComponentTitle: {
    id: 'authoring.course-unit.preview-changes.modal-default-component-title',
    defaultMessage: 'Preview changes: {itemIcon} Component',
    description: 'Preview changes modal default title text for components',
  },
  acceptChangesBtn: {
    id: 'authoring.course-unit.preview-changes.accept-changes-btn',
    defaultMessage: 'Accept changes',
    description: 'Preview changes modal accept button text.',
  },
  acceptChangesFailure: {
    id: 'authoring.course-unit.preview-changes.accept-changes-failure',
    defaultMessage: 'Failed to update component',
    description: 'Toast message to display when accepting changes call fails',
  },
  ignoreChangesBtn: {
    id: 'authoring.course-unit.preview-changes.accept-ignore-btn',
    defaultMessage: 'Ignore changes',
    description: 'Preview changes modal ignore button text.',
  },
  ignoreChangesFailure: {
    id: 'authoring.course-unit.preview-changes.ignore-changes-failure',
    defaultMessage: 'Failed to ignore changes',
    description: 'Toast message to display when ignore changes call fails',
  },
  confirmationTitle: {
    id: 'authoring.course-unit.preview-changes.confirmation-dialog-title',
    defaultMessage: 'Ignore these changes?',
    description: 'Preview changes confirmation dialog title when user clicks on ignore changes.',
  },
  confirmationDescription: {
    id: 'authoring.course-unit.preview-changes.confirmation-dialog-description',
    defaultMessage: 'Would you like to permanently ignore this updated version? If so, you won\'t be able to update this until a newer version is published (in the library).',
    description: 'Preview changes confirmation dialog description text when user clicks on ignore changes.',
  },
  confirmationConfirmBtn: {
    id: 'authoring.course-unit.preview-changes.confirmation-dialog-confirm-btn',
    defaultMessage: 'Ignore',
    description: 'Preview changes confirmation dialog confirm button text when user clicks on ignore changes.',
  },
  localEditsAlert: {
    id: 'course-authoring.review-tab.preview.loal-edits-alert',
    defaultMessage: 'This library content has local edits.',
    description: 'Alert message stating that the content has local edits',
  },
  updateToPublishedLibraryContentButton: {
    id: 'course-authoring.review-tab.preview.update-to-published.button.text',
    defaultMessage: 'Update to published library content',
    description: 'Label of the button to update a content to the published library content',
  },
  updateToPublishedLibraryContentTitle: {
    id: 'course-authoring.review-tab.preview.update-to-published.modal.title',
    defaultMessage: 'Update to published library content?',
    description: 'Title of the modal to update a content to the published library content',
  },
  updateToPublishedLibraryContentBody: {
    id: 'course-authoring.review-tab.preview.update-to-published.modal.body',
    defaultMessage: 'Updating this block will discard local changes. Any edits made within this course will be discarded, and cannot be recovered',
    description: 'Body of the modal to update a content to the published library content',
  },
  updateToPublishedLibraryContentConfirm: {
    id: 'course-authoring.review-tab.preview.update-to-published.modal.confirm',
    defaultMessage: 'Discard local edits and update',
    description: 'Label of the button in the modal to update a content to the published library content',
  },
  keepCourseContentButton: {
    id: 'course-authoring.review-tab.preview.keep-course-content.button.text',
    defaultMessage: 'Keep course content',
    description: 'Label of the button to keep the content of a course component',
  },
  keepCourseContentTitle: {
    id: 'course-authoring.review-tab.preview.keep-course-content.modal.title',
    defaultMessage: 'Keep course content?',
    description: 'Title of the modal to keep the content of a course component',
  },
  keepCourseContentBody: {
    id: 'course-authoring.review-tab.preview.keep-course-content.modal.body',
    defaultMessage: 'This will keep the locally edited course content. If the component is published again in its library, you can choose to update to published library content',
    description: 'Body of the modal to keep the content of a course component',
  },
});

export default messages;
