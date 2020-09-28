import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'library.access.loading.message': {
    id: 'library.access.loading.message',
    defaultMessage: 'Loading...',
    description: 'Message when data is being loaded',
  },
  'library.access.page.parent_heading': {
    id: 'library.access.page.parent_heading',
    defaultMessage: 'Settings',
    description: 'Small text heading above the main title for the access page',
  },
  'library.access.page.heading': {
    id: 'library.access.page.heading',
    defaultMessage: 'User Access',
    description: 'Title of user access settings page',
  },
  'library.access.aside.title': {
    id: 'library.access.aside.title',
    defaultMessage: 'Library Access Roles',
    description: 'Header for the aside description of the access page.',
  },
  'library.access.aside.text.first': {
    id: 'library.access.aside.text.first',
    defaultMessage: 'There are three access roles for libraries: User, Staff, and Admin.',
    description: 'The first paragraph of detail text on user access roles.',
  },
  'library.access.aside.text.second': {
    id: 'library.access.aside.text.second',
    defaultMessage: 'Library Users can view library content and can reference or use library components in their '
      + 'courses, but they cannot edit the contents of a library.',
    description: 'The second paragraph of detail text on user access roles.',
  },
  'library.access.aside.text.third': {
    id: 'library.access.aside.text.third',
    defaultMessage: 'Library Staff are content co-authors. They have full editing privileges on the contents '
      + 'of a library.',
    description: 'The third paragraph of detail text on user access roles.',
  },
  'library.access.aside.text.fourth': {
    id: 'library.access.aside.text.fourth',
    defaultMessage: 'Library Admins have full editing privileges and can also add and remove other team members. '
      + 'There must be at least one user with the Admin role in a library.',
    description: 'The fourth paragraph of detail text on user access roles.',
  },
  'library.access.new.user': {
    id: 'library.access.new.user',
    defaultMessage: 'New Team Member',
    description: 'Button text for adding a new user to the library access roles.',
  },
  'library.access.well.title': {
    id: 'library.access.well.title',
    defaultMessage: 'Add More Users to This Library',
    description: 'Title for the "call to action" well on the bottom of the page.',
  },
  'library.access.well.text': {
    id: 'library.access.well.text',
    defaultMessage: 'Grant other members of your course team access to this library. New library users must have an '
      + 'active Studio account.',
    description: 'Text for the "call to action" well on the bottom of the page.',
  },
  'library.access.well.button': {
    id: 'library.access.well.button',
    defaultMessage: 'Add a New User',
    description: 'Text for the button in the "call to action" well on the bottom of the page.',
  },
  'library.access.form.title': {
    id: 'library.access.form.title',
    defaultMessage: 'Grant Access to this Library',
    description: 'Help text for the email field.',
  },
  'library.access.form.email.help': {
    id: 'library.access.form.email.help',
    defaultMessage: 'Provide the email address of the user you want to add',
    description: 'Help text for the email field.',
  },
  'library.access.form.email.label': {
    id: 'library.access.form.email.label',
    defaultMessage: 'Email',
    description: 'Label for the email field.',
  },
  'library.access.form.email.placeholder': {
    id: 'library.access.form.email.placeholder',
    defaultMessage: 'example: username@domain.com',
    description: 'Placeholder text for the email field.',
  },
  'library.access.form.button.submit': {
    id: 'library.access.form.button.submit',
    defaultMessage: 'Submit',
    description: 'Submit button text',
  },
  'library.access.form.button.submitting': {
    id: 'library.access.form.button.submitting',
    defaultMessage: 'Submitting...',
    description: 'Submit button text when currently submitting',
  },
  'library.access.info.admin_unlock': {
    id: 'library.access.info.admin_unlock',
    defaultMessage: 'Promote another member to Admin to remove this user\'s admin rights',
    description: 'Instructions given for removing your own admin privileges.',
  },
  'library.access.info.self': {
    id: 'library.access.info.self',
    defaultMessage: 'You!',
    description: 'Short indicator that the user being viewed is the viewer.',
  },
  'library.access.info.admin': {
    id: 'library.access.info.admin',
    defaultMessage: 'Admin',
    description: 'Label for the admin access level.',
  },
  'library.access.info.author': {
    id: 'library.access.info.author',
    defaultMessage: 'Author',
    description: 'Label for the author access level.',
  },
  'library.access.info.read': {
    id: 'library.access.info.read',
    defaultMessage: 'Read Only',
    description: 'Label for the read only access level.',
  },
  'library.access.user.add_admin': {
    id: 'library.access.user.add_admin',
    defaultMessage: 'Add Admin Access',
    description: 'Label for button that grants a user admin access.',
  },
  'library.access.user.remove_admin': {
    id: 'library.access.user.remove_admin',
    defaultMessage: 'Remove Admin Access',
    description: 'Label for button that removes a user\'s admin access.',
  },
  'library.access.user.add_author': {
    id: 'library.access.user.add_author',
    defaultMessage: 'Add Author Access',
    description: 'Label for button that grants a user author access.',
  },
  'library.access.user.remove_author': {
    id: 'library.access.user.remove_author',
    defaultMessage: 'Remove Author Access',
    description: 'Label for button that removes a user\'s author access level.',
  },
  'library.access.user.remove_user': {
    id: 'library.access.user.remove_user',
    defaultMessage: 'Remove user',
    description: 'Label for button that removes a user from a library entirely. Screen-reader only.',
  },
  'library.access.modal.remove.title': {
    id: 'library.access.modal.remove.title',
    defaultMessage: 'Are you sure?',
    description: 'Title for user removal confirmation modal',
  },
  'library.access.modal.remove.body': {
    id: 'library.access.modal.remove.body',
    defaultMessage: 'Are you sure you want to delete {email} from the library "{library}"?',
    description: 'Body of user removal confirmation modal.',
  },
  'library.access.modal.remove_admin.title': {
    id: 'library.access.modal.remove_admin.title',
    defaultMessage: 'Are you sure?',
    description: 'Title for user admin privilege removal confirmation modal',
  },
  'library.access.modal.remove_admin.body': {
    id: 'library.access.modal.remove_admin.body',
    defaultMessage: 'Are you sure you want to revoke admin privileges for {email} from the library "{library}"?',
    description: 'Body of user admin privilege removal confirmation modal.',
  },
});

export default messages;
