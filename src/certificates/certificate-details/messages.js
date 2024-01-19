import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  detailsSectionTitle: {
    id: 'course-authoring.certificates.details.section.title',
    defaultMessage: 'Certificate details',
  },
  detailsCourseTitle: {
    id: 'course-authoring.certificates.details.course.title',
    defaultMessage: 'Course title',
  },
  detailsCourseTitleOverride: {
    id: 'course-authoring.certificates.details.course.title.override',
    defaultMessage: 'Course title override',
  },
  detailsCourseTitleOverrideDescription: {
    id: 'course-authoring.certificates.details.course.title.override.description',
    defaultMessage: 'Specify an alternative to the official course title to display on certificates. Leave blank to use the official course title.',
  },
  detailsCourseNumber: {
    id: 'course-authoring.certificates.details.course.number',
    defaultMessage: 'Course number',
  },
  detailsCourseNumberOverride: {
    id: 'course-authoring.certificates.details.course.number.override',
    defaultMessage: 'Course number override',
  },
  deleteCertificateConfirmationTitle: {
    id: 'course-authoring.certificates.details.confirm-modal',
    defaultMessage: 'Delete this certificate?',
  },
  deleteCertificateMessage: {
    id: 'course-authoring.certificates.details.confirm-modal.message',
    defaultMessage: 'Deleting this certificate is permanent and cannot be undone.',
  },
  editCertificateConfirmationTitle: {
    id: 'course-authoring.certificates.details.confirm.edit',
    defaultMessage: 'Edit this certificate?',
  },
  editCertificateMessage: {
    id: 'course-authoring.certificates.details.confirm.edit.message',
    defaultMessage: 'This certificate has already been activated and is live. Are you sure you want to continue editing?',
  },
});

export default messages;
