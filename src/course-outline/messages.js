import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.course-outline.headingTitle',
    defaultMessage: 'Course outline',
  },
  headingSubtitle: {
    id: 'course-authoring.course-outline.subTitle',
    defaultMessage: 'Content',
  },
  alertSuccessTitle: {
    id: 'course-authoring.course-outline.reindex.alert.success.title',
    defaultMessage: 'Course index',
  },
  alertSuccessDescription: {
    id: 'course-authoring.course-outline.reindex.alert.success.description',
    defaultMessage: 'Course has been successfully reindexed.',
  },
  alertSuccessAriaLabelledby: {
    id: 'course-authoring.course-outline.reindex.alert.success.aria.labelledby',
    defaultMessage: 'alert-confirmation-title',
  },
  alertSuccessAriaDescribedby: {
    id: 'course-authoring.course-outline.reindex.alert.success.aria.describedby',
    defaultMessage: 'alert-confirmation-description',
  },
  alertErrorTitle: {
    id: 'course-authoring.course-outline.reindex.alert.error.title',
    defaultMessage: 'There were errors reindexing course.',
  },
  newSectionButton: {
    id: 'course-authoring.course-outline.section-list.button.new-section',
    defaultMessage: 'New section',
  },
});

export default messages;
