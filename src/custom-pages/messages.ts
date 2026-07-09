import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.custom-pages.heading',
    defaultMessage: 'Custom Pages',
    description: 'Heading for the custom pages page.',
  },
  errorAlertMessage: {
    id: 'course-authoring.custom-pages.errorAlert.message',
    defaultMessage: 'Unable to {actionName} page. Please try again.',
    description: 'Error message shown when a page action fails.',
  },
  note: {
    id: 'course-authoring.custom-pages.note',
    defaultMessage: `Note: Pages are publicly visible. If users know the URL
      of a page, they can view the page even if they are not registered for
      or logged in to your course.`,
    description: 'Note explaining that pages are publicly visible.',
  },
  addPageHeaderLabel: {
    id: 'course-authoring.custom-pages.header.addPage.label',
    defaultMessage: 'New page',
    description: 'Header label for adding a new page.',
  },
  viewLiveLabel: {
    id: 'course-authoring.custom-pages.header.viewLive.label',
    defaultMessage: 'View live',
    description: 'Label for the link to view the live page.',
  },
  pageExplanationHeader: {
    id: 'course-authoring.custom-pages.pageExplanation.header',
    defaultMessage: 'What are pages?',
    description: 'Heading for the pages explanation section.',
  },
  pageExplanationBody: {
    id: 'course-authoring.custom-pages.pageExplanation.body',
    defaultMessage: `Pages are listed horizontally at the top of your course. Default pages (Home, Course, Discussion, Wiki, and Progress)
      are followed by textbooks and custom pages that you create.`,
    description: 'Body text explaining where pages appear in a course.',
  },
  customPagesExplanationHeader: {
    id: 'course-authoring.custom-pages.customPagesExplanation.header',
    defaultMessage: 'Custom pages',
    description: 'Heading for the custom pages explanation section.',
  },
  customPagesExplanationBody: {
    id: 'course-authoring.custom-pages.customPagesExplanation.body',
    defaultMessage: `You can create and edit custom pages to provide students with additional course content. For example, you can create
      pages for the grading policy, course slide, and a course calendar.`,
    description: 'Body text explaining what custom pages can be used for.',
  },
  studentViewExplanationHeader: {
    id: 'course-authoring.custom-pages.studentViewExplanation.header',
    defaultMessage: 'How do pages look to students in my course?',
    description: 'Heading for the student view explanation section.',
  },
  studentViewExplanationBody: {
    id: 'course-authoring.custom-pages.studentViewExplanation.body',
    defaultMessage: 'Students see the default and custom pages at the top of your course and use the links to navigate.',
    description: 'Body text explaining how students see course pages.',
  },
  studentViewExampleButton: {
    id: 'course-authoring.custom-pages.studentViewExampleButton.label',
    defaultMessage: 'See an example',
    description: 'Label for the button that opens the student view example.',
  },
  studentViewModalTitle: {
    id: 'course-authoring.custom-pages.studentViewModal.title',
    defaultMessage: 'Pages in Your Course',
    description: 'Title for the student view example modal.',
  },
  studentViewModalBody: {
    id: 'course-authoring.custom-pages.studentViewModal.Body',
    defaultMessage: 'Pages appear in your course\'s top navigation bar. The default pages (Home, Course, Discussion, Wiki, and Progress) are followed by textbooks and custom pages.',
    description: 'Body text for the student view example modal.',
  },
  newPageTitle: {
    id: 'course-authoring.custom-pages.page.newPage.title',
    defaultMessage: 'Empty',
    description: 'Default title for a newly created page.',
  },
  editTooltipContent: {
    id: 'course-authoring.custom-pages.editTooltip.content',
    defaultMessage: 'Edit',
    description: 'Tooltip text for the edit page action.',
  },
  deleteTooltipContent: {
    id: 'course-authoring.custom-pages.deleteTooltip.content',
    defaultMessage: 'Delete',
    description: 'Tooltip text for the delete page action.',
  },
  visibilityTooltipContent: {
    id: 'course-authoring.custom-pages.visibilityTooltip.content',
    defaultMessage: 'Hide/show page from learners',
    description: 'Tooltip text for toggling page visibility for learners.',
  },
  addPageBodyLabel: {
    id: 'course-authoring.custom-pages.body.addPage.label',
    defaultMessage: 'Add a new page',
    description: 'Body label for adding a new page.',
  },
  addingPageBodyLabel: {
    id: 'course-authoring.custom-pages.body.addingPage.label',
    defaultMessage: 'Adding a new page',
    description: 'Body label shown while adding a new page.',
  },
  deleteConfirmationTitle: {
    id: 'course-authoring.custom-pages..deleteConfirmation.title',
    defaultMessage: 'Delete Page Confirmation',
    description: 'Title for the delete page confirmation dialog.',
  },
  deleteConfirmationMessage: {
    id: 'course-authoring.custom-pages..deleteConfirmation.message',
    defaultMessage: 'Are you sure you want to delete this page? This action cannot be undone.',
    description: 'Message for the delete page confirmation dialog.',
  },
  deletePageLabel: {
    id: 'course-authoring.custom-pages.deleteConfirmation.deletePage.label',
    defaultMessage: 'Delete',
    description: 'Label for the button confirming page deletion.',
  },
  deletingPageBodyLabel: {
    id: 'course-authoring.custom-pages.deleteConfirmation.deletingPage.label',
    defaultMessage: 'Deleting',
    description: 'Label shown while a page is being deleted.',
  },
  cancelButtonLabel: {
    id: 'course-authoring.custom-pages.deleteConfirmation.cancelButton.label',
    defaultMessage: 'Cancel',
    description: 'Label for the cancel button in the delete confirmation dialog.',
  },
  contentBreadcrumbLabel: {
    id: 'course-authoring.custom-pages.breadcrumb.content.label',
    defaultMessage: 'Content',
    description: 'Breadcrumb label for the content section.',
  },
  pagesAndResourcesBreadcrumbLabel: {
    id: 'course-authoring.custom-pages.breadcrumb.pagesAndResources.label',
    defaultMessage: 'Pages and Resources',
    description: 'Breadcrumb label for the pages and resources section.',
  },
});

export default messages;
