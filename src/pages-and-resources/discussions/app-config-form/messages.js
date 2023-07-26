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
  confirm: {
    id: 'authoring.discussions.confirm',
    defaultMessage: 'Confirm',
    description: 'Button allowing the user to confirm Confirmation.',
  },
  confirmConfigurationChange: {
    id: 'authoring.discussions.confirmConfigurationChange',
    defaultMessage: 'Are you sure you want to change the discussion settings?',
    description: 'Asks the user whether he/she really wants to change settings.',
  },
  confirmEnableDiscussionsLabel: {
    id: 'authoring.discussions.confirmEnableDiscussionsLabel',
    defaultMessage: 'Enable discussions on units in graded subsections?',
    description: 'Asks the user whether he/she really wants to enable discussions on units in graded subsections.',
  },
  cancelEnableDiscussionsLabel: {
    id: 'authoring.discussions.cancelEnableDiscussionsLabel',
    defaultMessage: 'Disable discussions on units in graded subsections?',
    description: 'Asks the user whether he/she really wants to disable discussions on units in graded subsections.',
  },
  confirmEnableDiscussions: {
    id: 'authoring.discussions.confirmEnableDiscussions',
    defaultMessage: 'Enabling this toggle will automatically enable discussion on all units in graded subsections, that are not timed exams.',
    description: 'Asks the user whether he/she really wants to enable discussions on units in graded subsections.',
  },
  cancelEnableDiscussions: {
    id: 'authoring.discussions.cancelEnableDiscussions',
    defaultMessage: 'Disabling this toggle will automatically disable discussion on all units in graded subsections. Discussion topics containing at least 1 thread will be listed and accessible under “Archived” in Topics tab on the Discussions page.',
    description: 'Asks the user whether he/she really wants to disable discussions on units in graded subsections.',
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
    defaultMessage: 'edX (new)',
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
  cohortsEnabled: {
    id: 'authoring.discussions.builtIn.cohortsEnabled.label',
    defaultMessage: 'To adjust these settings, enable cohorts on the ',
    description: 'Label text informing the user to enable cohort',
  },
  instructorDashboard: {
    id: 'authoring.discussions.builtIn.instructorDashboard.label',
    defaultMessage: 'instructor dashboard',
    description: 'Label text for instructor dashboard',
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
  // Restricted dates
  restrictedStartDateHelp: {
    id: 'authoring.discussions.restrictedStartDate.help',
    defaultMessage: 'Enter a start date, e.g. 12/10/2023',
  },
  restrictedEndDateHelp: {
    id: 'authoring.discussions.restrictedEndDate.help',
    defaultMessage: 'Enter an end date, e.g. 12/17/2023',
  },
  restrictedStartTimeHelp: {
    id: 'authoring.discussions.restrictedStartTime.help',
    defaultMessage: 'Enter a start time, e.g. 09:00 AM',
  },
  restrictedEndTimeHelp: {
    id: 'authoring.discussions.restrictedEndTime.help',
    defaultMessage: 'Enter an end time, e.g. 05:00 PM',
  },
  restrictedDatesStatus: {
    id: 'authoring.restrictedDates.status',
    defaultMessage: '{status}',
  },
  restrictedStartDateRequired: {
    id: 'authoring.restrictedDates.startDate.required',
    defaultMessage: 'Start date is a required field',
    description: 'Tells the user that the restricted dates must have start date and it is required.',
  },
  restrictedEndDateRequired: {
    id: 'authoring.restrictedDates.endDate.required',
    defaultMessage: 'End date is a required field',
    description: 'Tells the user that the restricted dates must have end date and it is required.',
  },
  restrictedStartDateInPast: {
    id: 'authoring.restrictedDates.startDate.inPast',
    defaultMessage: 'Start date cannot be after end date',
    description: 'Tells the user that the restricted start date cannot be in past and cannot be after end date',
  },
  restrictedEndDateInPast: {
    id: 'authoring.restrictedDates.endDate.inPast',
    defaultMessage: 'End date cannot be before start date',
    description: 'Tells the user that the restricted end date cannot be in past and cannot be before start date',
  },
  restrictedStartTimeInPast: {
    id: 'authoring.restrictedDates.startTime.inPast',
    defaultMessage: 'Start time cannot be after end time',
    description: 'Tells the user that the restricted start time cannot be in past and cannot be after end time',
  },
  restrictedEndTimeInPast: {
    id: 'authoring.restrictedDates.endTime.inPast',
    defaultMessage: 'End time cannot be before start time',
    description: 'Tells the user that the restricted end time cannot be in past and cannot be before start time',
  },
  restrictedStartTimeInValidFormat: {
    id: 'authoring.restrictedDates.startTime.inValidFormat',
    defaultMessage: 'Enter a valid start time',
    description: 'Tells the user that the restricted start time format is in valid',
  },
  restrictedEndTimeInValidFormat: {
    id: 'authoring.restrictedDates.endTime.inValidFormat',
    defaultMessage: 'Enter a valid end time',
    description: 'Tells the user that the restricted end time format is in valid',
  },
  restrictedStartDateInValidFormat: {
    id: 'authoring.restrictedDates.startDate.inValidFormat',
    defaultMessage: 'Enter a valid start Date',
    description: 'Tells the user that the restricted start date format is in valid',
  },
  restrictedEndDateInValidFormat: {
    id: 'authoring.restrictedDates.endDate.inValidFormat',
    defaultMessage: 'Enter a valid end date',
    description: 'Tells the user that the restricted end date format is in valid',
  },
  discussionRestrictionLabel: {
    id: 'authoring.discussions.builtIn.discussionRestriction.label',
    defaultMessage: 'Discussion restrictions',
  },
  discussionRestrictionHelp: {
    id: 'authoring.discussions.discussionRestriction.help',
    defaultMessage: 'If enabled, learners will not be able to post in discussions.',
  },
  discussionRestrictionDatesHelp: {
    id: 'authoring.discussions.discussionRestrictionDates.help',
    defaultMessage: 'If added, learners will not be able to post in discussions between these dates.',
  },
  addRestrictedDatesButton: {
    id: 'authoring.discussions.addRestrictedDatesButton',
    defaultMessage: 'Add restricted dates',
  },
  configureRestrictedDates: {
    id: 'authoring.discussions.builtIn.configureRestrictedDates.label',
    defaultMessage: 'Configure restricted date range',
  },
  activeRestrictedDatesDeletionLabel: {
    id: 'authoring.discussions.activeRestrictedDatesDeletion.label',
    defaultMessage: 'Delete active restricted dates?',
    description: 'Label for active restricted dates delete popup allowing a user to delete a restricted date range.',
  },
  activeRestrictedDatesDeletionHelp: {
    id: 'authoring.discussions.activeRestrictedDatesDeletion.help',
    defaultMessage: 'These restricted dates are currently active. If deleted, learners will be able to post in discussions during these dates. Are you sure you want to proceed?',
    description: 'Help text for delete a active restricted dates from restricted dates section.',
  },
  completeRestrictedDatesDeletionHelp: {
    id: 'authoring.discussions.completeRestrictedDatesDeletion.help',
    defaultMessage: 'Are you sure you want to delete these restricted dates?',
    description: 'Help text for delete a complete restricted dates from restricted dates section.',
  },
  restrictedDatesDeletionLabel: {
    id: 'authoring.discussions.restrictedDatesDeletion.label',
    defaultMessage: 'Delete restricted dates?',
    description: 'Label for restricted dates delete popup allowing a user to delete a restricted date range.',
  },
  restrictedDatesDeletionHelp: {
    id: 'authoring.discussions.restrictedDatesDeletion.help',
    defaultMessage: 'If deleted, learners will be able to post in discussions during these dates.',
    description: 'Help text for delete a upcoming restricted dates from restricted dates section.',
  },
  discussionRestrictionOffLabelHelpText: {
    id: 'authoring.discussions.discussionRestrictionOff.label',
    defaultMessage: 'If enabled, learners will be able to post in discussions',
  },
  discussionRestrictionOnLabelHelpText: {
    id: 'authoring.discussions.discussionRestrictionOn.label',
    defaultMessage: 'If enabled, learners will not be able to post in discussions',
  },
  discussionRestrictionScheduledLabelHelpText: {
    id: 'authoring.discussions.discussionRestrictionScheduled.label',
    defaultMessage: 'If added, learners will not be able to post in discussions between these dates.',
  },
  enableRestrictedDatesConfirmationLabel: {
    id: 'authoring.discussions.enableRestrictedDatesConfirmation.label',
    defaultMessage: 'Enable restricted dates?',
  },
  enableRestrictedDatesConfirmationHelp: {
    id: 'authoring.discussions.enableRestrictedDatesConfirmation.help',
    defaultMessage: 'Learners will not be able to post in discussions.',
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
    id: 'authoring.restrictedDates.start.date',
    defaultMessage: 'Start date',
    description: 'Label for start date field',
  },
  startTimeLabel: {
    id: 'authoring.restrictedDates.start.time',
    defaultMessage: 'Start time (optional)',
    description: 'label for start time field',
  },
  endDateLabel: {
    id: 'authoring.restrictedDates.end.date',
    defaultMessage: 'End date',
    description: 'label for end date field',
  },
  endTimeLabel: {
    id: 'authoring.restrictedDates.end.time',
    defaultMessage: 'End time (optional)',
    description: 'label for end time field',
  },
});

export default messages;
