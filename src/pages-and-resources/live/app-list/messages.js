import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'authoring.live.heading',
    defaultMessage: 'Select a video conferencing tool for this course',
  },
  noApps: {
    id: 'authoring.live.noApps',
    defaultMessage: 'There are no video conferencing providers available for your course.',
    description: 'A message shown when there are no video conferencing providers available to be displayed.',
  },
  nextButton: {
    id: 'authoring.live.nextButton',
    defaultMessage: 'Next',
    description: 'Button allowing the user to advance to the second step of live configuration.',
  },
  selectApp: {
    id: 'authoring.live.selectApp',
    defaultMessage: 'Select {appName}',
    description: 'A label for the checkbox that allows a user to select the discussions app they want to configure.',
  },

  // Zoom
  'appName-zoom': {
    id: 'authoring.live.appList.appName-zoom',
    defaultMessage: 'Zoom',
    description: 'The name of the zoom app.',
  },
  'appDescription-zoom': {
    id: 'authoring.live.appList.appDescription-zoom',
    defaultMessage: 'Schedule meetings with Zoom to conduct live course sessions with learners',
    description: 'A description of the zoom app.',
  },
});

export default messages;
