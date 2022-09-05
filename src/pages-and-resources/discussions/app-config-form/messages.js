import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  configurationChangeConsequence: {
    id: 'authoring.discussions.configurationChangeConsequences',
    defaultMessage:
      'Students will lose access to any active or previous'
      + ' discussion posts for your course.',
    description:
      'Describes that, as a consequence of changing configuration,'
      + ' students will lose access posts on the course.',
  },
  configureApp: {
    id: 'authoring.discussions.configure.app',
    defaultMessage: 'Configure {name}',
  },
  configure: {
    id: 'authoring.discussions.configure',
    defaultMessage: 'Configure discussions',
  },
  ok: {
    id: 'authoring.discussions.ok',
    defaultMessage: 'OK',
    description: 'Button allowing the user to acknowledge the provider change.',
  },
  cancel: {
    id: 'authoring.discussions.cancel',
    defaultMessage: 'Cancel',
    description: 'Button allowing the user to return to discussion provider configurations.',
  },
  confirmConfigurationChange: {
    id: 'authoring.discussions.confirmConfigurationChange',
    defaultMessage: 'Are you sure you want to change the discussion settings?',
    description: 'Asks the user whether he/she really wants to change settings.',
  },
  backButton: {
    id: 'authoring.discussions.backButton',
    defaultMessage: 'Back',
    description: 'Button allowing the user to return to discussion app selection.',
  },
  saveButton: {
    id: 'authoring.discussions.saveButton',
    defaultMessage: 'Save',
    description: 'Button allowing the user to submit their discussion configuration.',
  },
  savingButton: {
    id: 'authoring.discussions.savingButton',
    defaultMessage: 'Saving',
    description: 'Button label when the discussion configuration is being submitted.',
  },
  savedButton: {
    id: 'authoring.discussions.savedButton',
    defaultMessage: 'Saved',
    description: 'Button label when the discussion configuration has been successfully submitted.',
  },

  // App names
  'appName-piazza': {
    id: 'authoring.discussions.appConfigForm.appName-piazza',
    defaultMessage: 'Piazza',
    description: 'The name of the Piazza app.',
  },
  'appName-yellowdig': {
    id: 'authoring.discussions.appConfigForm.appName-yellowdig',
    defaultMessage: 'Yellowdig',
    description: 'The name of the yellowdig app.',
  },
  'appName-inscribe': {
    id: 'authoring.discussions.appConfigForm.appName-inscribe',
    defaultMessage: 'InScribe',
    description: 'The name of the inscribe app.',
  },
  'appName-discourse': {
    id: 'authoring.discussions.appConfigForm.appName-discourse',
    defaultMessage: 'Discourse',
    description: 'The name of the discourse app.',
  },
  'appName-ed-discuss': {
    id: 'authoring.discussions.appConfigForm.appName-ed-discuss',
    defaultMessage: 'Ed Discussion',
    description: 'The name of the Ed Discussion app.',
  },
  'appName-legacy': {
    id: 'authoring.discussions.appConfigForm.appName-legacy',
    defaultMessage: 'edX',
    description: 'The name of the Legacy edX Discussions app.',
  },
  'appName-openedx': {
    id: 'authoring.discussions.appConfigForm.appName-openedx',
    defaultMessage: 'edX',
    description: 'The name of the new edX Discussions app.',
  },
  divisionByGroup: {
    id: 'authoring.discussions.builtIn.divisionByGroup',
    defaultMessage: 'Cohorts',
  },
  divideByCohortsLabel: {
    id: 'authoring.discussions.builtIn.divideByCohorts.label',
    defaultMessage: 'Divide discussions by cohorts',
    description: 'Label for a switch that enables dividing discussions by cohorts.  allowDivisionByUnit, divideCourseWideTopics, divideGeneralTopic, and divideQuestionsForTAs are only used if this setting is true.',
  },
  divideByCohortsHelp: {
    id: 'authoring.discussions.builtIn.divideByCohorts.help',
    defaultMessage: 'Learners will only be able to view and respond to discussions posted by members of their cohort.',
    description: 'Help text for a switch that enables dividing discussions by cohorts.',
  },
  divideCourseTopicsByCohortsLabel: {
    id: 'authoring.discussions.builtIn.divideCourseTopicsByCohorts.label',
    defaultMessage: 'Divide course-wide discussion topics',
    description: 'Label for a switch that enables dividing course wide topics by cohorts.',
  },
  divideCourseTopicsByCohortsHelp: {
    id: 'authoring.discussions.builtIn.divideCourseTopicsByCohorts.help',
    defaultMessage: 'Choose which of your general course-wide discussion topics you would like to divide.',
    description: 'Help text asking the user to pick course-wide topics that should be divided by cohort.',
  },
  divideGeneralTopic: {
    id: 'authoring.discussions.builtIn.divideGeneralTopic.label',
    defaultMessage: 'General',
    description: 'Label for a checkbox allowing a user to divide the General course wide topic by cohorts.',
  },
  divideQuestionsForTAsTopic: {
    id: 'authoring.discussions.builtIn.divideQuestionsForTAsTopic.label',
    defaultMessage: 'Questions for the TAs',
    description: 'Label for a checkbox allowing a user to divide the Questions for the TAs (TA stands for "teaching assistant") course wide topic by cohorts.',
  },

  // In-context discussion fields
  visibilityInContext: {
    id: 'authoring.discussions.builtIn.visibilityInContext',
    defaultMessage: 'Visibility of in-context discussions',
  },
  gradedUnitPagesLabel: {
    id: 'authoring.discussions.builtIn.gradedUnitPages.label',
    defaultMessage: 'Enable discussions on units in graded subsections',
  },
  gradedUnitPagesHelp: {
    id: 'authoring.discussions.builtIn.gradedUnitPages.help',
    defaultMessage: 'Allow learners to engage with discussion on all graded unit pages except timed exams.',
  },
  groupInContextSubsectionLabel: {
    id: 'authoring.discussions.builtIn.groupInContextSubsection.label',
    defaultMessage: 'Group in context discussion at the subsection level',
  },
  groupInContextSubsectionHelp: {
    id: 'authoring.discussions.builtIn.groupInContextSubsection.help',
    defaultMessage: 'Learners will be able to view any post in the sub-section no matter which unit page they are viewing. While this is not recommended, if your course has short learning sequences or low enrollment grouping may increase engagement.',
  },

  // Anonymous posting fields
  anonymousPosting: {
    id: 'authoring.discussions.builtIn.anonymousPosting',
    defaultMessage: 'Anonymous posting',
  },
  allowAnonymousPostsLabel: {
    id: 'authoring.discussions.builtIn.allowAnonymous.label',
    defaultMessage: 'Allow anonymous discussion posts',
  },
  allowAnonymousPostsHelp: {
    id: 'authoring.discussions.builtIn.allowAnonymous.help',
    defaultMessage: 'If enabled, learners can create posts that are anonymous to all users.',
  },
  allowAnonymousPostsPeersLabel: {
    id: 'authoring.discussions.builtIn.allowAnonymousPeers.label',
    defaultMessage: 'Allow anonymous discussion posts to peers',
  },
  allowAnonymousPostsPeersHelp: {
    id: 'authoring.discussions.builtIn.allowAnonymousPeers.help',
    defaultMessage: 'Learners will be able to post anonymously to other peers but all posts will be visible to course staff.',
  },

  // Reported Email Notifications
  reportedContentEmailNotifications: {
    id: 'authoring.discussions.builtIn.reportedContentEmailNotifications',
    defaultMessage: 'Notifications',
  },
  reportedContentEmailNotificationsLabel: {
    id: 'authoring.discussions.builtIn.reportedContentEmailNotifications.label',
    defaultMessage: 'Email notifications for reported content',
  },
  reportedContentEmailNotificationsHelp: {
    id: 'authoring.discussions.builtIn.reportedContentEmailNotifications.help',
    defaultMessage: 'Discussion Admins, Moderators, Community TAs and Group Community TAs (only for their own cohort) will receive an email notification when content is reported.',
  },

  // Discussion Topics
  discussionTopics: {
    id: 'authoring.discussions.discussionTopics',
    defaultMessage: 'Discussion topics',
  },
  discussionTopicsLabel: {
    id: 'authoring.discussions.discussionTopics.label',
    defaultMessage: 'General discussion topics',
    description: 'Label for a discussion topic section allowing a user to add new topic.',
  },
  discussionTopicsHelp: {
    id: 'authoring.discussions.discussionTopics.help',
    defaultMessage: 'Discussions can include general topics not contained to the course structure. All courses have a general topic by default.',
    description: 'Help text for adding new discussion topics that in general discussion topic section.',
  },
  discussionTopicRequired: {
    id: 'authoring.discussions.discussionTopic.required',
    defaultMessage: 'Topic name is a required field',
    description: 'Tells the user that the discussion topic field is required and must have a value.',
  },
  discussionTopicNameAlreadyExist: {
    id: 'authoring.discussions.discussionTopic.alreadyExistError',
    defaultMessage: 'It looks like this name is already in use',
    description: 'Tells the user that the discussion topic name already in use and must have a unique name.',
  },
  addTopicButton: {
    id: 'authoring.discussions.addTopicButton',
    defaultMessage: 'Add topic',
    description: 'Button label when Add a new discussion topic.',
  },
  deleteButton: {
    id: 'authoring.discussions.deleteButton',
    defaultMessage: 'Delete',
    description: 'Button label when delete discussion topic from conformation card.',
  },
  cancelButton: {
    id: 'authoring.discussions.cancelButton',
    defaultMessage: 'Cancel',
    description: 'Button label when cancel discussion topic deletion conformation.',
  },
  discussionTopicDeletionHelp: {
    id: 'authoring.discussions.discussionTopicDeletion.help',
    defaultMessage: 'edX recommends that you do not delete discussion topics once your course is running.',
    description: 'Help text for delete a discussion topic from discussion topic section.',
  },
  discussionTopicDeletionLabel: {
    id: 'authoring.discussions.discussionTopicDeletion.label',
    defaultMessage: 'Delete this topic?',
    description: 'Label for discussion topic delete popup allowing a user to delete a topic.',
  },
  renameGeneralTopic: {
    id: 'authoring.discussions.builtIn.renameGeneralTopic.label',
    defaultMessage: 'Rename general topic',
    description: 'Label for default topic allowing user to rename default general topic',
  },
  generalTopicHelp: {
    id: 'authoring.discussions.generalTopicHelp.help',
    defaultMessage: 'This is the default discussion topic for your course.',
    description: 'Help text for general discussion topic collapsible card.',
  },
  configureAdditionalTopic: {
    id: 'authoring.discussions.builtIn.configureAdditionalTopic.label',
    defaultMessage: 'Configure topic',
    description: 'Label for Additional topic allowing user to configure additional topic name',
  },
  addTopicHelpText: {
    id: 'authoring.discussions.addTopicHelpText',
    defaultMessage: 'Choose a unique name for your topic',
    description: 'Help text for input field in adding a discussion topic',
  },
  // Blackout dates
  blackoutDates: {
    id: 'authoring.discussions.blackoutDates',
    defaultMessage: 'Discussion blackout dates',

  },
  blackoutDatesLabel: {
    id: 'authoring.discussions.builtIn.blackoutDates.label',
    defaultMessage: 'Blackout dates',
  },
  blackoutDatesHelp: {
    id: 'authoring.discussions.builtIn.blackoutDates.help',
    defaultMessage: 'If added, learners will not be able to post in discussions between these dates.',
  },
  addBlackoutDatesButton: {
    id: 'authoring.discussions.addBlackoutDatesButton',
    defaultMessage: 'Add blackout date range',
    description: 'Button label when Add a new blackout date.',
  },
  configureBlackoutDates: {
    id: 'authoring.discussions.builtIn.configureBlackoutDates.label',
    defaultMessage: 'Configure blackout date range',
    description: 'Label for blockout dates allowing user to configure blackout dates',
  },
  blackoutStartDateHelp: {
    id: 'authoring.discussions.blackoutStartDate.help',
    defaultMessage: 'Enter a start date, e.g. 12/10/2023',
  },
  blackoutEndDateHelp: {
    id: 'authoring.discussions.blackoutEndDate.help',
    defaultMessage: 'Enter an end date, e.g. 12/17/2023',
  },
  blackoutStartTimeHelp: {
    id: 'authoring.discussions.blackoutStartTime.help',
    defaultMessage: 'Enter a start time, e.g. 09:00 AM',
  },
  blackoutEndTimeHelp: {
    id: 'authoring.discussions.blackoutEndTime.help',
    defaultMessage: 'Enter an end time, e.g. 05:00 PM',
  },
  activeBlackoutDatesDeletionHelp: {
    id: 'authoring.discussions.activeBlackoutDatesDeletion.help',
    defaultMessage: 'These blackout dates are currently active. If deleted, learners will be able to post in discussions during these dates. Are you sure you want to proceed?',
    description: 'Help text for delete a active blackout dates from blackout dates section.',
  },
  blackoutDatesDeletionHelp: {
    id: 'authoring.discussions.blackoutDatesDeletion.help',
    defaultMessage: 'If deleted, learners will be able to post in discussions during these dates.',
    description: 'Help text for delete a upcoming blackout dates from blackout dates section.',
  },
  completeBlackoutDatesDeletionHelp: {
    id: 'authoring.discussions.completeBlackoutDatesDeletion.help',
    defaultMessage: 'Are you sure you want to delete these blackout dates?',
    description: 'Help text for delete a complete blackout dates from blackout dates section.',
  },
  activeBlackoutDatesDeletionLabel: {
    id: 'authoring.discussions.activeBlackoutDatesDeletion.label',
    defaultMessage: 'Delete active blackout dates?',
    description: 'Label for active blackout dates delete popup allowing a user to delete a blackout date range.',
  },
  blackoutDatesDeletionLabel: {
    id: 'authoring.discussions.blackoutDatesDeletion.label',
    defaultMessage: 'Delete blackout dates?',
    description: 'Label for blackout dates delete popup allowing a user to delete a blackout date range.',
  },
  deleteBlackoutDatesAltText: {
    id: 'authoring.blackoutDates.delete',
    defaultMessage: 'Delete Blackout Dates',
  },
  blackoutDatesStatus: {
    id: 'authoring.blackoutDates.status',
    defaultMessage: '{status}',
  },
  blackoutStartDateRequired: {
    id: 'authoring.blackoutDates.startDate.required',
    defaultMessage: 'Start date is a required field',
    description: 'Tells the user that the blackout dates must have start date and it is required.',
  },
  blackoutEndDateRequired: {
    id: 'authoring.blackoutDates.endDate.required',
    defaultMessage: 'End date is a required field',
    description: 'Tells the user that the blackout dates must have end date and it is required.',
  },
  blackoutStartDateInPast: {
    id: 'authoring.blackoutDates.startDate.inPast',
    defaultMessage: 'Start date cannot be after end date',
    description: 'Tells the user that the blackout start date cannot be in past and cannot be after end date',
  },
  blackoutEndDateInPast: {
    id: 'authoring.blackoutDates.endDate.inPast',
    defaultMessage: 'End date cannot be before start date',
    description: 'Tells the user that the blackout end date cannot be in past and cannot be before start date',
  },
  blackoutStartTimeInPast: {
    id: 'authoring.blackoutDates.startTime.inPast',
    defaultMessage: 'Start time cannot be after end time',
    description: 'Tells the user that the blackout start time cannot be in past and cannot be after end time',
  },
  blackoutEndTimeInPast: {
    id: 'authoring.blackoutDates.endTime.inPast',
    defaultMessage: 'End time cannot be before start time',
    description: 'Tells the user that the blackout end time cannot be in past and cannot be before start time',
  },
  blackoutStartTimeInValidFormat: {
    id: 'authoring.blackoutDates.startTime.inValidFormat',
    defaultMessage: 'Enter a valid start time',
    description: 'Tells the user that the blackout start time format is in valid',
  },
  blackoutEndTimeInValidFormat: {
    id: 'authoring.blackoutDates.endTime.inValidFormat',
    defaultMessage: 'Enter a valid end time',
    description: 'Tells the user that the blackout end time format is in valid',
  },
  blackoutStartDateInValidFormat: {
    id: 'authoring.blackoutDates.startDate.inValidFormat',
    defaultMessage: 'Enter a valid start Date',
    description: 'Tells the user that the blackout start date format is in valid',
  },
  blackoutEndDateInValidFormat: {
    id: 'authoring.blackoutDates.endDate.inValidFormat',
    defaultMessage: 'Enter a valid end date',
    description: 'Tells the user that the blackout end date format is in valid',
  },
  deleteAltText: {
    id: 'authoring.topics.delete',
    defaultMessage: 'Delete Topic',
  },
  expandAltText: {
    id: 'authoring.topics.expand',
    defaultMessage: 'Expand',
  },
  collapseAltText: {
    id: 'authoring.topics.collapse',
    defaultMessage: 'Collapse',
  },
  startDateLabel: {
    id: 'authoring.blackoutDates.start.date',
    defaultMessage: 'Start date',
    description: 'Label for start date field',
  },
  startTimeLabel: {
    id: 'authoring.blackoutDates.start.time',
    defaultMessage: 'Start time (optional) ({zone})',
    description: 'label for start time field',
  },
  endDateLabel: {
    id: 'authoring.blackoutDates.end.date',
    defaultMessage: 'End date',
    description: 'label for end date field',
  },
  endTimeLabel: {
    id: 'authoring.blackoutDates.end.time',
    defaultMessage: 'End time (optional) ({zone})',
    description: 'label for end time field',
  },
});

export default messages;
