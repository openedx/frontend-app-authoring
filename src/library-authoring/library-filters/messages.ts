import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  librariesFilterBtnText: {
    id: 'course-authoring.library-authoring.library-filters.libraries.filter.btn',
    defaultMessage: 'All libraries',
    description: 'Button text for libraries filter',
  },
  collectionFilterBtnText: {
    id: 'course-authoring.library-authoring.library-filters.collection.filter.btn',
    defaultMessage: 'Collections filter',
    description: 'Button aria label text for collections filter',
  },
  librariesFilterBtnPlaceholder: {
    id: 'course-authoring.library-authoring.library-filters.libraries.filter.placeholder',
    defaultMessage: 'Search Library Name',
    description: 'Placeholder text for libraries filter',
  },
  collectionFilterBtnPlaceholder: {
    id: 'course-authoring.library-authoring.library-filters.collection.filter.placeholder',
    defaultMessage: 'Search Collection Name',
    description: 'Placeholder text for collection filter',
  },
  collectionFilterBtnEmpty: {
    id: 'course-authoring.library-authoring.library-filters.collection.filter.empty',
    defaultMessage: 'No collections found!',
    description: 'When no collections are found',
  },
  librariesFilterBtnEmpty: {
    id: 'course-authoring.library-authoring.library-filters.libraries.filter.empty',
    defaultMessage: 'No libraries found!',
    description: 'When no libraries are found',
  },
  librariesFilterBtnCount: {
    id: 'course-authoring.library-authoring.library-filters.libraries.filter.count',
    defaultMessage: '{count} Libraries',
    description: 'When more than 1 libraries are selected',
  },
  collectionsFilterBtnCount: {
    id: 'course-authoring.library-authoring.library-filters.collection.filter.count',
    defaultMessage: '{count} Collections',
    description: 'When more than 1 Collections are selected',
  },
  additionalFilterBtnAltText: {
    id: 'course-authoring.library-authoring.library-filters.additional.filter.alt-btn',
    defaultMessage: 'See more',
    description: 'Alt text for more fitlers',
  },
});

export default messages;
