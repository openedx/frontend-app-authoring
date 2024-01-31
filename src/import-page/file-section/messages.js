import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.import.file-section.title',
    defaultMessage: 'Select a .tar.gz file to replace your course content',
  },
  fileChosen: {
    id: 'course-authoring.import.file-section.chosen-file',
    defaultMessage: 'File chosen: {fileName}',
  },
  viewOnlyAlert: {
    id: 'course-authoring.import.file-section.view-only-alert',
    defaultMessage: 'You have view only access to this page. If you feel you should have full access, please reach out to your course team admin to be given access.',
  },
});

export default messages;
