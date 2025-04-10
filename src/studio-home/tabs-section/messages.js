import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  coursesTabTitle: {
    id: 'course-authoring.studio-home.courses.tab.title',
    defaultMessage: 'Courses',
  },
  courseTabErrorMessage: {
    id: 'course-authoring.studio-home.courses.tab.error.message',
    defaultMessage: 'Failed to fetch courses. Please try again later.',
  },
  coursesPaginationInfo: {
    id: 'course-authoring.studio-home.courses.pagination.info',
    defaultMessage: 'Showing {length} of {total}',
  },
  librariesTabErrorMessage: {
    id: 'course-authoring.studio-home.libraries.tab.error.message',
    defaultMessage: 'Failed to fetch libraries. Please try again later.',
  },
  librariesTabTitle: {
    id: 'course-authoring.studio-home.libraries.tab.title',
    defaultMessage: 'Libraries',
  },
  legacyLibrariesTabTitle: {
    id: 'course-authoring.studio-home.legacy.libraries.tab.title',
    defaultMessage: 'Legacy Libraries',
  },
  archivedTabTitle: {
    id: 'course-authoring.studio-home.archived.tab.title',
    defaultMessage: 'Archived courses',
  },
  archiveTabErrorMessage: {
    id: 'course-authoring.studio-home.archived.tab.error.message',
    defaultMessage: 'Failed to fetch archived courses. Please try again later.',
  },
  coursesTabCourseNotFoundAlertTitle: {
    id: 'course-authoring.studio-home.courses.tab.course.not.found.alert.title',
    defaultMessage: 'We could not find any result',
  },
  coursesTabCourseNotFoundAlertMessage: {
    id: 'course-authoring.studio-home.courses.tab.course.not.found.alert.message',
    defaultMessage: 'There are no courses with the current filters.',
  },
  coursesTabCourseNotFoundAlertCleanFiltersButton: {
    id: 'course-authoring.studio-home.courses.tab.course.not.found.alert.clean.filters.button',
    defaultMessage: 'Clear filters',
  },
  taxonomiesTabTitle: {
    id: 'course-authoring.studio-home.taxonomies.tab.title',
    defaultMessage: 'Taxonomies',
    description: 'Title of Taxonomies tab on the home page',
  },
  libraryV2PlaceholderTitle: {
    id: 'course-authoring.studio-home.libraries.placeholder.title',
    defaultMessage: 'Library V2 Placeholder',
  },
  libraryV2PlaceholderBody: {
    id: 'course-authoring.studio-home.libraries.placeholder.body',
    defaultMessage: 'This is a placeholder page, as the Library Authoring MFE is not enabled.',
  },
  librariesV2TabBetaBadge: {
    id: 'course-authoring.studio-home.libraries.tab.library.beta-badge',
    defaultMessage: 'Beta',
    description: 'Text used to mark the Libraries v2 feature as "in beta"',
  },
  librariesV2TabBetaText: {
    id: 'course-authoring.studio-home.libraries.tab.library.beta-text',
    defaultMessage: 'Welcome to the new Beta Libraries experience! Libraries have been redesigned from the ground up,'
      + ' making it much easier to reuse and remix course content. The new Libraries space lets you create, organize and'
      + ' manage new content; reuse your content in as many courses as you\'d like; sync updates centrally; and create'
      + ' and randomize problem sets. See {link} for details.',
    description: 'Explanatory text shown on the Libraries v2 tab during the beta release.',
  },
  librariesV2TabBetaTutorialLinkText: {
    id: 'course-authoring.studio-home.libraries.tab.library.beta-link-text',
    defaultMessage: 'Libraries v2 tutorial',
    description: 'Text to use as the link in the "course-authoring.studio-home.libraries.tab.library.beta-text" message',
  },
  librariesV2TabLibrarySearchPlaceholder: {
    id: 'course-authoring.studio-home.libraries.tab.library.search-placeholder',
    defaultMessage: 'Search',
  },
  librariesV2TabLibraryNotFoundAlertTitle: {
    id: 'course-authoring.studio-home.libraries.tab.library.not.found.alert.title',
    defaultMessage: 'We could not find any result',
  },
  librariesV2TabLibraryNotFoundAlertMessage: {
    id: 'course-authoring.studio-home.libraries.tab.library.not.found.alert.message',
    defaultMessage: 'There are no libraries with the current filters.',
  },
});

export default messages;
