import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import AlertError from '../../generic/alert-error';
import Loading from '../../generic/Loading';
import { useLibraryContext } from '../common/context';
import { useLibraryBlockMetadata } from '../data/apiHooks';
import HistoryWidget from '../generic/history-widget';
import { ComponentAdvancedInfo } from './ComponentAdvancedInfo';
import messages from './messages';

const ComponentDetails = () => {
  const intl = useIntl();

  const { sidebarComponentUsageKey: usageKey } = useLibraryContext();

  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  const {
    data: componentMetadata,
    isError,
    error,
    isLoading,
  } = useLibraryBlockMetadata(usageKey);

  if (isError) {
    return <AlertError error={error} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Stack gap={3}>
      <div>
        <h3 className="h5">
          {intl.formatMessage(messages.detailsTabUsageTitle)}
        </h3>
        <small>This will show the courses that use this component.</small>
      </div>
      <hr className="w-100" />
      <div>
        <h3 className="h5">
          {intl.formatMessage(messages.detailsTabHistoryTitle)}
        </h3>
        <HistoryWidget
          {...componentMetadata}
        />
      </div>
      <ComponentAdvancedInfo />
    </Stack>
  );
};

export default ComponentDetails;
