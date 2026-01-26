import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title1: {
    id: 'course-authoring.export.sidebar.title1',
    defaultMessage: 'Why export a course?',
  },
  description1: {
    id: 'course-authoring.export.sidebar.description1',
    defaultMessage: 'You may want to edit the XML in your course directly, outside of {studioShortName}. You may want to create a backup copy of your course. Or, you may want to create a copy of your course that you can later import into another course instance and customize.',
  },
  exportedContent: {
    id: 'course-authoring.export.sidebar.exportedContent',
    defaultMessage: 'What content is exported?',
  },
  exportedContentHeading: {
    id: 'course-authoring.export.sidebar.exportedContentHeading',
    defaultMessage: 'The following content is exported.',
  },
  content1: {
    id: 'course-authoring.export.sidebar.content1',
    defaultMessage: 'Course content and structure',
  },
  content2: {
    id: 'course-authoring.export.sidebar.content2',
    defaultMessage: 'Course dates',
  },
  content3: {
    id: 'course-authoring.export.sidebar.content3',
    defaultMessage: 'Grading policy',
  },
  content4: {
    id: 'course-authoring.export.sidebar.content4',
    defaultMessage: 'Any group configurations',
  },
  content5: {
    id: 'course-authoring.export.sidebar.content5',
    defaultMessage: 'Settings on the Advanced settings page, including MATLAB API keys and LTI passports',
  },
  notExportedContent: {
    id: 'course-authoring.export.sidebar.notExportedContent',
    defaultMessage: 'The following content is not exported.',
  },
  content6: {
    id: 'course-authoring.export.sidebar.content6',
    defaultMessage: 'Learner-specific content, such as learner grades and discussion forum data',
  },
  content7: {
    id: 'course-authoring.export.sidebar.content7',
    defaultMessage: 'The course team',
  },
  openDownloadFile: {
    id: 'course-authoring.export.sidebar.openDownloadFile',
    defaultMessage: 'Opening the downloaded file',
  },
  openDownloadFileDescription: {
    id: 'course-authoring.export.sidebar.openDownloadFileDescription',
    defaultMessage: 'Use an archive program to extract the data from the .tar.gz file. Extracted data includes the course.xml file, as well as subfolders that contain course content.',
  },
  learnMoreButtonTitle: {
    id: 'course-authoring.export.sidebar.learnMoreButtonTitle',
    defaultMessage: 'Learn more about exporting a course',
  },
});

export default messages;
