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
* * If the user clicks on dismiss button, the state of dismiss is stored in localstorage of user
*   in this format: outOfSyncCountAlert-${courseId} = <datetime value in milliseconds>.
* * If there are not new published components for the course and the user opens outline
*   in the same browser, they don't see the alert again.
* * If there is a new published component upstream, the alert is displayed again.
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
  const lastPublishedDate = data?.map(lib => new Date(lib.lastPublishedAt || 0).getTime())
    .reduce((acc, lastPublished) => Math.max(lastPublished, acc), 0);
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
    const dismissedAlertDate = parseInt(localStorage.getItem(alertKey) ?? '0', 10);

    setShowAlert((lastPublishedDate ?? 0) > dismissedAlertDate);
  }, [outOfSyncCount, lastPublishedDate, isLoading, data]);

  const dismissAlert = () => {
    setShowAlert(false);
    localStorage.setItem(alertKey, Date.now().toString());
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
