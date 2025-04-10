import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  modalTitle: {
    id: 'course-authoring.library-authoring.library-team.title',
    defaultMessage: 'Library Team',
    description: 'Title of the Library Team modal',
  },
  modalClose: {
    id: 'course-authoring.library-authoring.library-team.close',
    defaultMessage: 'Close',
    description: 'Title of the Library Team modal close button',
  },
  noMembersFound: {
    id: 'course-authoring.library-authoring.library-team.no-members',
    defaultMessage: 'This library\'s team has no members yet.',
    description: 'Text to show in the Library Team modal if no team members are found for this library.',
  },
  addTeamMemberButton: {
    id: 'course-authoring.library-authoring.library-team.add-member',
    defaultMessage: 'New team member',
    descriptior: 'Title of the Library Team modal "Add member" button',
  },
  allowPublicReadLabel: {
    id: 'course-authoring.library-authoring.library-team.allow-public-read',
    defaultMessage: 'Allow public read',
    descriptior: 'Title of the Library Team modal "Allow public read" on/off switch',
  },
  allowPublicReadHelperText: {
    id: 'course-authoring.library-authoring.library-team.allow-public-read-helper',
    defaultMessage: 'Allows anyone with Studio access to view this library and use its content in their courses.',
    descriptior: 'Helper text for the Library Team modal "Allow public read" on/off switch',
  },
  addMemberFormTitle: {
    id: 'course-authoring.library-authoring.add-member-form.title',
    defaultMessage: 'Add a user to your library\'s team',
    description: 'Title of the Library Team modal "Add member" form',
  },
  addMemberFormEmailLabel: {
    id: 'course-authoring.library-authoring.add-member-form.email-label',
    defaultMessage: 'User\'s email address',
    description: 'Label for the email field in the Library Team modal "Add member" form',
  },
  addMemberFormEmailPlaceholder: {
    id: 'course-authoring.library-authoring.add-member-form.email-placeholder',
    defaultMessage: 'example: {email}',
    description: 'Placeholder text for the email field in the Library Team modal "Add member" form',
  },
  addMemberFormEmailHelperText: {
    id: 'course-authoring.library-authoring.add-member-form.email-helper-text',
    defaultMessage: 'Provide the email address of the user you want to add',
    description: 'Helper text for the email field in the Library Team modal "Add member" form',
  },
  addMemberFormSubmitButton: {
    id: 'course-authoring.library-authoring.library-team.save-member',
    defaultMessage: 'Add Member',
    description: 'Title of the Submit button on the Library Team modal "Add member" form',
  },
  cancelButton: {
    id: 'course-authoring.library-authoring.library-team.cancel',
    defaultMessage: 'Cancel',
    description: 'Title of the Cancel button on the Library Team modal "Add member" form',
  },
  deleteMember: {
    id: 'course-authoring.library-authoring.library-team.delete-member',
    defaultMessage: 'Delete team member',
    description: 'Title of the Library Team modal "Delete member" button',
  },
  cannotChangeRoleSingleAdmin: {
    id: 'course-authoring.library-authoring.library-team.cannot-changerole-single-admin',
    defaultMessage: 'Promote another member to Admin to change this user\'s access rights.',
    description: (
      'Shown to Library Admins if there\'s only one Admin in the Team,'
      + ' explaining why this member cannot be changed yet.'
    ),
  },
  makeMemberAdmin: {
    id: 'course-authoring.library-authoring.library-team.make-member-admin',
    defaultMessage: 'Make Admin',
    description: 'Title of the Library Team modal button to give a member an Admin role',
  },
  makeMemberAuthor: {
    id: 'course-authoring.library-authoring.library-team.make-member-author',
    defaultMessage: 'Make Author',
    description: 'Title of the Library Team modal button to give a member an Author role',
  },
  makeMemberReader: {
    id: 'course-authoring.library-authoring.library-team.make-member-reader',
    defaultMessage: 'Make Reader',
    description: 'Title of the Library Team modal button to give a member an Read-Only role',
  },
  roleAdmin: {
    id: 'course-authoring.library-authoring.library-team.admin-role',
    defaultMessage: 'Admin',
    description: 'Label to use for the "Administrator" Library role',
  },
  roleAuthor: {
    id: 'course-authoring.library-authoring.library-team.author-role',
    defaultMessage: 'Author',
    description: 'Label to use for the "Author" Library role',
  },
  roleReader: {
    id: 'course-authoring.library-authoring.library-team.read-only-role',
    defaultMessage: 'Read Only',
    description: 'Label to use for the "Read Only" Library role',
  },
  roleUnknown: {
    id: 'course-authoring.library-authoring.library-team.unknown-role',
    defaultMessage: 'Unknown',
    description: 'Label to use for an unknown Library role',
  },
  roleYou: {
    id: 'course-authoring.library-authoring.library-team.you-role',
    defaultMessage: 'You!',
    description: 'Label to use when labeling the current user\'s Library role',
  },
  addMemberSuccess: {
    id: 'course-authoring.library-authoring.library-team.add-member-success',
    defaultMessage: 'Team Member added',
    description: 'Message shown when a Library Team member is successfully added',
  },
  addMemberError: {
    id: 'course-authoring.library-authoring.library-team.add-member-error',
    defaultMessage: 'Error adding Team Member',
    description: 'Message shown when an error occurs while adding a Library Team member',
  },
  addMemberSpecificError: {
    id: 'course-authoring.library-authoring.library-team.add-member-specific-error',
    defaultMessage: 'Error adding Team Member. {message}',
    description: 'Message shown when an error occurs while adding a Library Team member, including a specific error message.',
  },
  deleteMemberSuccess: {
    id: 'course-authoring.library-authoring.library-team.delete-member-success',
    defaultMessage: 'Team Member deleted',
    description: 'Message shown when a Library Team member is successfully deleted',
  },
  deleteMemberError: {
    id: 'course-authoring.library-authoring.library-team.delete-member-error',
    defaultMessage: 'Error deleting Team Member',
    description: 'Message shown when an error occurs while updating a Library Team member',
  },
  updateMemberSuccess: {
    id: 'course-authoring.library-authoring.library-team.update-member-success',
    defaultMessage: 'Team Member updated',
    description: 'Message shown when a Library Team member is successfully updated',
  },
  updateMemberError: {
    id: 'course-authoring.library-authoring.library-team.update-member-error',
    defaultMessage: 'Error updating Team Member',
    description: 'Message shown when an error occurs while updating a Library Team member',
  },
  updateLibrarySuccess: {
    id: 'course-authoring.library-authoring.library-team.update-library-success',
    defaultMessage: 'Library updated',
    description: 'Message shown when a Library\'s metadata is successfully updated',
  },
  updateLibraryError: {
    id: 'course-authoring.library-authoring.library-team.update-library-error',
    defaultMessage: 'Error updating Library',
    description: 'Message shown when an error occurs while updating a Library\'s metadata',
  },
});

export default messages;
