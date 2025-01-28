import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.course-libraries.header.title',
    defaultMessage: 'Libraries',
    description: 'Title for page',
  },
  headingSubtitle: {
    id: 'course-authoring.course-libraries.header.subtitle',
    defaultMessage: 'Content',
    description: 'Subtitle for page',
  },
  homeTabTitle: {
    id: 'course-authoring.course-libraries.tab.home.title',
    defaultMessage: 'Libraries',
    description: 'Tab title for home tab',
  },
  reviewTabTitle: {
    id: 'course-authoring.course-libraries.tab.review.title',
    defaultMessage: 'Review Content Updates ({count})',
    description: 'Tab title for review tab',
  },
  breadcrumbAriaLabel: {
    id: 'course-authoring.course-libraries.downstream-block.breadcrum.aria-label',
    defaultMessage: 'Component breadcrumb',
    description: 'Aria label for breadcrum in component cards in course libraries page.',
  },
  totalComponentLabel: {
    id: 'course-authoring.course-libraries.libcard.total-component.label',
    defaultMessage: '{totalComponents} components applied',
    description: 'Prints total components applied from library',
  },
  outOfSyncCountLabel: {
    id: 'course-authoring.course-libraries.libcard.out-of-sync.label',
    defaultMessage: '{outOfSyncCount} components out of sync',
    description: 'Prints number of components out of sync from library',
  },
});

export default messages;
