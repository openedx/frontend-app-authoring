import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.studio-login-redirect.title',
    defaultMessage: 'Sign in to Studio again',
    description: 'Title of the dialog shown when the user has to sign in again before Studio can load or save changes.',
  },
  signedOutDescription: {
    id: 'course-authoring.studio-login-redirect.description.signed-out',
    defaultMessage: 'Your Studio session has ended, so this page cannot load or save changes. '
      + 'Sign in in a new tab, then come back to this one to continue where you left off.',
    description: 'Body of the dialog shown when the user has to sign in again before Studio can load or save changes.',
  },
  signingInDescription: {
    id: 'course-authoring.studio-login-redirect.description.signing-in',
    defaultMessage: 'Finish signing in in the new tab, then come back to this one.',
    description: 'Body of the sign-in dialog after the user opened the sign-in page in a new tab.',
  },
  checkingDescription: {
    id: 'course-authoring.studio-login-redirect.description.checking',
    defaultMessage: 'Checking that you are signed in…',
    description: 'Body of the sign-in dialog while it checks whether the user signed in.',
  },
  stillSignedOutDescription: {
    id: 'course-authoring.studio-login-redirect.description.still-signed-out',
    defaultMessage: 'You are not signed in yet. Select Sign in to sign in in a new tab, then come back to this one.',
    description: 'Body of the sign-in dialog when the user came back without signing in.',
  },
  cancelButton: {
    id: 'course-authoring.studio-login-redirect.button.cancel',
    defaultMessage: 'Cancel',
    description: 'Button that closes the sign-in dialog without signing in. Changes that could not be saved stay unsaved.',
  },
  signInButton: {
    id: 'course-authoring.studio-login-redirect.button.sign-in',
    defaultMessage: 'Sign in',
    description: 'Button that opens the Studio sign-in page in a new tab.',
  },
  continueButton: {
    id: 'course-authoring.studio-login-redirect.button.continue',
    defaultMessage: 'Continue',
    description: 'Button the user selects after signing in in the other tab, to load and save changes again.',
  },
});

export default messages;
