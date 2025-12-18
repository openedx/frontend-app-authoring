import { useIntl } from "@edx/frontend-platform/i18n";
import { Button } from "@openedx/paragon";
import { useMemo, useState } from "react";
import { useCourseLegacyLibReadyToMigrateBlocks, useMigrateCourseLegacyLibReadyToMigrateBlocks } from "../course-outline/data/apiHooks"
import AlertMessage from "../generic/alert-message";
import LoadingButton from "../generic/loading-button";
import messages from "./messages";

interface Props {
  courseId: string,
}

const LegacyLibContentBlockAlert = ({ courseId }: Props) => {
  const intl = useIntl();
  const [taskId, setTaskId] = useState<string|null>(null);
  const { data, isPending } = useCourseLegacyLibReadyToMigrateBlocks(courseId);
  const { mutateAsync } = useMigrateCourseLegacyLibReadyToMigrateBlocks(courseId);

  const migrateFn = async () => {
    const taskId = await mutateAsync();
    setTaskId(taskId);
  }

  const alertCount = useMemo(() => data?.length || 0, [data]);

  if (isPending || taskId) {
    return null;
  }

  return (
    <AlertMessage
      title={intl.formatMessage(messages.legacyLibReadyToMigrateAlertTitle, { count: alertCount })}
      description={intl.formatMessage(messages.legacyLibReadyToMigrateAlertDescription)}
      show={alertCount > 0}
      variant="info"
      actions={[
        <Button
          onClick={() => {}}
          variant="tertiary"
        >
          {intl.formatMessage(messages.legacyLibReadyToMigrateAlertLearnMoreBtn)}
        </Button>,
        <LoadingButton
          onClick={migrateFn}
          label={intl.formatMessage(messages.legacyLibReadyToMigrateAlertActionBtn)}
        />,
      ]}
    />
  );
}

export default LegacyLibContentBlockAlert
