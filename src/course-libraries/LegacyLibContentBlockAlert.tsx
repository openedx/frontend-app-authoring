import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Hyperlink } from '@openedx/paragon';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import {
  useCheckMigrateCourseLegacyLibReadyToMigrateBlocksOptions,
  useCourseLegacyLibReadyToMigrateBlocks,
  useMigrateCourseLegacyLibReadyToMigrateBlocks,
} from '@src/course-outline/data/apiHooks';
import { UserTaskStatus } from '@src/data/constants';
import AlertMessage from '@src/generic/alert-message';
import LoadingButton from '@src/generic/loading-button';
import { ToastContext } from '@src/generic/toast-context';
import messages from './messages';

interface Props {
  courseId: string,
}

const LegacyLibContentBlockAlert = ({ courseId }: Props) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const { data, isPending, refetch } = useCourseLegacyLibReadyToMigrateBlocks(courseId);
  const { mutateAsync } = useMigrateCourseLegacyLibReadyToMigrateBlocks(courseId);
  const taskStatus = useCheckMigrateCourseLegacyLibReadyToMigrateBlocksOptions(courseId, taskId);
  const learnMoreUrl = 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/migrate_legacy_libraries.html#id8';

  useEffect(() => {
    if (taskStatus.data?.state === UserTaskStatus.Succeeded) {
      showToast(intl.formatMessage(messages.legacyLibReadyToMigrateTaskCompleted));
      setTaskId(undefined);
      refetch();
    } else if (taskStatus.data?.state === UserTaskStatus.Failed
      || taskStatus.data?.state === UserTaskStatus.Cancelled) {
      showToast(intl.formatMessage(messages.legacyLibReadyToMigrateTaskFailed));
      setTaskId(undefined);
      refetch();
    } else if (taskId) {
      showToast(intl.formatMessage(messages.legacyLibReadyToMigrateTaskInProgress));
    }
  }, [taskStatus, taskId, refetch]);

  const migrateFn = async () => {
    await mutateAsync(undefined, {
      onSuccess: (result) => {
        setTaskId(result.uuid);
      },
      onError: () => {
        setTaskId(undefined);
      },
    });
  };

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
          target="_blank"
          as={Hyperlink}
          variant="tertiary"
          showLaunchIcon={false}
          destination={learnMoreUrl}
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
};

export default LegacyLibContentBlockAlert;
