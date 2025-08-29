import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  calendarTitle: {
    id: 'calendarTitle',
    defaultMessage: 'Calendar',
    description: 'Title for the calendar header',
  },
  prev: {
    id: 'prev',
    defaultMessage: 'Prev',
    description: 'Label for previous navigation button',
  },
  next: {
    id: 'next',
    defaultMessage: 'Next',
    description: 'Label for next navigation button',
  },
  today: {
    id: 'today',
    defaultMessage: 'Today',
    description: 'Label for today navigation button',
  },
  month: {
    id: 'month',
    defaultMessage: 'Month',
    description: 'Label for month view',
  },
  week: {
    id: 'week',
    defaultMessage: 'Week',
    description: 'Label for week view',
  },
  day: {
    id: 'day',
    defaultMessage: 'Day',
    description: 'Label for day view',
  },
  list: {
    id: 'list',
    defaultMessage: 'List',
    description: 'Label for list view',
  },
  all: {
    id: 'all',
    defaultMessage: 'All',
    description: 'Label for all events filter',
  },
  searchPlaceholder: {
    id: 'searchPlaceholder',
    defaultMessage: 'Search events...',
    description: 'Placeholder for search input',
  },
  errorEventsLoad: {
    id: 'calendar.error.eventsLoad',
    defaultMessage: 'Failed to load events. Please try again later.',
    description: 'Error message for failed event data loading',
  },
  errorEventNavigation: {
    id: 'calendar.error.eventNavigation',
    defaultMessage: 'Failed to navigate to event date.',
    description: 'Error message for failed event navigation',
  },
  errorNavigation: {
    id: 'calendar.error.navigation',
    defaultMessage: 'Failed to navigate calendar.',
    description: 'Error message for failed calendar navigation',
  },
  errorViewChange: {
    id: 'calendar.error.viewChange',
    defaultMessage: 'Failed to change calendar view.',
    description: 'Error message for failed view change',
  },
  errorClose: {
    id: 'calendar.error.close',
    defaultMessage: 'Close',
    description: 'Label for button to close error message',
  },
});

export default messages;