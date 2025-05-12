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
    defaultMessage: 'Your course contains content from these libraries.',
    description: 'Description text for home tab',
  },
  homeTabDescriptionEmpty: {
    id: 'course-authoring.course-libraries.tab.home.description-no-links',
    defaultMessage: 'This course does not use any content from libraries.',
    description: 'Description text for home tab',
  },
  reviewTabTitle: {
    id: 'course-authoring.course-libraries.tab.review.title',
    defaultMessage: 'Review Content Updates',
    description: 'Tab title for review tab',
  },
  reviewTabDescriptionEmpty: {
    id: 'course-authoring.course-libraries.tab.home.description-no-links',
    defaultMessage: 'All components are up to date',
    description: 'Description text for home tab',
  },
  breadcrumbLabel: {
    id: 'course-authoring.course-libraries.downstream-block.breadcrumb.label',
    defaultMessage: 'Location:',
    description: 'label for breadcrumb in component cards in course libraries page.',
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
    defaultMessage: '{outOfSyncCount, plural, one {# library component is} other {# library components are}} out of sync. Review updates to accept or ignore changes',
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
  librariesV2DisabledError: {
    id: 'course-authoring.course-libraries.alert.error.libraries.v2.disabled',
    defaultMessage: 'This page cannot be shown: Libraries v2 are disabled.',
    description: 'Error message shown to users when trying to load a libraries V2 page while libraries v2 are disabled.',
  },
  cardReviewContentBtn: {
    id: 'course-authoring.course-libraries.review-tab.libcard.review-btn-text',
    defaultMessage: 'Review Updates',
    description: 'Card review button for component in review tab',
  },
  cardUpdateContentBtn: {
    id: 'course-authoring.course-libraries.review-tab.libcard.update-btn-text',
    defaultMessage: 'Update',
    description: 'Card update button for component in review tab',
  },
  cardIgnoreContentBtn: {
    id: 'course-authoring.course-libraries.review-tab.libcard.ignore-btn-text',
    defaultMessage: 'Ignore',
    description: 'Card ignore button for component in review tab',
  },
  updateSingleBlockSuccess: {
    id: 'course-authoring.course-libraries.review-tab.libcard.update-success-toast',
    defaultMessage: 'Success! "{name}" is updated',
    description: 'Success toast message when a component is updated.',
  },
  ignoreSingleBlockSuccess: {
    id: 'course-authoring.course-libraries.review-tab.libcard.ignore-success-toast',
    defaultMessage: '"{name}" will remain out of sync with library content. You will be notified when this component is updated again.',
    description: 'Success toast message when a component update is ignored.',
  },
  searchPlaceholder: {
    id: 'course-authoring.course-libraries.review-tab.search.placeholder',
    defaultMessage: 'Search',
    description: 'Search text box in review tab placeholder text',
  },
  brokenLinkTooltip: {
    id: 'course-authoring.course-libraries.home-tab.broken-link.tooltip',
    defaultMessage: 'Sourced from a library - but the upstream link is broken/invalid.',
    description: 'Tooltip text describing broken link in component listing.',
  },
  genericErrorMessage: {
    id: 'course-authoring.course-libraries.home-tab.error.message',
    defaultMessage: 'Something went wrong! Could not fetch results.',
    description: 'Generic error message displayed when fetching link data fails.',
  },
});

export default messages;
