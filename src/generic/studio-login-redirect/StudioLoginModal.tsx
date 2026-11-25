import { useSyncExternalStore } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, AlertModal, Button, Hyperlink } from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';

import {
  type SignInPromptStatus,
  cancelSignIn,
  continueAfterSignIn,
  getSignInPromptStatus,
  getStudioLoginUrl,
  startSignIn,
  subscribeToSignInPrompt,
} from '.';
import messages from './messages';

const descriptions: Record<Exclude<SignInPromptStatus, 'closed'>, typeof messages[keyof typeof messages]> = {
  signedOut: messages.signedOutDescription,
  signingIn: messages.signingInDescription,
  checking: messages.checkingDescription,
  stillSignedOut: messages.stillSignedOutDescription,
};

/**
 * Asks the user to sign in to Studio again when the background sign-in could not restore the Studio
 * session. The login opens in a new tab, so this page and its unsaved changes stay; the held requests
 * are sent once the user is back and signed in.
 */
const StudioLoginModal = () => {
  const intl = useIntl();
  const status = useSyncExternalStore(subscribeToSignInPrompt, getSignInPromptStatus);

  if (status === 'closed') {
    return null;
  }

  const isChecking = status === 'checking';

  return (
    <AlertModal
      title={intl.formatMessage(messages.title)}
      isOpen
      // Only the Cancel button closes it: an Escape or a click outside would drop a pending save by accident.
      isBlocking
      variant="warning"
      icon={Warning}
      footerNode={
        <ActionRow>
          <Button variant="tertiary" onClick={cancelSignIn} disabled={isChecking}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          {!isChecking && (
            <Button
              as={Hyperlink}
              variant={status === 'signedOut' ? 'primary' : 'outline-primary'}
              destination={getStudioLoginUrl()}
              target="_blank"
              showLaunchIcon={false}
              onClick={startSignIn}
            >
              {intl.formatMessage(messages.signInButton)}
            </Button>
          )}
          {status !== 'signedOut' && (
            <Button onClick={continueAfterSignIn} disabled={isChecking}>
              {intl.formatMessage(messages.continueButton)}
            </Button>
          )}
        </ActionRow>
      }
    >
      <p aria-live="polite">{intl.formatMessage(descriptions[status])}</p>
    </AlertModal>
  );
};

export default StudioLoginModal;
