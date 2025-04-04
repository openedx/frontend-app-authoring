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
  lockedLinksNumber: {
    id: 'course-authoring.course-optimizer.lockedLinksNumber',
    defaultMessage: '{count} locked links',
  },
  externalForbiddenLinksNumber: {
    id: 'course-authoring.course-optimizer.externalForbiddenLinksNumber',
    defaultMessage: '{count} manual check',
  },
  lockedInfoTooltip: {
    id: 'course-authoring.course-optimizer.lockedInfoTooltip',
    defaultMessage: 'These course files are "locked", so we cannot verify if the link can access the file.',
  },
  brokenLinkStatus: {
    id: 'course-authoring.course-optimizer.brokenLinkStatus',
    defaultMessage: 'Status: Broken',
  },
  lockedLinkStatus: {
    id: 'course-authoring.course-optimizer.lockedLinkStatus',
    defaultMessage: 'Status: Locked',
  },
  recommendedManualCheckText: {
    id: 'course-authoring.course-optimizer.recommendedManualCheckText',
    defaultMessage: 'Recommended Manual Check',
  },
  recommendedManualCheckTooltip: {
    id: 'course-authoring.course-optimizer.recommendedManualCheckTooltip',
    defaultMessage: 'For websites returning 403, websites often show 403 because they don\'t want bots accessing their content',
  },
});

export default messages;
