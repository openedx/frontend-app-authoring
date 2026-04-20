import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import { useSidebarContext } from '../common/context/SidebarContext';
import { ComponentAdvancedInfo } from './ComponentAdvancedInfo';
import { ComponentUsage } from './ComponentUsage';
import messages from './messages';
import { HistoryComponentLog } from '../generic/history-log/HistoryLog';

const ComponentDetails = () => {
  const { sidebarItemInfo } = useSidebarContext();

  const usageKey = sidebarItemInfo?.id;

  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  return (
    <Stack gap={3}>
      <>
        <h3 className="h5">
          <FormattedMessage {...messages.detailsTabUsageTitle} />
        </h3>
        <ComponentUsage usageKey={usageKey} />
      </>
      <hr className="w-100" />
      <>
        <h3 className="h5">
          <FormattedMessage {...messages.detailsTabHistoryTitle} />
        </h3>
        <HistoryComponentLog
          componentId={usageKey}
        />
      </>
      <ComponentAdvancedInfo />
    </Stack>
  );
};

export default ComponentDetails;
