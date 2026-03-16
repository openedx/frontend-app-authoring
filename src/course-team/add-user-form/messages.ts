import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  formTitle: {
    id: 'course-authoring.course-team.form.title',
    defaultMessage: 'Add a user to your course\'s team',
  },
  formLabel: {
    id: 'course-authoring.course-team.form.label',
    defaultMessage: 'User\'s email address',
  },
  formPlaceholder: {
    id: 'course-authoring.course-team.form.placeholder',
    defaultMessage: 'example: {email}',
  },
  formHelperText: {
    id: 'course-authoring.course-team.form.helperText',
    defaultMessage: 'Provide the email address of the user you want to add as Staff',
  },
  addUserButton: {
    id: 'course-authoring.course-team.form.button.addUser',
    defaultMessage: 'Add user',
  },
  cancelButton: {
    id: 'course-authoring.course-team.form.button.cancel',
    defaultMessage: 'Cancel',
  },

});

export default messages;
