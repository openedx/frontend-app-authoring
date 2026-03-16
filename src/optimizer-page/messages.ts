import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pageTitle: {
    id: 'course-authoring.course-optimizer.page.title',
    defaultMessage: '{headingTitle} | {courseName} | {siteName}',
  },
  headingTitle: {
    id: 'course-authoring.course-optimizer.heading.title',
    defaultMessage: 'Course optimizer',
  },
  new: {
    id: 'course-authoring.course-optimizer.new',
    defaultMessage: 'New',
  },
  headingSubtitle: {
    id: 'course-authoring.course-optimizer.heading.subtitle',
    defaultMessage: 'Tools',
  },
  description: {
    id: 'course-authoring.course-optimizer.description',
    defaultMessage: 'This tool will scan your course for broken links, and any links that point to pages in your previous course run. Unpublished changes will not be included in the scan. Note that this process will take more time for larger courses.',
  },
  card1Title: {
    id: 'course-authoring.course-optimizer.card1.title',
    defaultMessage: 'Scan my course',
  },
  buttonTitle: {
    id: 'course-authoring.course-optimizer.button.title',
    defaultMessage: 'Scan course',
  },
  preparingStepTitle: {
    id: 'course-authoring.course-optimizer.peparing-step.title',
    defaultMessage: 'Preparing',
  },
  preparingStepDescription: {
    id: 'course-authoring.course-optimizer.peparing-step.description',
    defaultMessage: 'Preparing to start the scan',
  },
  scanningStepTitle: {
    id: 'course-authoring.course-optimizer.scanning-step.title',
    defaultMessage: 'Scanning',
  },
  scanningStepDescription: {
    id: 'course-authoring.course-optimizer.scanning-step.description',
    defaultMessage: 'Scanning for broken links in your course (You can now leave this page safely, but avoid making drastic changes to content until the scan is complete)',
  },
  successStepTitle: {
    id: 'course-authoring.course-optimizer.success-step.title',
    defaultMessage: 'Success',
  },
  successStepDescription: {
    id: 'course-authoring.course-optimizer.success-step.description',
    defaultMessage: 'Your Scan is complete. You can view the list of results below.',
  },
  lastScannedOn: {
    id: 'course-authoring.course-optimizer.last-scanned-on',
    defaultMessage: 'Last scanned on',
  },
  scanHeader: {
    id: 'course-authoring.course-optimizer.scanHeader',
    defaultMessage: 'Scan results',
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
