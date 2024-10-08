import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import AlertError from '../../generic/alert-error';
import Loading from '../../generic/Loading';
import { useLibraryBlockMetadata } from '../data/apiHooks';
import HistoryWidget from '../generic/history-widget';
import { ComponentAdvancedInfo } from './ComponentAdvancedInfo';
import messages from './messages';

interface ComponentDetailsProps {
  usageKey: string;
}

const ComponentDetails = ({ usageKey }: ComponentDetailsProps) => {
  const intl = useIntl();
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
      <ComponentAdvancedInfo usageKey={usageKey} />
    </Stack>
  );
};

export default ComponentDetails;
