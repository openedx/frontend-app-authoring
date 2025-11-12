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
  courseImportNavigateAlt: {
    id: 'course-authoring.library-authoring.import-course.course.navigate-alt',
    defaultMessage: 'Navigate to course',
    description: 'Alt text for the course import navigate button',
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
  importCourseStepperTitle: {
    id: 'course-authoring.library-authoring.import-course.stepper.title',
    defaultMessage: 'Import Course to Library',
    description: 'Title for the modal to import a course into a library.',
  },
  importCourseButton: {
    id: 'course-authoring.library-authoring.import-course.button.text',
    defaultMessage: 'Import Course',
    description: 'Label of the button to open the modal to import a course into a library.',
  },
  importCourseSelectCourseStep: {
    id: 'course-authoring.library-authoring.import-course.stepper.select-course.title',
    defaultMessage: 'Select Course',
    description: 'Title for the step to select course in the modal to import a course into a library.',
  },
  importCourseReviewDetailsStep: {
    id: 'course-authoring.library-authoring.import-course.stepper.review-details.title',
    defaultMessage: 'Review Import Details',
    description: 'Title for the step to review import details in the modal to import a course into a library.',
  },
  importCourseCalcel: {
    id: 'course-authoring.library-authoring.import-course.stepper.cancel.text',
    defaultMessage: 'Cancel',
    description: 'Label of the button to cancel the course import.',
  },
  importCourseNext: {
    id: 'course-authoring.library-authoring.import-course.stepper.next.text',
    defaultMessage: 'Next step',
    description: 'Label of the button go to the next step in the course import modal.',
  },
  importCourseBack: {
    id: 'course-authoring.library-authoring.import-course.stepper.back.text',
    defaultMessage: 'Back',
    description: 'Label of the button to go to the previous step in the course import modal.',
  },
  importCourseInProgressStatusTitle: {
    id: 'course-authoring.library-authoring.import-course.review-details.in-progress.title',
    defaultMessage: 'Import Analysis in Progress',
    description: 'Titile for the info card with the in-progress status in the course import modal.',
  },
  importCourseInProgressStatusBody: {
    id: 'course-authoring.library-authoring.import-course.review-details.in-progress.body',
    defaultMessage: '{courseName} is being analyzed for review prior to import. For large courses, this may take some time.'
                  + ' Please remain on this page.',
    description: 'Body of the info card with the in-progress status in the course import modal.',
  },
  importCourseAnalysisSummary: {
    id: 'course-authoring.library-authoring.import-course.review-details.analysis-symmary.title',
    defaultMessage: 'Analysis Summary',
    description: 'Title of the card for the analysis summary of a imported course.',
  },
  importCourseTotalBlocks: {
    id: 'course-authoring.library-authoring.import-course.review-details.analysis-symmary.total-blocks',
    defaultMessage: 'Total Blocks',
    description: 'Label title for the total blocks in the analysis summary of a imported course.',
  },
  importCourseSections: {
    id: 'course-authoring.library-authoring.import-course.review-details.analysis-symmary.sections',
    defaultMessage: 'Sections',
    description: 'Label title for the number of sections in the analysis summary of a imported course.',
  },
  importCourseSubsections: {
    id: 'course-authoring.library-authoring.import-course.review-details.analysis-symmary.subsections',
    defaultMessage: 'Subsections',
    description: 'Label title for the number of subsections in the analysis summary of a imported course.',
  },
  importCourseUnits: {
    id: 'course-authoring.library-authoring.import-course.review-details.analysis-symmary.units',
    defaultMessage: 'Units',
    description: 'Label title for the number of units in the analysis summary of a imported course.',
  },
  importCourseComponents: {
    id: 'course-authoring.library-authoring.import-course.review-details.analysis-symmary.components',
    defaultMessage: 'Components',
    description: 'Label title for the number of components in the analysis summary of a imported course.',
  },
  importCourseDetailsTitle: {
    id: 'course-authoring.library-authoring.import-course.review-details.import-details.title',
    defaultMessage: 'Analysis Details',
    description: 'Title of the card for the analysis details of a imported course.',
  },
  importCourseDetailsLoadingBody: {
    id: 'course-authoring.library-authoring.import-course.review-details.import-details.loading.body',
    defaultMessage: 'The selected course is being analyzed for import and review',
    description: 'Body of the card in loading state for the import details of a imported course.',
  },
  previouslyImported: {
    id: 'course-authoring.library-authoring.import-course.course-list.card.previously-imported.text',
    defaultMessage: 'Previously Imported',
    description: 'Chip that indicates that the course has been previously imported.',
  },
  importCourseAnalysisCompleteAllContentTitle: {
    id: 'library-authoring.import-course.review-details.in-progress.title',
    defaultMessage: 'Import Analysis Complete',
    description: 'Title of the info card when course import analysis is complete and all data can be imported.',
  },
  importCourseAnalysisCompleteAllContentBody: {
    id: 'library-authoring.import-course.review-details.analysis-complete.100.body',
    defaultMessage: 'All course content will imported into a collection in your library called {courseName}. See details below.',
    description: 'Body of the info card when course import analysis is complete and all data can be imported.',
  },
  importCourseAnalysisCompleteSomeContentTitle: {
    id: 'library-authoring.import-course.review-details.in-progress.title',
    defaultMessage: 'Import Analysis Complete',
    description: 'Title of the info card when course import analysis is complete and some data can be imported.',
  },
  importCourseAnalysisCompleteSomeContentBody: {
    id: 'library-authoring.import-course.review-details.analysis-complete.100.body',
    defaultMessage: '{unsupportedBlockPercentage}% of content cannot be imported. For details see below.',
    description: 'Body of the info card when course import analysis is complete and some data can be imported.',
  },
  importCourseAnalysisDetailsUnsupportedBlocksBody: {
    id: 'library-authoring.import-course.review-details.analysis-details.unsupportedBlocks.body',
    defaultMessage: 'The following block types cannot be imported into your library because they\'re are not yet supported. These block types will be replaced with a placeholder block in the library. For more information, reference the Help & Support sidebar.',
    description: 'Body of analysis details when some unsupported blocks are present',
  },
  importCourseComponentsUnsupportedInfo: {
    id: 'library-authoring.import-course.review-details.analysis-summary.components.unsupportedInfo',
    defaultMessage: '{count, plural, one {{count} block} other {{count} blocks}} unsupported',
    description: 'Message to display on hovering over info icon near components number for unsupported blocks',
  },
  importCourseAnalysisDetails: {
    id: 'library-authoring.import-course.review-details.analysis-details.title',
    defaultMessage: 'Analysis Details',
    description: 'Title of the card for the analysis details of a imported course.',
  },
  importCourseAnalysisCompleteReimportTitle: {
    id: 'library-authoring.import-course.review-details.analysis-complete.reimport.title',
    defaultMessage: 'Import Analysis Completed: Reimport',
    description: 'Title of the info card when course import analysis is complete and it was already imported before.',
  },
  importCourseAnalysisCompleteReimportBody: {
    id: 'library-authoring.import-course.review-details.analysis-complete.reimport.body',
    defaultMessage: '{courseName} has already been imported into the Library "{libraryName}". If this secion is re-imported, all Sections, Subsections, Units and Content Blocks will be reimported again.',
    description: 'Body of the info card when course import analysis is complete and it was already imported before.',
  },
  importCourseCompleteToastMessage: {
    id: 'library-authoring.import-course.complete-import.in-progress.toast.message',
    defaultMessage: '{courseName} is being migrated.',
    description: 'Toast message that indicates a course is being migrated',
  },
  importCourseCompleteFailedToastMessage: {
    id: 'library-authoring.import-course.complete-import.failed.toast.message',
    defaultMessage: '{courseName} migration failed.',
    description: 'Toast message that indicates course migration failed.',
  },
});

export default messages;
