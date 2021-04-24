import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // Division by cohort fields
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
  divideCourseWideTopicsLabel: {
    id: 'authoring.discussions.builtIn.divideCourseWideTopics.label',
    defaultMessage: 'Divide course wide discussion topics',
    description: 'Label for a switch that enables dividing course wide topics by cohorts.',
  },
  divideCourseWideTopicsHelp: {
    id: 'authoring.discussions.builtIn.divideCourseWideTopics.help',
    defaultMessage: 'Choose which of your general course wide discussion topics you would like to divide.',
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
  inContextDiscussionLabel: {
    id: 'authoring.discussions.builtIn.inContextDiscussion.label',
    defaultMessage: 'In-context discussion',
  },
  inContextDiscussionHelp: {
    id: 'authoring.discussions.builtIn.inContextDiscussion.help',
    defaultMessage: 'Learners will be able to view or hide a discussion side panel to engage with discussion on the course unit page.',
  },
  gradedUnitPagesLabel: {
    id: 'authoring.discussions.builtIn.gradedUnitPages.label',
    defaultMessage: 'Graded unit pages',
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
  allowUnitLevelVisibilityLabel: {
    id: 'authoring.discussions.builtIn.allowUnitLevelVisibility.label',
    defaultMessage: 'Allow visibility configuration for each course unit',
  },
  allowUnitLevelVisibilityHelp: {
    id: 'authoring.discussions.builtIn.allowUnitLevelVisibility.help',
    defaultMessage: 'With this advanced setting enabled you will be able to override the global visibility setting and turn discussions on or off for each unit from the course outline view..',
  },

  // Anonymous posting fields
  anonymousPosting: {
    id: 'authoring.discussions.builtIn.anonymousPosting',
    defaultMessage: 'Anonymous posting',
  },
  allowAnonymousPostsLabel: {
    id: 'authoring.discussions.builtIn.allowAnonymous.label',
    defaultMessage: 'Allow Anonymous Discussion Posts',
  },
  allowAnonymousPostsHelp: {
    id: 'authoring.discussions.builtIn.allowAnonymous.help',
    defaultMessage: 'Enter true or false. If true, students can create discussion posts that are anonymous to all users.',
  },
  allowAnonymousPostsPeersLabel: {
    id: 'authoring.discussions.builtIn.allowAnonymousPeers.label',
    defaultMessage: 'Allow Anonymous Discussion Posts to Peers',
  },
  allowAnonymousPostsPeersHelp: {
    id: 'authoring.discussions.builtIn.allowAnonymousPeers.help',
    defaultMessage: 'Enter true or false. If true, students can create discussion posts that are anonymous to other students. This setting does not make posts anonymous to course staff.',
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
    defaultMessage:
      `Enter pairs of dates between which students cannot post to discussion forums. Inside the provided
      brackets, enter an additional set of square brackets surrounding each pair of dates you add.
      Format each pair of dates as ["YYYY-MM-DD", "YYYY-MM-DD"]. To specify times as well as dates,
      format each pair as ["YYYY-MM-DDTHH:MM", "YYYY-MM-DDTHH:MM"]. Be sure to include the "T" between
      the date and time. For example, an entry defining two blackout periods looks like this, including
      the outer pair of square brackets: [["2015-09-15", "2015-09-21"], ["2015-10-01", "2015-10-08"]]`,
  },
  blackoutDatesFormattingError: {
    id: 'authoring.discussions.builtIn.blackoutDates.formattingError',
    defaultMessage: "There's a formatting error in your blackout dates.",
  },
});

export default messages;
