import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.pages-resources.learning-assistant.heading',
    defaultMessage: 'Configure Learning Assistant',
  },
  enableLearningAssistantLabel: {
    id: 'course-authoring.pages-resources.learning_assistant.enable-learning-assistant.label',
    defaultMessage: 'Learning Assistant',
  },
  enableLearningAssistantHelp: {
    id: 'course-authoring.pages-resources.learning_assistant.enable-learning-assistant.help',
    defaultMessage: `Reinforce learning concepts by sharing text-based course content with OpenAI (via API) to power
      an in-course Learning Assistant. Learners can leave feedback about the quality of the AI-powered experience for 
      use by edX to improve the performance of the tool.`,
  },
  learningAssistantOpenAILink: {
    id: 'course-authoring.pages-resources.learning_assistant.open-ai.link',
    defaultMessage: 'Learn more about how OpenAI handles data',
  },
  learningAssistantOpenAIDataPrivacyLink: {
    id: 'course-authoring.pages-resources.learning_assistant.open-ai.data-privacy.link',
    defaultMessage: 'Learn more about OpenAI API data privacy',
  },
});

export default messages;
