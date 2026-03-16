import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.pages-resources.xpert-unit-summary.heading',
    defaultMessage: 'Configure Xpert unit summaries',
  },
  enableXpertUnitSummaryLabel: {
    id: 'course-authoring.pages-resources.xpert-unit-summary.enable-xpert-unit-summary.label',
    defaultMessage: 'Xpert unit summaries',
  },
  enableXpertUnitSummaryHelp: {
    id: 'course-authoring.pages-resources.xpert-unit-summary.enable-xpert-unit-summary.help',
    defaultMessage: 'Reinforce learning concepts by sharing text-based course content with OpenAI (via API) to display unit summaries on-demand for learners. Learners can leave feedback about the quality of the AI-generated summaries for use by edX to improve the performance of the tool.',
  },
  enableXpertUnitSummaryHelpPrivacyLink: {
    id: 'course-authoring.pages-resources.xpert-unit-summary.enable-xpert-unit-summary.help.privacylink',
    defaultMessage: 'Learn more about OpenAI API data privacy.',
  },
  enableXpertUnitSummaryLink: {
    id: 'course-authoring.pages-resources.xpert-unit-summary.enable-xpert-unit-summary.link',
    defaultMessage: 'Learn more about how OpenAI handles data',
  },
  allUnitsEnabledByDefault: {
    id: 'course-authoring.pages-resources.xpert-unit-summary.all-units-enabled-by-default',
    defaultMessage: 'All units enabled by default',
  },
  noUnitsEnabledByDefault: {
    id: 'course-authoring.pages-resources.xpert-unit-summary.no-units-enabled-by-default',
    defaultMessage: 'No units enabled by default',
  },
});

export default messages;
