import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.course-outline.configure-modal.title',
    defaultMessage: '{title} Settings',
  },
  basicTabTitle: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.title',
    defaultMessage: 'Basic',
  },
  releaseDateAndTime: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.release-date-and-time',
    defaultMessage: 'Release Date and Time',
  },
  releaseDate: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.release-date',
    defaultMessage: 'Release Date:',
  },
  releaseTimeUTC: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.release-time-UTC',
    defaultMessage: 'Release Time in UTC:',
  },
  visibilityTabTitle: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.title',
    defaultMessage: 'Visibility',
  },
  sectionVisibility: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.section-visibility',
    defaultMessage: 'Section Visibility',
  },
  hideFromLearners: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.hide-from-learners',
    defaultMessage: 'Hide from learners',
  },
  visibilityWarning: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.visibility-warning',
    defaultMessage: 'If you make this section visible to learners, learners will be able to see its content after the release date has passed and you have published the unit. Only units that are explicitly hidden from learners will remain hidden after you clear this option for the section.',
  },
  cancelButton: {
    id: 'course-authoring.course-outline.configure-modal.button.cancel',
    defaultMessage: 'Cancel',
  },
  saveButton: {
    id: 'course-authoring.course-outline.configure-modal.button.label',
    defaultMessage: 'Save',
  },
});

export default messages;
