import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.pages-resources.dates.heading',
    defaultMessage: 'Configure dates',
    description: 'Heading for the Dates settings modal shown in Pages & Resources.',
  },
  enableAppLabel: {
    id: 'course-authoring.pages-resources.dates.enable-app.label',
    defaultMessage: 'Dates',
    description: 'Label for the toggle that enables the Dates experience.',
  },
  enableAppHelp: {
    id: 'course-authoring.pages-resources.dates.enable-app.help',
    defaultMessage: 'Allow learners to access the Dates page to review upcoming assignments and important course milestones.',
    description: 'Helper text explaining what enabling the Dates experience does.',
  },
  learnMore: {
    id: 'course-authoring.pages-resources.dates.learn-more',
    defaultMessage: 'Learn more about dates',
    description: 'Link text that leads to documentation about the Dates experience.',
  },
});

export default messages;
