import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { HistoryContainerLog } from '../generic/history-log/HistoryLog';
import { useSidebarContext } from '../common/context/SidebarContext';

export const ContainerDetails = () => {
  const { sidebarItemInfo } = useSidebarContext();

  const usageKey = sidebarItemInfo?.id;

  return (
    <>
      <h4>
        <FormattedMessage {...messages.detailsTabHistoryHeading} />
      </h4>
      {usageKey && (
        <HistoryContainerLog
          containerId={usageKey}
        />
      )}
    </>
  );
};
