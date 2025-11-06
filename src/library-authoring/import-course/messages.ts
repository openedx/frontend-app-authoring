import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pageTitle: {
    id: 'course-authoring.library-authoring.import-course.title',
    defaultMessage: 'Import',
    description: 'Title for the library import course',
  },
  pageSubtitle: {
    id: 'course-authoring.library-authoring.import-course.subtitle',
    defaultMessage: 'Tools',
    description: 'Subtitle for the library import course',
  },
  emptyStateText: {
    id: 'course-authoring.library-authoring.import-course.empty-state.text',
    defaultMessage: 'You have not imported any courses into this library.',
    description: 'Text for the empty state of the library import course',
  },
  emptyStateButtonText: {
    id: 'course-authoring.library-authoring.import-course.empty-state.button.text',
    defaultMessage: 'Import Course',
    description: 'Text for the  button to import a course into the library',
  },
  courseImportPreviousImports: {
    id: 'course-authoring.library-authoring.import-course.previous-imports',
    defaultMessage: 'Previous Imports',
    description: 'Title for the list of previous imports',
  },
  courseImportTextProgress: {
    id: 'course-authoring.library-authoring.import-course.course.text',
    defaultMessage: '% Imported',
    description: 'Text for the course import state',
  },
  courseImportTextFailed: {
    id: 'course-authoring.library-authoring.import-course.course.text-failed',
    defaultMessage: 'Import Failed',
    description: 'Text for the course import failed state',
  },
  helpAndSupportTitle: {
    id: 'course-authoring.library-authoring.import-course.help-and-support.title',
    defaultMessage: 'Help & Support',
    description: 'Title of the Help & Support sidebar',
  },
  helpAndSupportFirstQuestionTitle: {
    id: 'course-authoring.library-authoring.import-course.help-and-support.q1.title',
    defaultMessage: 'Why import a course?',
    description: 'Title of the first question in the Help & Support sidebar',
  },
  helpAndSupportFirstQuestionBody: {
    id: 'course-authoring.library-authoring.import-course.help-and-support.q1.body',
    defaultMessage: '<p>You can import existing courses into a library in order to reference '
    + 'course content across courses.</p>'
    + '<p>Courses with content you or others may want to reuse or reference in the future are '
    + 'excellent candidates for import.</p>',
    description: 'Body of the first question in the Help & Support sidebar',
  },
  helpAndSupportSecondQuestionTitle: {
    id: 'course-authoring.library-authoring.import-course.help-and-support.q2.title',
    defaultMessage: 'What content is imported?',
    description: 'Title of the second question in the Help & Support sidebar',
  },
  helpAndSupportSecondQuestionBody: {
    id: 'course-authoring.library-authoring.import-course.help-and-support.q2.body',
    defaultMessage: '<p>You can select a course to import and decide whether to import all sections, '
    + 'subsections, units, or blocks from this course.</p>'
    + '<p>Not all courses content types can be imported, but this page will convey the status of imports '
    + 'and share any import errors found while importing your course.</p>'
    + '<p>For additional details you can review the Library Import documentation.</p>',
    description: 'Body of the second question in the Help & Support sidebar',
  },
});

export default messages;
