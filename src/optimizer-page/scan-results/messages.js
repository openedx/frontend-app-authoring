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
  noBrokenLinksCard: {
    id: 'course-authoring.course-optimizer.emptyResultsCard',
    defaultMessage: 'No broken links found',
  },
  scanHeader: {
    id: 'course-authoring.course-optimizer.scanHeader',
    defaultMessage: 'Broken Links Scan',
  },
  lockedCheckboxLabel: {
    id: 'course-authoring.course-optimizer.lockedCheckboxLabel',
    defaultMessage: 'Show Locked Course Files',
  },
  brokenLinksNumber: {
    id: 'course-authoring.course-optimizer.brokenLinksNumber',
    defaultMessage: '{count} broken links',
  },
  lockedInfoTooltip: {
    id: 'course-authoring.course-optimizer.lockedInfoTooltip',
    defaultMessage: 'These course files are &quot;locked&quot, so we cannot test whether they work or not.',
  },
  brokenLinkStatus: {
    id: 'course-authoring.course-optimizer.brokenLinkStatus',
    defaultMessage: 'Status: Broken',
  },
  lockedLinkStatus: {
    id: 'course-authoring.course-optimizer.lockedLinkStatus',
    defaultMessage: 'Status: Locked',
  },
});

export default messages;
