import React, { useEffect } from "react";
import { useIntl } from "@edx/frontend-platform/i18n";
import { Button } from "@openedx/paragon";
import { Loop } from "@openedx/paragon/icons";
import AlertMessage from "../generic/alert-message";
import { useEntityLinksByDownstreamContext } from "./data/apiHooks";
import messages from "./messages";
import _ from "lodash";

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
const OutOfSyncAlert: React.FC<OutOfSyncAlertProps> = ({
  showAlert,
  setShowAlert,
  courseId,
  onDismiss,
  onReview,
}) => {
  const intl = useIntl();
  const { data, isLoading } = useEntityLinksByDownstreamContext(courseId, true);
  const outOfSyncCount = data?.length;
  const idList = data?.map((o) => `${o.id}:${o.upstreamVersion}`);
  const alertKey = "outOfSyncCountAlert";

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (outOfSyncCount === 0) {
      localStorage.removeItem(alertKey);
      setShowAlert(false);
      return;
    }
    const dismissedIds: string[] = JSON.parse(localStorage.getItem(alertKey) || '[]');
    setShowAlert(_.without(idList, ...dismissedIds).length > 0);
  }, [outOfSyncCount, isLoading])


  const dismissAlert = () => {
    setShowAlert(false);
    localStorage.setItem(alertKey, JSON.stringify(idList));
    onDismiss?.();
  }

  const reviewAlert = () => {
    dismissAlert();
    onReview();
  }

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


export default OutOfSyncAlert;
