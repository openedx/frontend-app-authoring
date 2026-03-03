import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.course-team.headingTitle',
    defaultMessage: 'Course team',
  },
  headingSubtitle: {
    id: 'course-authoring.course-team.subTitle',
    defaultMessage: 'Settings',
  },
  addNewMemberButton: {
    id: 'course-authoring.course-team.button.new-team-member',
    defaultMessage: 'New team member',
  },
  unknownError: {
    id: 'course-authoring.course-team.error.unknown',
    defaultMessage: 'An unexpected error occurred. Please try again.',
    description: 'Fallback error message shown when the API returns an error in an unexpected format.',
  },
});

export default messages;
