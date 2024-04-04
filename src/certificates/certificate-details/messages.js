import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  detailsSectionTitle: {
    id: 'course-authoring.certificates.details.section.title',
    defaultMessage: 'Certificate details',
    description: 'Title for the section',
  },
  detailsCourseTitle: {
    id: 'course-authoring.certificates.details.course.title',
    defaultMessage: 'Course title',
    description: 'Label for displaying the official course title in the certificate details section',
  },
  detailsCourseTitleOverride: {
    id: 'course-authoring.certificates.details.course.title.override',
    defaultMessage: 'Course title override',
    description: 'Label for the course title override input field',
  },
  detailsCourseTitleOverrideDescription: {
    id: 'course-authoring.certificates.details.course.title.override.description',
    defaultMessage: 'Specify an alternative to the official course title to display on certificates. Leave blank to use the official course title.',
    description: 'Helper text under the course title override input field',
  },
  detailsCourseNumber: {
    id: 'course-authoring.certificates.details.course.number',
    defaultMessage: 'Course number',
    description: 'Label for displaying the official course number in the certificate details section',
  },
  detailsCourseNumberOverride: {
    id: 'course-authoring.certificates.details.course.number.override',
    defaultMessage: 'Course number override',
    description: 'Label for the course number override input field',
  },
  deleteCertificateConfirmationTitle: {
    id: 'course-authoring.certificates.details.confirm-modal',
    defaultMessage: 'Delete this certificate?',
    description: 'Title for the confirmation modal when a user attempts to delete a certificate',
  },
  deleteCertificateMessage: {
    id: 'course-authoring.certificates.details.confirm-modal.message',
    defaultMessage: 'Deleting this certificate is permanent and cannot be undone.',
    description: 'Warning message within the delete confirmation modal, emphasizing the permanent nature of the action',
  },
  editCertificateConfirmationTitle: {
    id: 'course-authoring.certificates.details.confirm.edit',
    defaultMessage: 'Edit this certificate?',
    description: 'Title for the confirmation modal when a user attempts to edit an already activated (live) certificate',
  },
  editCertificateMessage: {
    id: 'course-authoring.certificates.details.confirm.edit.message',
    defaultMessage: 'This certificate has already been activated and is live. Are you sure you want to continue editing?',
    description: 'Message warning users about the implications of editing a certificate that is already live, prompting for confirmation',
  },
});

export default messages;
