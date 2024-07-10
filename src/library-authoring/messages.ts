import { defineMessages as _defineMessages } from '@edx/frontend-platform/i18n';
import type { defineMessages as defineMessagesType } from 'react-intl';

// frontend-platform currently doesn't provide types... do it ourselves.
const defineMessages = _defineMessages as typeof defineMessagesType;

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
    defaultMessage: 'Home',
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
  recentComponentsTempPlaceholder: {
    id: 'course-authoring.library-authoring.recent-components-temp-placeholder',
    defaultMessage: 'Recently modified components and collections will be displayed here.',
    description: 'Temp placeholder for the recent components container. This will be replaced with the actual list.',
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
});

export default messages;
