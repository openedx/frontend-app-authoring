import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  coursesAndContentLabel: {
    id: 'course-authoring.competency-management.course-search.courses-and-content-label',
    defaultMessage: 'Courses & Content',
    description: 'Persistent header label shown above the course list, in every state (loading/error/empty/'
      + 'populated), once a competency is selected.',
  },
  searchPlaceholder: {
    id: 'course-authoring.competency-management.course-search.search-placeholder',
    defaultMessage: 'Search courses',
    description: 'Placeholder text for the course search field in the competency management course browser.',
  },
  errorMessage: {
    id: 'course-authoring.competency-management.course-search.error-message',
    defaultMessage: 'There was a problem loading courses. Please try again.',
    description: 'Inline error message shown when the course search request fails.',
  },
  noAccessibleCourses: {
    id: 'course-authoring.competency-management.course-search.no-accessible-courses',
    defaultMessage: 'You do not have access to any courses.',
    description: 'Message shown when the course search returns no results and no search text has been entered.',
  },
  noMatchingCourses: {
    id: 'course-authoring.competency-management.course-search.no-matching-courses',
    defaultMessage: 'No courses match your search.',
    description: 'Message shown when the course search returns no results for the entered search text.',
  },
  clearSearchButtonLabel: {
    id: 'course-authoring.competency-management.course-search.clear-search-button-label',
    defaultMessage: 'Clear search',
    description: 'Label for the button that clears the course search field and re-runs the query with no search text.',
  },
  expandRowButtonLabel: {
    id: 'course-authoring.competency-management.course-search.expand-row.button-label',
    defaultMessage: 'Expand',
    description: 'Accessible label for the disclosure control that expands a course row to show its outline.',
  },
  collapseRowButtonLabel: {
    id: 'course-authoring.competency-management.course-search.collapse-row.button-label',
    defaultMessage: 'Collapse',
    description: 'Accessible label for the disclosure control that collapses an expanded course row.',
  },
  expandSectionButtonLabel: {
    id: 'course-authoring.competency-management.course-search.expand-section.button-label',
    defaultMessage: 'Expand',
    description: 'Accessible label for the disclosure control that expands a section (chapter) within an '
      + 'expanded course row to show its graded subsections. Distinct from expandRowButtonLabel, which is for the '
      + 'course-row-level toggle, not this section-level one.',
  },
  collapseSectionButtonLabel: {
    id: 'course-authoring.competency-management.course-search.collapse-section.button-label',
    defaultMessage: 'Collapse',
    description: 'Accessible label for the disclosure control that collapses an expanded section (chapter) '
      + 'within a course row. Distinct from collapseRowButtonLabel, which is for the course-row-level toggle, not '
      + 'this section-level one.',
  },
  outlineErrorMessage: {
    id: 'course-authoring.competency-management.course-search.outline-error-message',
    defaultMessage: 'There was a problem loading this course\'s outline.',
    description: 'Inline error message shown inside a single expanded course row when fetching that '
      + 'course\'s outline fails. Distinct from the panel-level course search error message.',
  },
  noGradedSubsectionsMessage: {
    id: 'course-authoring.competency-management.course-search.no-graded-subsections-message',
    defaultMessage: 'This course has no gradeable subsections.',
    description: 'Message shown in an expanded course row when the course outline contains no subsections '
      + 'marked as graded, in place of the section/subsection list.',
  },
  dateRangeLabel: {
    id: 'course-authoring.competency-management.course-search.date-range-label',
    defaultMessage: 'Start Date',
    description: 'Accessible name and visible text for the button that opens the course start-date range '
      + 'calendar, filtering the course list to courses starting on or after the chosen start date and/or on or '
      + 'before the chosen end date. Always reads this fixed text, even once a range is picked.',
  },
  clearDateRangeButtonLabel: {
    id: 'course-authoring.competency-management.course-search.clear-date-range-button-label',
    defaultMessage: 'Clear dates',
    description: 'Accessible label for the button that clears the selected course start-date range and re-runs '
      + 'the query with no date filter. Only shown once a start date has been picked.',
  },
  associationsSectionLabel: {
    id: 'course-authoring.competency-management.course-search.associations-section-label',
    defaultMessage: 'Competency Criteria Associations',
    description: 'Header label shown above the "Demonstrate Mastery For" line and the associations empty '
      + 'state, once a competency is selected.',
  },
  demonstrateMasteryForLabel: {
    id: 'course-authoring.competency-management.course-search.demonstrate-mastery-for-label',
    defaultMessage: 'Demonstrate Mastery For {competencyName}',
    description: 'Line shown under the associations section label, naming the currently active competency.',
  },
  noAssociationsMessage: {
    id: 'course-authoring.competency-management.course-search.no-associations-message',
    defaultMessage: 'No content associated.',
    description: 'First line of the static empty state shown in the associations block, since there is no '
      + 'backend endpoint yet to list a competency\'s actual associations.',
  },
  noAssociationsPromptMessage: {
    id: 'course-authoring.competency-management.course-search.no-associations-prompt-message',
    defaultMessage: 'Make content selections to associate this competency with course content.',
    description: 'Second line of the static empty state shown in the associations block, prompting the user '
      + 'to make content selections below.',
  },
});

export default messages;
