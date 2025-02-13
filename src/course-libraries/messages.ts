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
  homeTabDescription: {
    id: 'course-authoring.course-libraries.tab.home.description',
    defaultMessage: 'This course contains content from these libraries.',
    description: 'Description text for home tab',
  },
  homeTabDescriptionEmpty: {
    id: 'course-authoring.course-libraries.tab.home.description-no-links',
    defaultMessage: 'This course does not use any content from libraries.',
    description: 'Description text for home tab',
  },
  reviewTabTitle: {
    id: 'course-authoring.course-libraries.tab.review.title',
    defaultMessage: 'Review Content Updates ({count})',
    description: 'Tab title for review tab',
  },
  reviewTabTitleEmpty: {
    id: 'course-authoring.course-libraries.tab.review.title-no-updates',
    defaultMessage: 'Review Content Updates',
    description: 'Tab title for review tab when no updates are available',
  },
  breadcrumbAriaLabel: {
    id: 'course-authoring.course-libraries.downstream-block.breadcrumb.aria-label',
    defaultMessage: 'Component breadcrumb',
    description: 'Aria label for breadcrumb in component cards in course libraries page.',
  },
  totalComponentLabel: {
    id: 'course-authoring.course-libraries.libcard.total-component.label',
    defaultMessage: '{totalComponents, plural, one {# component} other {# components}} applied',
    description: 'Prints total components applied from library',
  },
  allUptodateLabel: {
    id: 'course-authoring.course-libraries.libcard.up-to-date.label',
    defaultMessage: 'All components up to date',
    description: 'Shown if all components under a library are up to date',
  },
  outOfSyncCountLabel: {
    id: 'course-authoring.course-libraries.libcard.out-of-sync.label',
    defaultMessage: '{outOfSyncCount, plural, one {# component} other {# components}} out of sync',
    description: 'Prints number of components out of sync from library',
  },
  outOfSyncCountAlertTitle: {
    id: 'course-authoring.course-libraries.libcard.out-of-sync.alert.title',
    defaultMessage: '{outOfSyncCount} library components are out of sync. Review updates to accept or ignore changes',
    description: 'Alert message shown when library components are out of sync',
  },
  reviewUpdatesBtn: {
    id: 'course-authoring.course-libraries.libcard.review-updates.btn.text',
    defaultMessage: 'Review Updates',
    description: 'Action button to review updates',
  },
  outOfSyncCountAlertReviewBtn: {
    id: 'course-authoring.course-libraries.libcard.out-of-sync.alert.review-btn-text',
    defaultMessage: 'Review',
    description: 'Alert review button text',
  },
});

export default messages;
