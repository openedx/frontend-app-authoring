import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  itemInProgressFooterText: {
    id: 'course-authoring.studio-home.processing.course-item.footer.in-progress',
    defaultMessage: 'The new course will be added to your course list in 5-10 minutes. Return to this page or {refresh} to update the course list. The new course will need some manual configuration.',
  },
  itemInProgressFooterHyperlink: {
    id: 'course-authoring.studio-home.processing.course-item.footer.in-progress.hyperlink',
    defaultMessage: 'refresh it',
  },
  itemInProgressActionText: {
    id: 'course-authoring.studio-home.processing.course-item.action.in-progress',
    defaultMessage: 'Configuring as re-run',
  },
  itemIsFailedActionText: {
    id: 'course-authoring.studio-home.processing.course-item.action.failed',
    defaultMessage: 'Configuration error',
  },
  itemFailedFooterText: {
    id: 'course-authoring.studio-home.processing.course-item.footer.failed',
    defaultMessage: 'A system error occurred while your course was being processed. Please go to the original course to try the re-run again, or contact your PM for assistance.',
  },
  itemFailedFooterButton: {
    id: 'course-authoring.studio-home.processing.course-item.footer.failed.button',
    defaultMessage: 'Dismiss',
  },
});

export default messages;
