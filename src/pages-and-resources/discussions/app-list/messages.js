import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'authoring.discussions.heading',
    defaultMessage: 'Select a discussion tool for this course',
  },
  supportedFeatures: {
    id: 'authoring.discussions.supportedFeatures',
    defaultMessage: 'Supported Features',
  },
  'supportedFeatureList-mobile-show': {
    id: 'authoring.discussions.supportedFeatureList-mobile-show',
    defaultMessage: 'Show supported features',
    description: 'This is used in mobile view as supported feature list heading when close',
  },
  'supportedFeatureList-mobile-hide': {
    id: 'authoring.discussions.supportedFeatureList-mobile-hide',
    defaultMessage: 'Hide supported features',
    description: 'This is used in mobile view as supported feature list heading when opened',
  },
  noApps: {
    id: 'authoring.discussions.noApps',
    defaultMessage: 'There are no discussions providers available for your course.',
    description: 'A message shown when there are no discussions providers available to be displayed.',
  },
  nextButton: {
    id: 'authoring.discussions.nextButton',
    defaultMessage: 'Next',
    description: 'Button allowing the user to advance to the second step of discussion configuration.',
  },
  appFullSupport: {
    id: 'authoring.discussions.appFullSupport',
    defaultMessage: 'Full support',
    description: 'A label indicating that an app supports the full set of possible features for a discussions app.',
  },
  appPartialSupport: {
    id: 'authoring.discussions.appPartialSupport',
    defaultMessage: 'Partial support',
    description: 'A label indicating that an app only supports a subset of the possible features of a discussions app.',
  },
  selectApp: {
    id: 'authoring.discussions.selectApp',
    defaultMessage: 'Select {appName}',
    description: 'A label for the checkbox that allows a user to select the discussions app they want to configure.',
  },

  // Legacy
  'appName-legacy': {
    id: 'authoring.discussions.appList.appName-legacy',
    defaultMessage: 'edX Discussions',
    description: 'The name of the Legacy edX Discussions app.',
  },
  'appDescription-legacy': {
    id: 'authoring.discussions.appList.appDescription-legacy',
    defaultMessage: 'Start conversations with other learners, ask questions, and interact with other learners in the course.',
    description: 'A description of the Legacy edX Discussions app.',
  },
  // Piazza
  'appName-piazza': {
    id: 'authoring.discussions.appList.appName-piazza',
    defaultMessage: 'Piazza',
    description: 'The name of the Piazza app.',
  },
  'appDescription-piazza': {
    id: 'authoring.discussions.appList.appDescription-piazza',
    defaultMessage: 'Piazza is designed to connect students, TAs, and professors so every student can get the help they need when they need it.',
    description: 'A description of the Piazza app.',
  },

  // edX Next
  'appName-edx-next': {
    id: 'authoring.discussions.appList.appName-edx-next',
    defaultMessage: 'edX Next',
    description: 'The name of the edX Next app.',
  },
  'appDescription-edx-next': {
    id: 'authoring.discussions.appList.appDescription-edx-next',
    // @todo update default message for edx-next
    defaultMessage: 'edX Next',
    description: 'A description of the edx next app.',
  },

  // edX Next
  'appName-yellowdig': {
    id: 'authoring.discussions.appList.appName-yellowdig',
    defaultMessage: 'Yellowdig',
    description: 'The name of the yellowdig app.',
  },
  'appDescription-yellowdig': {
    id: 'authoring.discussions.appList.appDescription-yellowdig',
    defaultMessage: 'Yellowdig offers educators a gameful learning digital solution to improve student engagement by building learning communities for any course modality.',
    description: 'A description of the Yellowdig app.',
  },
  // edX inscribe
  'appName-inscribe': {
    id: 'authoring.discussions.appList.appName-inscribe',
    defaultMessage: 'Inscribe',
    description: 'The name of the inscribe app.',
  },
  'appDescription-inscribe': {
    id: 'authoring.discussions.appList.appDescription-inscribe',
    defaultMessage: 'InScribe · InScribe leverages the power of community + artificial intelligence to connect individuals to the answers, resources, and people they need to succeed.',
    description: 'A description of the inscibe app.',
  },
  // discourse
  'appName-discourse': {
    id: 'authoring.discussions.appList.appName-discourse',
    defaultMessage: 'Discourse',
    description: 'The name of the discourse app.',
  },
  'appDescription-discourse': {
    id: 'authoring.discussions.appList.appDescription-discourse',
    defaultMessage: 'Discourse is modern forum software for your community. Use it as a mailing list, discussion forum, long-form chat room, and more!',
    description: 'A description of the discourse app.',
  },

  // Ed Discuss
  'appName-ed-discuss': {
    id: 'authoring.discussions.appList.appName-ed-discuss',
    defaultMessage: 'Ed Discuss',
    description: 'The name of the Ed Discuss app.',
  },
  'appDescription-ed-discuss': {
    id: 'authoring.discussions.appList.appDescription-ed-discus',
    defaultMessage: 'Ed Discussion helps scale class communication in a beautiful and intuitive interface. Questions reach and benefit the whole class. Less emails, more time saved.',
    description: 'A description of the Ed discus app.',
  },
  // Features
  'featureName-discussion-page': {
    id: 'authoring.discussions.featureName-discussion-page',
    defaultMessage: 'Discussion Page',
    description: 'The name of a discussions feature.',
  },
  'featureName-embedded-course-sections': {
    id: 'authoring.discussions.featureName-embedded-course-sections',
    defaultMessage: 'Embedded Course Sections',
    description: 'The name of a discussions feature.',
  },
  'featureName-lti': {
    id: 'authoring.discussions.featureName-lti',
    defaultMessage: 'LTI Integration',
    description: 'The name of a discussions feature.',
  },
  'featureName-advanced_in_context_discussion': {
    id: 'authoring.discussions.featureName-advanced_in_context_discussion',
    defaultMessage: 'Advanced In Context Discussion',
    description: 'The name of a discussions feature.',
  },
  'featureName-anonymous_posting': {
    id: 'authoring.discussions.featureName-anonymous_posting',
    defaultMessage: 'Anonymous Posting',
    description: 'The name of a discussions feature.',
  },
  'featureName-automatic_learner_enrollment': {
    id: 'authoring.discussions.featureName-automatic_learner_enrollment',
    defaultMessage: 'Automatic Learner Enrollment',
    description: 'The name of a discussions feature.',
  },
  'featureName-blackout_discussion_dates': {
    id: 'authoring.discussions.featureName-blackout_discussion_dates',
    defaultMessage: 'Blackout Discussion Dates',
    description: 'The name of a discussions feature.',
  },
  'featureName-community_ta_support': {
    id: 'authoring.discussions.featureName-community_ta_support',
    defaultMessage: 'Community TA Support',
    description: 'The name of a discussions feature.',
  },
  'featureName-course_cohort_support': {
    id: 'authoring.discussions.featureName-course_cohort_support',
    defaultMessage: 'Course Cohort Support',
    description: 'The name of a discussions feature.',
  },
  'featureName-direct_messages_from_instructors': {
    id: 'authoring.discussions.featureName-direct_messages_from_instructors',
    defaultMessage: 'Direct Messages from Instructors',
    description: 'The name of a discussions feature.',
  },
  'featureName-discussion_content_prompts': {
    id: 'authoring.discussions.featureName-discussion_content_prompts',
    defaultMessage: 'Discussion Content Prompts',
    description: 'The name of a discussions feature.',
  },
  'featureName-email_notifications': {
    id: 'authoring.discussions.featureName-email_notifications',
    defaultMessage: 'Email Notifications',
    description: 'The name of a discussions feature.',
  },
  'featureName-graded_discussions': {
    id: 'authoring.discussions.featureName-graded_discussions',
    defaultMessage: 'Graded Discussions',
    description: 'The name of a discussions feature.',
  },
  'featureName-in_platform_notifications': {
    id: 'authoring.discussions.featureName-in_platform_notifications',
    defaultMessage: 'In Platform Notifications',
    description: 'The name of a discussions feature.',
  },
  'featureName-internationalization_support': {
    id: 'authoring.discussions.featureName-internationalization_support',
    defaultMessage: 'Internationalization Support',
    description: 'The name of a discussions feature.',
  },
  'featureName-lti_advanced_sharing_mode': {
    id: 'authoring.discussions.featureName-lti_advanced_sharing_mode',
    defaultMessage: 'LTI Advanced Sharing Mode',
    description: 'The name of a discussions feature.',
  },
  'featureName-lti_basic_configuration': {
    id: 'authoring.discussions.featureName-lti_basic_configuration',
    defaultMessage: 'LTI Basic Configuration',
    description: 'The name of a discussions feature.',
  },
  'featureName-primary_discussion_app_experience': {
    id: 'authoring.discussions.featureName-primary_discussion_app_experience',
    defaultMessage: 'Primary Discussion App Experience',
    description: 'The name of a discussions feature.',
  },
  'featureName-question_discussion_support': {
    id: 'authoring.discussions.featureName-question_&_discussion_support',
    defaultMessage: 'Question & Discussion Support',
    description: 'The name of a discussions feature.',
  },
  'featureName-report/flag_content_to_moderators': {
    id: 'authoring.discussions.featureName-report/flag_content_to_moderators',
    defaultMessage: 'Report / Flag Content to Moderators',
    description: 'The name of a discussions feature.',
  },
  'featureName-research_data_events': {
    id: 'authoring.discussions.featureName-research_data_events',
    defaultMessage: 'Research Data Events',
    description: 'The name of a discussions feature.',
  },
  'featureName-simplified_in_context_discussion': {
    id: 'authoring.discussions.featureName-simplified_in_context_discussion',
    defaultMessage: 'Simplified In Context Discussion',
    description: 'The name of a discussions feature.',
  },
  'featureName-user_mentions': {
    id: 'authoring.discussions.featureName-user_mentions',
    defaultMessage: 'User Mentions',
    description: 'The name of a discussions feature.',
  },
  'featureName-wcag_2.1': {
    id: 'authoring.discussions.featureName-wcag_2.1',
    defaultMessage: 'WCAG 2.1 Support',
    description: 'The name of a discussions feature.',
  },
  'featureName-wcag_2.0_support': {
    id: 'authoring.discussions.wcag_2.0_support',
    defaultMessage: 'WCAG 2.0 Support',
    description: 'The name of a discussions feature.',
  },
});

export default messages;
