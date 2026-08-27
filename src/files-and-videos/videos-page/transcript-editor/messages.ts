import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loadingLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.loading',
    defaultMessage: 'Loading transcript...',
    description: 'Loading state for transcript editor',
  },
  saveButtonLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.save',
    defaultMessage: 'Save',
    description: 'Save button label for transcript editor',
  },
  cancelButtonLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button label for transcript editor',
  },
  saveFailedLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.saveFailed',
    defaultMessage: 'Unable to save transcript, please try again.',
    description: 'Error shown when transcript save fails',
  },
  saveInProgressLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.saving',
    defaultMessage: 'Saving...',
    description: 'Label shown while transcript save is in progress',
  },
  savedLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.saved',
    defaultMessage: 'Saved',
    description: 'Label shown when transcript save is successful',
  },
  insertCueLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.insertCue',
    defaultMessage: 'Insert cue here',
    description: 'Label for inserting a new cue between transcript cues',
  },
  deleteCueLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.deleteCue',
    defaultMessage: 'Delete cue',
    description: 'Accessible label for deleting a transcript cue',
  },
  seekCueLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.seekCue',
    defaultMessage: 'Seek to cue time',
    description: 'Accessible label for seek button in cue row',
  },
  invalidTimestampLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.invalidTimestamp',
    defaultMessage: 'Please use valid cue times in HH:MM:SS,mmm format.',
    description: 'Error shown when one or more cue timestamps are invalid',
  },
  unsavedModalTitle: {
    id: 'course-authoring.video-uploads.transcriptEditor.unsavedModalTitle',
    defaultMessage: 'Unsaved changes',
    description: 'Title for unsaved changes warning modal',
  },
  unsavedModalDescription: {
    id: 'course-authoring.video-uploads.transcriptEditor.unsavedModalDescription',
    defaultMessage: 'Are you sure you want to leave the editor? All unsaved changes will be lost.',
    description: 'Description for unsaved changes warning modal',
  },
  keepEditingButtonLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.keepEditing',
    defaultMessage: 'Keep editing',
    description: 'Button label to keep editing transcript changes',
  },
  closeEditorButtonLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.closeEditor',
    defaultMessage: 'Leave editor',
    description: 'Button label to close transcript editor and discard changes',
  },
  invalidCueTextLabel: {
    id: 'course-authoring.video-uploads.transcriptEditor.invalidCueText',
    defaultMessage: 'Cue text cannot be empty.',
    description: 'Error shown when one or more cue texts are empty',
  },
});

export default messages;
