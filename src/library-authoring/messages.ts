import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingSubtitle: {
    id: 'course-authoring.library-authoring.heading-subtitle',
    defaultMessage: 'Content library',
    description: 'The page heading for the library page.',
  },
  headingInfoAlt: {
    id: 'course-authoring.library-authoring.heading-info-alt',
    defaultMessage: 'Info',
    description: 'Alt text for the info icon next to the page heading.',
  },
  searchPlaceholder: {
    id: 'course-authoring.library-authoring.search',
    defaultMessage: 'Search...',
    description: 'Placeholder for search field',
  },
  noSearchResults: {
    id: 'course-authoring.library-authoring.no-search-results',
    defaultMessage: 'No matching components found in this library.',
    description: 'Message displayed when no search results are found',
  },
  noComponents: {
    id: 'course-authoring.library-authoring.no-components',
    defaultMessage: 'You have not added any content to this library yet.',
    description: 'Message displayed when the library is empty',
  },
  addComponent: {
    id: 'course-authoring.library-authoring.add-component',
    defaultMessage: 'Add component',
    description: 'Button text to add a new component',
  },
  homeTab: {
    id: 'course-authoring.library-authoring.home-tab',
    defaultMessage: 'All Content',
    description: 'Tab label for the home tab',
  },
  componentsTab: {
    id: 'course-authoring.library-authoring.components-tab',
    defaultMessage: 'Components',
    description: 'Tab label for the components tab',
  },
  collectionsTab: {
    id: 'course-authoring.library-authoring.collections-tab',
    defaultMessage: 'Collections',
    description: 'Tab label for the collections tab',
  },
  componentsTempPlaceholder: {
    id: 'course-authoring.library-authoring.components-temp-placeholder',
    defaultMessage: 'There are {componentCount} components in this library',
    description: 'Temp placeholder for the component container. This will be replaced with the actual component list.',
  },
  collectionsTempPlaceholder: {
    id: 'course-authoring.library-authoring.collections-temp-placeholder',
    defaultMessage: 'Coming soon!',
    description: 'Temp placeholder for the collections container. This will be replaced with the actual collection list.',
  },
  createLibrary: {
    id: 'course-authoring.library-authoring.create-library',
    defaultMessage: 'Create library',
    description: 'Header for the create library form',
  },
  createLibraryTempPlaceholder: {
    id: 'course-authoring.library-authoring.create-library-temp-placeholder',
    defaultMessage: 'This is a placeholder for the create library form. This will be replaced with the actual form.',
    description: 'Temp placeholder for the create library container. This will be replaced with the new library form.',
  },
  recentlyModifiedTitle: {
    id: 'course-authoring.library-authoring.recently-modified-title',
    defaultMessage: 'Recently Modified',
    description: 'Title for the recently modified components and collections container',
  },
  collectionsTitle: {
    id: 'course-authoring.library-authoring.collections-title',
    defaultMessage: 'Collections ({collectionCount})',
    description: 'Title for the collections container',
  },
  componentsTitle: {
    id: 'course-authoring.library-authoring.components-title',
    defaultMessage: 'Components ({componentCount})',
    description: 'Title for the components container',
  },
  addContentTitle: {
    id: 'course-authoring.library-authoring.drawer.title.add-content',
    defaultMessage: 'Add Content',
    description: 'Title of add content in library container.',
  },
  newContentButton: {
    id: 'course-authoring.library-authoring.buttons.new-content.text',
    defaultMessage: 'New',
    description: 'Text of button to open "Add content drawer"',
  },
  closeButtonAlt: {
    id: 'course-authoring.library-authoring.buttons.close.alt',
    defaultMessage: 'Close',
    description: 'Alt text of close button',
  },
  libraryInfoButton: {
    id: 'course-authoring.library-authoring.buttons.library-info.text',
    defaultMessage: 'Library Info',
    description: 'Text of button to open "Library Info sidebar"',
  },
  readOnlyBadge: {
    id: 'course-authoring.library-authoring.badge.read-only',
    defaultMessage: 'Read Only',
    description: 'Text in badge when the user has read only access',
  },
  returnToLibrarySelection: {
    id: 'course-authoring.library-authoring.pick-components.return-to-library-selection',
    defaultMessage: 'Change Library',
    description: 'Breadcrumbs link to return to library selection',
  },
  librariesV2DisabledError: {
    id: 'authoring.alert.error.libraries.v2.disabled',
    defaultMessage: 'This page cannot be shown: Libraries v2 are disabled.',
    description: 'Error message shown to users when trying to load a libraries V2 page while libraries v2 are disabled.',
  },
});

export default messages;
