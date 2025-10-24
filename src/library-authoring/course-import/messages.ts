import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  importCourseModalTitle: {
    id: 'library-authoring.import-course.modal.title',
    defaultMessage: 'Import Course to Library',
    description: 'Title for the modal to import a course into a library.',
  },
  importCourseButton: {
    id: 'library-authoring.import-course.button.text',
    defaultMessage: 'Import Course',
    description: 'Label of the button to open the modal to import a course into a library.',
  },
  importCourseSelectCourseStep: {
    id: 'library-authoring.import-course.select-course.title',
    defaultMessage: 'Select Course',
    description: 'Title for the step to select course in the modal to import a course into a library.',
  },
  importCourseReviewDetailsStep: {
    id: 'library-authoring.import-course.review-details.title',
    defaultMessage: 'Review Import Details',
    description: 'Title for the step to review import details in the modal to import a course into a library.',
  },
  importCourseCalcel: {
    id: 'library-authoring.import-course.cancel.text',
    defaultMessage: 'Cancel',
    description: 'Label of the button to cancel the course import.',
  },
  importCourseNext: {
    id: 'library-authoring.import-course.next.text',
    defaultMessage: 'Next step',
    description: 'Label of the button go to the next step in the course import modal.',
  },
  importCourseBack: {
    id: 'library-authoring.import-course.back.text',
    defaultMessage: 'Back',
    description: 'Label of the button to go to the previous step in the course import modal.',
  },
  importCourseInProgressStatusTitle: {
    id: 'library-authoring.import-course.review-details.in-progress.title',
    defaultMessage: 'Import Analysis in Progress',
    description: 'Titile for the info card with the in-progress status in the course import modal.',
  },
  importCourseInProgressStatusBody: {
    id: 'library-authoring.import-course.review-details.in-progress.body',
    defaultMessage: '{courseName} is being analyzed for review prior to import. For large courses, this may take some time.'
                  + ' Please remain on this page.',
    description: 'Body of the info card with the in-progress status in the course import modal.',
  },
  importCourseAnalysisSummary: {
    id: 'library-authoring.import-course.review-details.analysis-symmary.title',
    defaultMessage: 'Analysis Summary',
    description: 'Title of the card for the analysis summary of a imported course.',
  },
  importCourseTotalBlocks: {
    id: 'library-authoring.import-course.review-details.analysis-symmary.total-blocks',
    defaultMessage: 'Total Blocks',
    description: 'Label title for the total blocks in the analysis summary of a imported course.',
  },
  importCourseSections: {
    id: 'library-authoring.import-course.review-details.analysis-symmary.sections',
    defaultMessage: 'Sections',
    description: 'Label title for the number of sections in the analysis summary of a imported course.',
  },
  importCourseSubsections: {
    id: 'library-authoring.import-course.review-details.analysis-symmary.subsections',
    defaultMessage: 'Subsections',
    description: 'Label title for the number of subsections in the analysis summary of a imported course.',
  },
  importCourseUnits: {
    id: 'library-authoring.import-course.review-details.analysis-symmary.units',
    defaultMessage: 'Units',
    description: 'Label title for the number of units in the analysis summary of a imported course.',
  },
  importCourseComponents: {
    id: 'library-authoring.import-course.review-details.analysis-symmary.components',
    defaultMessage: 'Components',
    description: 'Label title for the number of components in the analysis summary of a imported course.',
  },
  importCourseDetailsTitle: {
    id: 'library-authoring.import-course.review-details.import-details.title',
    defaultMessage: 'Import Details',
    description: 'Title of the card for the import details of a imported course.',
  },
  importCourseDetailsLoadingBody: {
    id: 'library-authoring.import-course.review-details.import-details.loading.body',
    defaultMessage: 'The selected course is being analyzed for import and review',
    description: 'Body of the card in loading state for the import details of a imported course.',
  },
});

export default messages;
