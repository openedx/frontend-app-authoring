import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.studio-home.verify-email.heading',
    defaultMessage: 'Thanks for signing up, {username}!',
  },
  bannerTitle: {
    id: 'course-authoring.studio-home.verify-email.banner.title',
    defaultMessage: 'We need to verify your email address',
  },
  bannerDescription: {
    id: 'course-authoring.studio-home.verify-email.banner.description',
    defaultMessage: 'Almost there! In order to complete your sign up we need you to verify your email address ({email}). An activation message and next steps should be waiting for you there.',
  },
  sidebarTitle: {
    id: 'course-authoring.studio-home.verify-email.sidebar.title',
    defaultMessage: 'Need help?',
  },
  sidebarDescription: {
    id: 'course-authoring.studio-home.verify-email.sidebar.description',
    defaultMessage: 'Please check your Junk or Spam folders in case our email isn\'t in your INBOX. Still can\'t find the verification email? Request help via the link below.',
  },
});

export default messages;
