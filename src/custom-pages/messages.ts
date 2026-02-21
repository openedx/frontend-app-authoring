import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.custom-pages.heading',
    defaultMessage: 'Custom Pages',
  },
  errorAlertMessage: {
    id: 'course-authoring.custom-pages.errorAlert.message',
    defaultMessage: 'Unable to {actionName} page. Please try again.',
  },
  note: {
    id: 'course-authoring.custom-pages.note',
    defaultMessage: `Note: Pages are publicly visible. If users know the URL
      of a page, they can view the page even if they are not registered for
      or logged in to your course.`,
  },
  addPageHeaderLabel: {
    id: 'course-authoring.custom-pages.header.addPage.label',
    defaultMessage: 'New page',
  },
  viewLiveLabel: {
    id: 'course-authoring.custom-pages.header.viewLive.label',
    defaultMessage: 'View live',
  },
  pageExplanationHeader: {
    id: 'course-authoring.custom-pages.pageExplanation.header',
    defaultMessage: 'What are pages?',
  },
  pageExplanationBody: {
    id: 'course-authoring.custom-pages.pageExplanation.body',
    defaultMessage: `Pages are listed horizontally at the top of your course. Default pages (Home, Course, Discussion, Wiki, and Progress)
      are followed by textbooks and custom pages that you create.`,
  },
  customPagesExplanationHeader: {
    id: 'course-authoring.custom-pages.customPagesExplanation.header',
    defaultMessage: 'Custom pages',
  },
  customPagesExplanationBody: {
    id: 'course-authoring.custom-pages.customPagesExplanation.body',
    defaultMessage: `You can create and edit custom pages to provide students with additional course content. For example, you can create
      pages for the grading policy, course slide, and a course calendar.`,
  },
  studentViewExplanationHeader: {
    id: 'course-authoring.custom-pages.studentViewExplanation.header',
    defaultMessage: 'How do pages look to students in my course?',
  },
  studentViewExplanationBody: {
    id: 'course-authoring.custom-pages.studentViewExplanation.body',
    defaultMessage: 'Students see the default and custom pages at the top of your course and use the links to navigate.',
  },
  studentViewExampleButton: {
    id: 'course-authoring.custom-pages.studentViewExampleButton.label',
    defaultMessage: 'See an example',
  },
  studentViewModalTitle: {
    id: 'course-authoring.custom-pages.studentViewModal.title',
    defaultMessage: 'Pages in Your Course',
  },
  studentViewModalBody: {
    id: 'course-authoring.custom-pages.studentViewModal.Body',
    defaultMessage: "Pages appear in your course's top navigation bar. The default pages (Home, Course, Discussion, Wiki, and Progress) are followed by textbooks and custom pages.",
  },
  newPageTitle: {
    id: 'course-authoring.custom-pages.page.newPage.title',
    defaultMessage: 'Empty',
  },
  editTooltipContent: {
    id: 'course-authoring.custom-pages.editTooltip.content',
    defaultMessage: 'Edit',
  },
  deleteTooltipContent: {
    id: 'course-authoring.custom-pages.deleteTooltip.content',
    defaultMessage: 'Delete',
  },
  visibilityTooltipContent: {
    id: 'course-authoring.custom-pages.visibilityTooltip.content',
    defaultMessage: 'Hide/show page from learners',
  },
  addPageBodyLabel: {
    id: 'course-authoring.custom-pages.body.addPage.label',
    defaultMessage: 'Add a new page',
  },
  addingPageBodyLabel: {
    id: 'course-authoring.custom-pages.body.addingPage.label',
    defaultMessage: 'Adding a new page',
  },
  deleteConfirmationTitle: {
    id: 'course-authoring.custom-pages..deleteConfirmation.title',
    defaultMessage: 'Delete Page Confirmation',
  },
  deleteConfirmationMessage: {
    id: 'course-authoring.custom-pages..deleteConfirmation.message',
    defaultMessage: 'Are you sure you want to delete this page? This action cannot be undone.',
  },
  deletePageLabel: {
    id: 'course-authoring.custom-pages.deleteConfirmation.deletePage.label',
    defaultMessage: 'Delete',
  },
  deletingPageBodyLabel: {
    id: 'course-authoring.custom-pages.deleteConfirmation.deletingPage.label',
    defaultMessage: 'Deleting',
  },
  cancelButtonLabel: {
    id: 'course-authoring.custom-pages.deleteConfirmation.cancelButton.label',
    defaultMessage: 'Cancel',
  },
});

export default messages;
