import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  calendarAltText: {
    id: 'course-authoring.schedule.schedule-section.alt-text',
    defaultMessage: 'Calendar for datepicker input',
  },
  datepickerUTC: {
    id: 'course-authoring.schedule.schedule-section.datepicker.utc',
    defaultMessage: 'UTC',
  },
  timepickerAriaLabel: {
    id: 'course-authoring.schedule.schedule-section.timepicker.aria-label',
    defaultMessage: 'Time input field. Enter a time or use the arrow keys to adjust.',
  },
  timepickerScreenreaderHint: {
    id: 'course-authoring.schedule.schedule-section.timepicker.screenreader-hint',
    defaultMessage: 'Enter time in {timeFormat} or twelve-hour format, for example 6:00 PM.',
  },
});

export default messages;
