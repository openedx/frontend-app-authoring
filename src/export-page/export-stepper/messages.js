import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  stepperPreparingTitle: {
    id: 'course-authoring.export.stepper.title.preparing',
    defaultMessage: 'Preparing',
  },
  stepperExportingTitle: {
    id: 'course-authoring.export.stepper.title.exporting',
    defaultMessage: 'Exporting',
  },
  stepperCompressingTitle: {
    id: 'course-authoring.export.stepper.title.compressing',
    defaultMessage: 'Compressing',
  },
  stepperSuccessTitle: {
    id: 'course-authoring.export.stepper.title.success',
    defaultMessage: 'Success',
  },
  stepperPreparingDescription: {
    id: 'course-authoring.export.stepper.description.preparing',
    defaultMessage: 'Preparing to start the export',
  },
  stepperExportingDescription: {
    id: 'course-authoring.export.stepper.description.exporting',
    defaultMessage: 'Creating the export data files (You can now leave this page safely, but avoid making drastic changes to content until this export is complete)',
  },
  stepperCompressingDescription: {
    id: 'course-authoring.export.stepper.description.compressing',
    defaultMessage: 'Compressing the exported data and preparing it for download',
  },
  stepperSuccessDescription: {
    id: 'course-authoring.export.stepper.description.success',
    defaultMessage: 'Your exported course can now be downloaded',
  },
  downloadCourseButtonTitle: {
    id: 'course-authoring.export.stepper.download.button.title',
    defaultMessage: 'Download exported course',
  },
  stepperHeaderTitle: {
    id: 'course-authoring.export.stepper.header.title',
    defaultMessage: 'Course export status',
  },
});

export default messages;
