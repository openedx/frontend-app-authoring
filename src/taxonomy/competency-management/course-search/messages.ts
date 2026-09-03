import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'course-authoring.competency-management.course-search.search-placeholder',
    defaultMessage: 'Search courses',
    description: 'Placeholder text for the course search field in the competency management course browser.',
  },
  selectCompetencyPrompt: {
    id: 'course-authoring.competency-management.course-search.select-competency-prompt',
    defaultMessage: 'Select a competency to browse and associate courses.',
    description: 'Prompt shown in the course browser before a competency has been selected, in place of the '
      + 'search field and course list.',
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
  outlinePlaceholder: {
    id: 'course-authoring.competency-management.course-search.outline-placeholder',
    defaultMessage: 'Course outline browsing is coming soon.',
    description: 'Placeholder text shown in place of the real course outline when a course row is expanded.',
  },
});

export default messages;
