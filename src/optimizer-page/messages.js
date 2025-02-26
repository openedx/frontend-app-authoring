import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pageTitle: {
    id: 'course-authoring.course-optimizer.page.title',
    defaultMessage: '{headingTitle} | {courseName} | {siteName}',
  },
  headingTitle: {
    id: 'course-authoring.course-optimizer.heading.title',
    defaultMessage: 'Course Optimizer',
  },
  headingSubtitle: {
    id: 'course-authoring.course-optimizer.heading.subtitle',
    defaultMessage: 'Tools',
  },
  description1: {
    id: 'course-authoring.course-optimizer.description1',
    defaultMessage: `This tool will scan the published version of your course for broken links.
    Unpublished changes will not be included in the scan.
    Note that this process will take more time for larger courses.
    To update the scan after you have published new changes to your course,
    click the "Start Scanning" button again.
    `,
  },
  description2: {
    id: 'course-authoring.course-optimizer.description2',
    defaultMessage: 'Broken links are links pointing to external websites, images, or videos that do not exist or are no longer available. These links can cause issues for learners when they try to access the content.',
  },
  card1Title: {
    id: 'course-authoring.course-optimizer.card1.title',
    defaultMessage: 'Scan my course for broken links',
  },
  card2Title: {
    id: 'course-authoring.course-optimizer.card2.title',
    defaultMessage: 'Scan my course for broken links',
  },
  buttonTitle: {
    id: 'course-authoring.course-optimizer.button.title',
    defaultMessage: 'Start Scanning',
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
});

export default messages;
