import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  division_by_group: {
    id: 'course-authoring.discussions.settings.base-forum.division-by-group',
    defaultMessage: 'Division by group',
  },
  divide_by_cohorts_label: {
    id: 'course-authoring.discussions.settings.base-forum.divide-by-cohorts.label',
    defaultMessage: 'Divide discussions by cohorts',
  },
  divide_by_cohorts_help: {
    id: 'course-authoring.discussions.settings.base-forum.divide-by-cohorts.help',
    defaultMessage: 'Learners will only be able to view and respond to discussions posted by members of their cohort',
  },
  allow_division_by_unit_label: {
    id: 'course-authoring.discussions.settings.base-forum.allow-division-by-unit.label',
    defaultMessage: 'Allow cohort division for each course unit',
  },
  allow_division_by_unit_help: {
    id: 'course-authoring.discussions.settings.base-forum.allow-division-by-unit.help',
    defaultMessage: 'With this advanced setting enabled, you will be able to override the global visibility, and turn the division of cohorts on or off for each unit from the course outline view.',
  },
  divide_course_wide_topics_label: {
    id: 'course-authoring.discussions.settings.base-forum.divide-course-wide-topics.label',
    defaultMessage: 'Divide course wide discussion topics',
  },
  divide_course_wide_topics_help: {
    id: 'course-authoring.discussions.settings.base-forum.divide-course-wide-topics.help',
    defaultMessage: 'Choose which of your general course wide discussion topics you would like to divide.',
  },
  visibility_in_context: {
    id: 'course-authoring.discussions.settings.base-forum.visibility-in-context',
    defaultMessage: 'Visibility of in-context discussions',
  },
  in_context_discussion_label: {
    id: 'course-authoring.discussions.settings.base-forum.in-context-discussion.label',
    defaultMessage: 'In-context discussion',
  },
  in_context_discussion_help: {
    id: 'course-authoring.discussions.settings.base-forum.in-context-discussion.help',
    defaultMessage: 'Learners will eb able to view or hide a discussion side panel to engage with discussion on te course unit page.',
  },
  graded_unit_pages_label: {
    id: 'course-authoring.discussions.settings.base-forum.grades-unit-pages.label',
    defaultMessage: 'Graded unit pages',
  },
  graded_unit_pages_help: {
    id: 'course-authoring.discussions.settings.base-forum.grades-unit-pages.help',
    defaultMessage: 'Allow learners to engage with discussion on all graded unit pages except timed exams.',
  },
  group_in_context_subsection_label: {
    id: 'course-authoring.discussions.settings.base-forum.group-in-context-subsection.label',
    defaultMessage: 'Group in context discussion at the subsection level',
  },
  group_in_context_subsection_help: {
    id: 'course-authoring.discussions.settings.base-forum.group-in-context-subsection.help',
    defaultMessage: 'Learners will be able to view any post in the sub-section no matter which unit page they are viewing. While this is not recommended, if your course has short learning sequences or low enrollment grouping may increase engagement.',
  },
  allow_unit_level_visibility_label: {
    id: 'course-authoring.discussions.settings.base-forum.allow-unit-level-visibility.label',
    defaultMessage: 'Allow visibility configuration for each course unit',
  },
  allow_unit_level_visibility_help: {
    id: 'course-authoring.discussions.settings.base-forum.allow-unit-level-visibility.help',
    defaultMessage: 'With this advanced setting enabled you will be able to override the global visibility setting and turn discussions on or off for each unit from the course outline view..',
  },
  anonymous_posting: {
    id: 'course-authoring.discussions.settings.base-forum.anonymous-posting',
    defaultMessage: 'Anonymous posting',
  },
  allow_anonymous_posts_label: {
    id: 'course-authoring.discussions.settings.base-forum.allow-anonymous.label',
    defaultMessage: 'Allow Anonymous Discussion Posts',
  },
  allow_anonymous_posts_help: {
    id: 'course-authoring.discussions.settings.base-forum.allow-anonymous.help',
    defaultMessage: 'Enter true or false. If true, students can create discussion posts that are anonymous to all users.',
  },
  allow_anonymous_posts_peers_label: {
    id: 'course-authoring.discussions.settings.base-forum.allow-anonymous-peers.label',
    defaultMessage: 'Allow Anonymous Discussion Posts to Peers',
  },
  allow_anonymous_posts_peers_help: {
    id: 'course-authoring.discussions.settings.base-forum.allow-anonymous-peers.help',
    defaultMessage: 'Enter true or false. If true, students can create discussion posts that are anonymous to other students. This setting does not make posts anonymous to course staff.',
  },
  blackout_dates_label: {
    id: 'course-authoring.discussions.settings.base-forum.blackout_dates.label',
    defaultMessage: 'Discussion Blackout Dates',
  },
  blackout_dates_help: {
    id: 'course-authoring.discussions.settings.base-forum.blackout_dates.help',
    defaultMessage:
      `Enter pairs of dates between which students cannot post to discussion forums. Inside the provided
      brackets, enter an additional set of square brackets surrounding each pair of dates you add.
      Format each pair of dates as ["YYYY-MM-DD", "YYYY-MM-DD"]. To specify times as well as dates,
      format each pair as ["YYYY-MM-DDTHH:MM", "YYYY-MM-DDTHH:MM"]. Be sure to include the "T" between
      the date and time. For example, an entry defining two blackout periods looks like this, including
      the outer pair of square brackets: [["2015-09-15", "2015-09-21"], ["2015-10-01", "2015-10-08"]]`,
  },
});

export default messages;
