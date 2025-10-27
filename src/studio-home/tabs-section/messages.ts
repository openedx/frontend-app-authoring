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
  alertTitle: {
    id: 'studio-home.libraries.migrate-alert.title',
    defaultMessage: 'Migrate Legacy Libraries',
    description: 'Title for the alert message to migrate legacy libraries',
  },
  alertDescriptionV1: {
    id: 'studio-home.libraries.migrate-alert.description-v1',
    defaultMessage: 'In a future release, legacy libraries will no longer be supported.'
      + ' The new libraries experience allows you to author sections, subsections, units,'
      + ' and components to reuse across your courses. Content from legacy libraries can be'
      + ' migrated to the new experience.',
    description: 'Description for the alert message to migrate legacy libraries on legacy libraries tab.',
  },
  alertReviewButton: {
    id: 'studio-home.legacy-libraries.migrate-alert.review-button',
    defaultMessage: 'Review Legacy Libraries',
    description: 'Label for the button to review legacy libraries',
  },
  createLibraryButton: {
    id: 'studio-home.legacy-libraries.migrate.create-button',
    defaultMessage: 'Create New Library',
    description: 'Label for the button to create a new library in the library list view.',
  },
  librariesV1TabMigrationFilterLabel: {
    id: 'course-authoring.studio-home.libraries.tab.migration.filter.label',
    description: 'Label text for migration filter in legacy libraries tab',
    defaultMessage: 'Any Migration Status',
  },
  librariesV1TabMigrationFilterMigratedLabel: {
    id: 'course-authoring.studio-home.libraries.tab.migration.filter.item.migrated.label',
    description: 'Label text for migrated migration filter menu item in legacy libraries tab',
    defaultMessage: 'Migrated',
  },
  librariesV1TabMigrationFilterUnmigratedLabel: {
    id: 'course-authoring.studio-home.libraries.tab.migration.filter.item.unmigrated.label',
    description: 'Label text for unmigrated migration filter menu item in legacy libraries tab',
    defaultMessage: 'Unmigrated',
  },
  alertDescriptionV2: {
    id: 'studio-home.libraries.migrate-alert.description-v2',
    defaultMessage: 'Welcome to the new Content Libraries experience! Libraries have been redesigned'
      + ' from the ground up, making it much easier to reuse content. You can create, organize and manage'
      + ' new content, reuse your content in as many courses as you\'d like, publish updates, and create/randomize'
      + ' Problem Banks. See {link} for details.',
    description: 'Description for the alert message while there are no libraries pending migration on v2 tab.',
  },
  alertDescriptionV2MigrationPending: {
    id: 'studio-home.libraries.migrate-alert.description-v2.migration-pending',
    defaultMessage: ' Legacy libraries can be migrated using the migration tool.',
    description: 'Complementary description for the alert message while there are libraries pending migration.',
  },
  alertLibrariesDocLinkText: {
    id: 'studio-home.libraries.migrate-alert.docs',
    defaultMessage: 'Libraries documentation',
    description: 'Link text for the libraries documentation link.',
  },
  selectAll: {
    id: 'studio-home.libraries.migrate.select-all',
    defaultMessage: 'Select All',
    description: 'Button to select all libraries when migrate legacy libraries.',
  },
});

export default messages;
