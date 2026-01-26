import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pageTitle: {
    id: 'course-authoring.export.page.title',
    defaultMessage: '{headingTitle} | {courseName} | {siteName}',
  },
  headingTitle: {
    id: 'course-authoring.export.heading.title',
    defaultMessage: 'Course export',
  },
  headingSubtitle: {
    id: 'course-authoring.export.heading.subtitle',
    defaultMessage: 'Tools',
  },
  description1: {
    id: 'course-authoring.export.description1',
    defaultMessage: 'You can export courses and edit them outside of {studioShortName}. The exported file is a .tar.gz file (that is, a .tar file compressed with GNU Zip) that contains the course structure and content. You can also re-import courses that you\'ve exported.',
  },
  description2: {
    id: 'course-authoring.export.description2',
    defaultMessage: 'Caution: When you export a course, information such as MATLAB API keys, LTI passports, annotation secret token strings, and annotation storage URLs are included in the exported data. If you share your exported files, you may also be sharing sensitive or license-specific information.',
  },
  titleUnderButton: {
    id: 'course-authoring.export.title-under-button',
    defaultMessage: 'Export my course content',
  },
  buttonTitle: {
    id: 'course-authoring.export.button.title',
    defaultMessage: 'Export course content',
  },
});

export default messages;
