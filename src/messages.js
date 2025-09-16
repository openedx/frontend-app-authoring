import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  connectionError: {
    id: 'authoring.alert.error.connection',
    defaultMessage: 'We encountered a technical error when loading this page. This might be a temporary issue, so please try again in a few minutes. If the problem persists, please go to the {supportLink} for help.',
    description: 'Error message shown to users when there is a connectivity issue with the server.',
  },
  supportText: {
    id: 'authoring.alert.support.text',
    defaultMessage: 'Support Page',
  },
  profile: {
    id: 'learning.navigation.profile.label',
    defaultMessage: 'Profile',
    description: 'The accessible label for profile navigation',
  },
  logOut: {
    id: 'learning.navigation.logOut.label',
    defaultMessage: 'Log out',
    description: 'The accessible label for log out navigation',
  },
  home: {
    id: 'learning.navigation.home.label',
    defaultMessage: 'Home',
    description: 'The accessible label for home navigation',
  },
  courses: {
    id: 'learning.navigation.courses.label',
    defaultMessage: 'Courses',
    description: 'The accessible label for courses navigation',
  },
  students: {
    id: 'learning.navigation.students.label',
    defaultMessage: 'Students',
    description: 'The accessible label for students navigation',
  },
  library: {
    id: 'learning.navigation.library.label',
    defaultMessage: 'Library',
    description: 'The accessible label for library navigation',
  },
});

export default messages;
