import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  deleteModalTitle: {
    id: 'course-authoring.course-team.member.button.remove',
    defaultMessage: 'Delete course team member',
  },
  deleteModalMessage: {
    id: 'course-authoring.course-team.delete-modal.message',
    defaultMessage: 'Are you sure you want to delete {email} from the course team for “{courseName}”?',
  },
  deleteModalDeleteButton: {
    id: 'course-authoring.course-team.delete-modal.button.delete',
    defaultMessage: 'Delete',
  },
  deleteModalCancelButton: {
    id: 'course-authoring.course-team.delete-modal.button.cancel',
    defaultMessage: 'Cancel',
  },
  errorModalTitle: {
    id: 'course-authoring.course-team.error-modal.title',
    defaultMessage: 'Error adding user',
  },
  errorModalOkButton: {
    id: 'course-authoring.course-team.error-modal.button.ok',
    defaultMessage: 'Ok',
  },
  warningModalTitle: {
    id: 'course-authoring.course-team.warning-modal.title',
    defaultMessage: 'Already a course team member',
  },
  warningModalMessage: {
    id: 'course-authoring.course-team.warning-modal.message',
    defaultMessage: '{email} is already on the {courseName} team. Recheck the email address if you want to add a new member.',
  },
  warningModalReturnButton: {
    id: 'course-authoring.course-team.warning-modal.button.return',
    defaultMessage: 'Return to team listing',
  },
});

export default messages;
