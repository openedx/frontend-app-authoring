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
  errorTitle: {
    id: 'course-authoring.export.modal.error.title',
    defaultMessage: 'There has been an error while exporting.',
  },
  errorDescriptionNotUnit: {
    id: 'course-authoring.export.modal.error.description.not.unit',
    defaultMessage: 'Your course could not be exported to XML. There is not enough information to identify the failed component. Inspect your course to identify any problematic components and try again. The raw error message is: {errorMessage}',
  },
  errorDescriptionUnit: {
    id: 'course-authoring.export.modal.error.description.unit',
    defaultMessage: 'There has been a failure to export to XML at least one component. It is recommended that you go to the edit page and repair the error before attempting another export. Please check that all components on the page are valid and do not display any error messages. The raw error message is: {errorMessage}',
  },
  errorCancelButtonUnit: {
    id: 'course-authoring.export.modal.error.button.cancel.unit',
    defaultMessage: 'Return to Export',
  },
  errorCancelButtonNotUnit: {
    id: 'course-authoring.export.modal.error.button.cancel.not.unit',
    defaultMessage: 'Cancel',
  },
  errorActionButtonNotUnit: {
    id: 'course-authoring.export.modal.error.button.action.not.unit',
    defaultMessage: 'Take me to the main course page',
  },
  errorActionButtonUnit: {
    id: 'course-authoring.export.modal.error.button.action.unit',
    defaultMessage: 'Correct failed component',
  },
});

export default messages;
