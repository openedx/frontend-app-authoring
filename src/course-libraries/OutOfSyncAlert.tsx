import React, { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { Loop } from '@openedx/paragon/icons';
import AlertMessage from '../generic/alert-message';
import { useEntityLinksSummaryByDownstreamContext } from './data/apiHooks';
import messages from './messages';

interface OutOfSyncAlertProps {
  showAlert: boolean,
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>,
  courseId: string,
  onDismiss?: () => void;
  onReview: () => void;
}
/**
* Shows an alert when library components used in the current course were updated and the blocks
* in course can be updated. Following are the conditions for displaying the alert.
*
* * The alert is displayed if components are out of sync.
* * If the user clicks on dismiss button, the state is stored in localstorage of user
*   in this format: outOfSyncCountAlert-${courseId} = <number of out of sync components>.
* * If the number of sync components don't change for the course and the user opens outline
*   in the same browser, they don't see the alert again.
* * If the number changes, i.e., if a new component is out of sync or the user updates or ignores
*   a component, the alert is displayed again.
*/
export const OutOfSyncAlert: React.FC<OutOfSyncAlertProps> = ({
  showAlert,
  setShowAlert,
  courseId,
  onDismiss,
  onReview,
}) => {
  const intl = useIntl();
  const { data, isLoading } = useEntityLinksSummaryByDownstreamContext(courseId);
  const outOfSyncCount = data?.reduce((count, lib) => count + (lib.readyToSyncCount || 0), 0);
  const alertKey = `outOfSyncCountAlert-${courseId}`;

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (outOfSyncCount === 0) {
      localStorage.removeItem(alertKey);
      setShowAlert(false);
      return;
    }
    const dismissedAlert = localStorage.getItem(alertKey);
    setShowAlert(parseInt(dismissedAlert || '', 10) !== outOfSyncCount);
  }, [outOfSyncCount, isLoading, data]);

  const dismissAlert = () => {
    setShowAlert(false);
    localStorage.setItem(alertKey, String(outOfSyncCount));
    onDismiss?.();
  };

  return (
    <AlertMessage
      title={intl.formatMessage(messages.outOfSyncCountAlertTitle, { outOfSyncCount })}
      dismissible
      show={showAlert}
      icon={Loop}
      variant="info"
      onClose={dismissAlert}
      actions={[
        <Button
          onClick={onReview}
        >
          {intl.formatMessage(messages.outOfSyncCountAlertReviewBtn)}
        </Button>,
      ]}
    />
  );
};
