import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
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