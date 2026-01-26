import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  roleAdmin: {
    id: 'course-authoring.course-team.member.role.admin',
    defaultMessage: 'Admin',
  },
  roleStaff: {
    id: 'course-authoring.course-team.member.role.staff',
    defaultMessage: 'Staff',
  },
  roleYou: {
    id: 'course-authoring.course-team.member.role.you',
    defaultMessage: 'You!',
  },
  hint: {
    id: 'course-authoring.course-team.member.hint',
    defaultMessage: 'Promote another member to Admin to remove your admin rights',
  },
  addButton: {
    id: 'course-authoring.course-team.member.button.add',
    defaultMessage: 'Add admin access',
  },
  removeButton: {
    id: 'course-authoring.course-team.member.button.remove-admin-access',
    defaultMessage: 'Remove admin access',
  },
  deleteUserButton: {
    id: 'course-authoring.course-team.member.button.delete',
    defaultMessage: 'Delete user',
  },
});

export default messages;
