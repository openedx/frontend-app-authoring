import React, { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { Loop } from '@openedx/paragon/icons';
import _ from 'lodash';
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
/*
Shows an alert when library components used in the current course were updated and the blocks in course can be updated.
Dismiss or review action is persisted using localStorage to avoid displaying the alert on every refresh.
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
  const outOfSyncCount = data?.reduce((count, lib) => count += lib.readyToSyncCount, 0);
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

  const reviewAlert = () => {
    dismissAlert();
    onReview();
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
          onClick={reviewAlert}
        >
          {intl.formatMessage(messages.outOfSyncCountAlertReviewBtn)}
        </Button>,
      ]}
    />
  );
};
