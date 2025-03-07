import moment from 'moment-timezone';
import { defineMessages } from '@edx/frontend-platform/i18n';

const getUserTimezoneDetails = () => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneOffset = moment.tz(userTimezone).format('Z');
  
  return `${userTimezone} GMT${timezoneOffset}`;
};

const messages = defineMessages({
  calendarAltText: {
    id: 'course-authoring.schedule.schedule-section.alt-text',
    defaultMessage: 'Calendar for datepicker input',
  },
  datepickerUTC: {
    id: 'course-authoring.schedule.schedule-section.datepicker.utc',
    defaultMessage: 'UTC',
  },
  datepickerCustom: {
    id: 'this.datepickerCustom',
    defaultMessage: getUserTimezoneDetails(),
  },
});

export default messages;