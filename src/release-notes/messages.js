import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  releaseNotesBannerText: {
    id: 'release-notes.page.banner.text',
    defaultMessage: 'Introducing edX Release Notes! See what\'s new and what\'s coming.',
  },
  releaseNotesBannerLinkText: {
    id: 'release-notes.page.banner.link.text',
    defaultMessage: 'Explore release notes',
  },
  releaseNotesBannerDismissAltText: {
    id: 'release-notes.page.banner.dismiss.text',
    defaultMessage: 'Close release notes',
  },
  newPostButton: {
    id: 'course-authoring.release-notes.actions.new-post',
    defaultMessage: 'New post',
    description: 'Button label for header button to add a new post',
  },
  headingTitle: {
    id: 'release-notes.page.heading.title',
    defaultMessage: 'Release notes for edX',
  },
  formTitle: {
    id: 'release-notes.form.title',
    defaultMessage: 'Release note',
  },
  titleLabel: {
    id: 'release-notes.form.title.label',
    defaultMessage: 'Title',
  },
  publishedAtLabel: {
    id: 'release-notes.form.published_at.label',
    defaultMessage: 'Published at',
  },
  publishDateLabel: {
    id: 'release-notes.form.publish_date.label',
    defaultMessage: 'Publish date',
  },
  publishTimeLabel: {
    id: 'release-notes.form.publish_time.label',
    defaultMessage: 'Publish time',
  },
  saveButton: {
    id: 'release-notes.form.save',
    defaultMessage: 'Save',
  },
  savingButton: {
    id: 'release-notes.form.saving',
    defaultMessage: 'Saving',
  },
  savedButton: {
    id: 'release-notes.form.saved',
    defaultMessage: 'Saved',
  },
  cancelButton: {
    id: 'release-notes.form.cancel',
    defaultMessage: 'Cancel',
  },
  noReleaseNotes: {
    id: 'release-notes.no.items',
    defaultMessage: 'No release notes yet',
  },
  editButton: {
    id: 'course-authoring.release-notes.button.edit',
    defaultMessage: 'Edit post',
  },
  deleteButton: {
    id: 'course-authoring.release-notes.button.delete',
    defaultMessage: 'Delete post',
  },
  scheduledTooltip: {
    id: 'release-notes.scheduled.tooltip',
    defaultMessage: 'Scheduled to publish on',
  },
  scheduledLabel: {
    id: 'release-notes.scheduled.label',
    defaultMessage: 'Scheduled',
  },
  errorLoadingPage: {
    id: 'release-notes.error.loading',
    defaultMessage: 'Something went wrong while loading this page. Please refresh and try again.',
  },
  errorSavingPost: {
    id: 'release-notes.error.saving',
    defaultMessage: 'Something went wrong while saving your post. Please try again.',
  },
  errorDeletingPost: {
    id: 'release-notes.error.deleting',
    defaultMessage: 'Something went wrong while deleting this post. Please try again.',
  },
  errorPublishDateRequired: {
    id: 'release-notes.form.error.publish_date.required',
    defaultMessage: 'Enter a publish date',
  },
  errorPublishTimeRequired: {
    id: 'release-notes.form.error.publish_time.required',
    defaultMessage: 'Enter a publish time',
  },
  errorTitleRequired: {
    id: 'release-notes.form.error.title.required',
    defaultMessage: 'Enter a title',
  },
  errorDescriptionRequired: {
    id: 'release-notes.form.error.description.required',
    defaultMessage: 'Enter post content',
  },
  sendEmailCheckboxLabel: {
    id: 'release-notes.form.send-email.label',
    defaultMessage: 'Send email notification to all course authors',
  },
  sendEmailCheckboxHelp: {
    id: 'release-notes.form.send-email.help',
    defaultMessage: 'When checked, an email will be sent to all course authors on the platform notifying them of this release note.',
  },
});

export default messages;
