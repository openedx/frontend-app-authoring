import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pageTitle: {
    id: 'course-authoring.course-optimizer.page.title',
    defaultMessage: '{headingTitle} | {courseName} | {siteName}',
  },
  noDataCard: {
    id: 'course-authoring.course-optimizer.noDataCard',
    defaultMessage: 'No Scan data available',
  },
  linkToPrevCourseRun: {
    id: 'course-authoring.course-optimizer.linkToPrevCourseRun',
    defaultMessage: 'Links to previous course run',
  },
  noResultsFound: {
    id: 'course-authoring.course-optimizer.noResultsFound',
    defaultMessage: 'No results found',
  },
  brokenLinksHeader: {
    id: 'course-authoring.course-optimizer.brokenLinksHeader',
    defaultMessage: 'Broken links',
  },
  filterButtonLabel: {
    id: 'course-authoring.course-optimizer.filterButtonLabel',
    defaultMessage: 'Filters',
  },
  lockedCheckboxLabel: {
    id: 'course-authoring.course-optimizer.lockedCheckboxLabel',
    defaultMessage: 'Show Locked Course Files',
  },
  lockedLabel: {
    id: 'course-authoring.course-optimizer.lockedLabel',
    defaultMessage: 'Locked',
  },
  lockedInfoTooltip: {
    id: 'course-authoring.course-optimizer.lockedInfoTooltip',
    defaultMessage: 'These course files are inaccessible for non-enrolled users so we cannot verify if the link can access the file.',
  },
  brokenLabel: {
    id: 'course-authoring.course-optimizer.brokenLabel',
    defaultMessage: 'Broken',
  },
  brokenInfoTooltip: {
    id: 'course-authoring.course-optimizer.brokenInfoTooltip',
    defaultMessage: `Links pointing to external websites, images, or videos that do not exist or are no longer available.
      These links can cause issues for learners when they try to access the content.`,
  },
  manualLabel: {
    id: 'course-authoring.course-optimizer.manualLabel',
    defaultMessage: 'Manual',
  },
  manualInfoTooltip: {
    id: 'course-authoring.course-optimizer.manualInfoTooltip',
    defaultMessage: 'We couldn\'t verify this link. Please check it manually.',
  },
  clearFilters: {
    id: 'course-authoring.course-optimizer.clearFilters',
    defaultMessage: 'Clear filters',
  },
  customPagesHeader: {
    id: 'course-authoring.course-optimizer.customPagesHeader',
    defaultMessage: 'Custom pages',
  },
  courseUpdatesHeader: {
    id: 'course-authoring.course-optimizer.courseUpdatesHeader',
    defaultMessage: 'Course updates',
  },
  updateLinkError: {
    id: 'course-authoring.course-optimizer.updateLinkError',
    defaultMessage: 'Link couldn\'t be updated.',
  },
  updateLinksError: {
    id: 'course-authoring.course-optimizer.updateLinksError',
    defaultMessage: 'Some links couldn\'t be updated.',
  },
  updateButton: {
    id: 'course-authoring.scanResults.updateButton',
    defaultMessage: 'Update',
  },
  updated: {
    id: 'course-authoring.scanResults.updated',
    defaultMessage: 'Updated',
  },
});

export default messages;
