import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  detailsTitle: {
    id: 'course-authoring.schedule-section.details.title',
    defaultMessage: 'Course details',
  },
  detailsDescription: {
    id: 'course-authoring.schedule-section.details.description',
    defaultMessage: 'Provide useful information about your course',
  },
  dropdownLabel: {
    id: 'course-authoring.schedule-section.details.dropdown.label',
    defaultMessage: 'Course language',
  },
  dropdownHelpText: {
    id: 'course-authoring.schedule-section.details.dropdown.help-text',
    defaultMessage: 'Identify the course language here. This is used to assist users find courses that are taught in a specific language. It is also used to localize the \'From:\' field in bulk emails.',
  },
  dropdownEmpty: {
    id: 'course-authoring.schedule-section.details.dropdown.empty',
    defaultMessage: 'Select language',
  },
});

export default messages;
