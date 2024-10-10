import { Stack } from '@openedx/paragon';
import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';

import { useLibraryContext } from '../common/context';
import messages from './messages';
import LibraryPublishStatus from './LibraryPublishStatus';

const LibraryInfo = () => {
  const intl = useIntl();
  const { libraryData } = useLibraryContext();

  return (
    <Stack direction="vertical" gap={2.5}>
      <LibraryPublishStatus />
      <Stack gap={3} direction="vertical">
        <span className="font-weight-bold">
          {intl.formatMessage(messages.organizationSectionTitle)}
        </span>
        <span>
          {libraryData?.org}
        </span>
      </Stack>
      <Stack gap={3}>
        <span className="font-weight-bold">
          {intl.formatMessage(messages.libraryHistorySectionTitle)}
        </span>
        <Stack gap={1}>
          <span className="small text-gray-500">
            {intl.formatMessage(messages.lastModifiedLabel)}
          </span>
          <span className="small">
            <FormattedDate
              value={libraryData?.updated ?? undefined}
              year="numeric"
              month="long"
              day="2-digit"
            />
          </span>
        </Stack>
        <Stack gap={1}>
          <span className="small text-gray-500">
            {intl.formatMessage(messages.createdLabel)}
          </span>
          <span className="small">
            <FormattedDate
              value={libraryData?.created ?? undefined}
              year="numeric"
              month="long"
              day="2-digit"
            />
          </span>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LibraryInfo;
