import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  requirementsTitle: {
    id: 'course-authoring.schedule-section.requirements.title',
    defaultMessage: 'Requirements',
  },
  requirementsDescription: {
    id: 'course-authoring.schedule-section.requirements.description',
    defaultMessage: 'Expectations of the students taking this course',
  },
  timepickerLabel: {
    id: 'course-authoring.schedule-section.requirements.timepicker.label',
    defaultMessage: 'Hours of effort per week',
  },
  timepickerHelpText: {
    id: 'course-authoring.schedule-section.requirements.timepicker.help-text',
    defaultMessage: 'Time spent on all course work',
  },
  dropdownLabel: {
    id: 'course-authoring.schedule-section.requirements.dropdown.label',
    defaultMessage: 'Prerequisite course',
  },
  dropdownHelpText: {
    id: 'course-authoring.schedule-section.requirements.dropdown.help-text',
    defaultMessage: 'Course that students must complete before beginning this course',
  },
  dropdownEmptyText: {
    id: 'course-authoring.schedule-section.requirements.dropdown.empty-text',
    defaultMessage: 'None',
  },
});

export default messages;
