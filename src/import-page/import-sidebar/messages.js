import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title1: {
    id: 'course-authoring.import.sidebar.title1',
    defaultMessage: 'Why import a course?',
  },
  description1: {
    id: 'course-authoring.import.sidebar.description1',
    defaultMessage: 'You may want to run a new version of an existing course, or replace an existing course altogether. Or, you may have developed a course outside {studioShortName}.',
  },
  importedContent: {
    id: 'course-authoring.import.sidebar.importedContent',
    defaultMessage: 'What content is imported?',
  },
  importedContentHeading: {
    id: 'course-authoring.import.sidebar.importedContentHeading',
    defaultMessage: 'The following content is imported.',
  },
  content1: {
    id: 'course-authoring.import.sidebar.content1',
    defaultMessage: 'Course content and structure',
  },
  content2: {
    id: 'course-authoring.import.sidebar.content2',
    defaultMessage: 'Course dates',
  },
  content3: {
    id: 'course-authoring.import.sidebar.content3',
    defaultMessage: 'Grading policy',
  },
  content4: {
    id: 'course-authoring.import.sidebar.content4',
    defaultMessage: 'Any group configurations',
  },
  content5: {
    id: 'course-authoring.import.sidebar.content5',
    defaultMessage: 'Settings on the advanced settings page, including MATLAB API keys and LTI passports',
  },
  notImportedContent: {
    id: 'course-authoring.import.sidebar.notImportedContent',
    defaultMessage: 'The following content is not exported.',
  },
  content6: {
    id: 'course-authoring.import.sidebar.content6',
    defaultMessage: 'Learner-specific content, such as learner grades and discussion forum data',
  },
  content7: {
    id: 'course-authoring.import.sidebar.content7',
    defaultMessage: 'The course team',
  },
  warningTitle: {
    id: 'course-authoring.import.sidebar.warningTitle',
    defaultMessage: 'Warning: importing while a course is running',
  },
  warningDescription: {
    id: 'course-authoring.import.sidebar.warningDescription',
    defaultMessage: 'If you perform an import while your course is running, and you change the URL names (or url_name nodes) of any problem components, the student data associated with those problem components may be lost. This data includes students\' problem scores.',
  },
  learnMoreButtonTitle: {
    id: 'course-authoring.import.sidebar.learnMoreButtonTitle',
    defaultMessage: 'Learn more about importing a course',
  },
});

export default messages;
